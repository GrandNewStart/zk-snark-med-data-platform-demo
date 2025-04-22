import { Router, Request, Response } from 'express'
import { DataResponseDTO } from '../dto/data_response.dto'
import { dataRequestStore, proofs } from '../db'
import { Proof } from '../models/proof'
import { execSync } from 'child_process'
import { ensureDir } from 'fs-extra'
import path from 'path'
import fs, { readFileSync } from 'fs'
import * as snarkjs from 'snarkjs'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { data_request_id, user_id, value } = req.body as DataResponseDTO

  if (!dataRequestStore || !user_id || !value) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  // Find DataRequest
  const matchingRequest = dataRequestStore.find((entry) => entry.id === data_request_id)
  if (!matchingRequest) {
    res.status(400).json({ error: 'Invalid DataRequest ID' })
    return
  }
  const circuitDir = path.join(__dirname, '../..', 'circuits', matchingRequest.id)

  // Create Proof instance & directory
  const newProof = new Proof(matchingRequest.id, user_id)
  const proofDir = path.join(__dirname, '../..', 'proofs', newProof.id)
  await ensureDir(proofDir)

  // Generate witness
  const public_path = path.join(circuitDir, 'public.json')
  const input_path = path.join(proofDir, 'input.json')
  const witness_path = path.join(proofDir, 'witness.wtns')
  try {
    fs.writeFileSync(input_path, JSON.stringify({x:value, min:matchingRequest.min, max:matchingRequest.max}))
    const gen_code_path = path.join(circuitDir, 'range_proof_js/generate_witness.js')
    const wasm_path = path.join(circuitDir, 'range_proof_js/range_proof.wasm')
    execSync(`node ${gen_code_path} ${wasm_path} ${input_path} ${witness_path}`)
    console.log(`[POST /data-response] Generated witness for ${matchingRequest.id}`)
  } catch (err) {
    console.error('[POST /data-response] Witness generation failed:', err)
    res.status(500).json({ error: 'Witness generation failed' })
    return
  } finally {
    fs.unlink(input_path, ()=>{})
  }

  // Generate zkey
  const setup_path = path.join(__dirname, '../../trusted_setup', 'setup_final.ptau')
  const circuit_path = path.join(circuitDir, 'range_proof.r1cs')
  const zkey_path = path.join(proofDir, 'range_proof.zkey')
  const vkey_path = path.join(proofDir, 'verification_key.json')
  try {
    await snarkjs.zKey.newZKey(circuit_path, setup_path, zkey_path)
    const stats = fs.statSync(zkey_path)
    if (stats.size === 0) {
      throw new Error('Generated zkey file is empty')
    }
    console.log(`[POST /data-response] Key generated for ${newProof.id}`)
  } catch (err) {
    console.error('[POST /data-response] key generation failed:', err)
    res.status(500).json({ error: 'Key generation failed' })
    return
  }

  // Export verification key 
  try {
    const vKey = await snarkjs.zKey.exportVerificationKey(fs.readFileSync(zkey_path))
    fs.writeFileSync(vkey_path, JSON.stringify(vKey, null, 2))
    const stats = fs.statSync(vkey_path)
    if (stats.size === 0) {
      throw new Error('Generated verification key is empty')
    }
    console.log(`[POST /data-response] Verification key exported for ${newProof.id}`)
  } catch (err) {
    console.error('[POST /data-response] Verification key export failed:', err)
    res.status(500).json({ error: 'Verification key export failed' })
    return
  }

  // Generate proof
  const proof_path = path.join(proofDir, 'proof.json')
  try {
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      fs.readFileSync(zkey_path),
      fs.readFileSync(witness_path)
    )
    fs.writeFileSync(proof_path, JSON.stringify({ proof, publicSignals }, null, 2))
    console.log(`[POST /data-response] Generated proof for ${matchingRequest.id}`)
  } catch(err) {
    console.error('[POST /data-response] Proof generation failed:', err)
    res.status(500).json({ error: 'Proof generation failed' })
    return
  }
  proofs.push(newProof)

  res.status(200).json({ proof_id: newProof.id })
})

router.get('/:id', async (req: Request, res: Response)=>{
  const data_request_id = req.params.id
  if (!data_request_id) {
    res.status(400).json({ error: 'Missing required fields'})
    return
  }

  const matchingProofs = proofs.filter((entry)=>entry.data_request_id == data_request_id)
  const result = matchingProofs.map((entry)=>{
    const id = entry.id
    const proof_path = path.join(__dirname, '../..', 'proofs', id, 'proof.json')
    const vkey_path = path.join(__dirname, '../..', 'proofs', id, 'verification_key.json')
    const proof_data = readFileSync(proof_path, 'utf-8')
    const proof_json = JSON.parse(proof_data)
    const vkey_data = readFileSync(vkey_path, 'utf-8')
    const vkey_json = JSON.parse(vkey_data)
    return {
      id: id,
      proof: proof_json,
      key: vkey_json,
      user_id: entry.user_id,
      created_at: entry.created_at
    }
  })

  res.status(200).json({
    proofs: result
  })
})

export default router