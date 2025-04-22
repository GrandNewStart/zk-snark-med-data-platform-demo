import { Router, Request, Response } from "express";
import { dataRequestStore, proofs } from "../db";
import path from "path";
import * as snarkjs from 'snarkjs';
import fs from 'fs';

const router = Router()

router.post('/:id', async (req: Request, res: Response)=>{
    const proof_id = req.params.id
    if (!proof_id) {
        res.status(400).json({ error: 'Missing required fields'})
        return
    }
    const matchingProof = proofs.find((e)=>e.id === proof_id)
    if (!matchingProof) {
        res.status(404).json({ error: 'Proof not found'})
        return
    }
    const matchingDataRequest = dataRequestStore.find((e)=>e.id === matchingProof.data_request_id)
    if (!matchingDataRequest) {
        res.status(404).json({ error: 'Data Request not found'})
        return
    }
    const proof_path = path.join(__dirname, '../..', 'proofs', proof_id, 'proof.json')
    const vkey_path = path.join(__dirname, '../..', 'proofs', proof_id, 'verification_key.json')
    const public_path = path.join(__dirname, '../..', 'circuits', matchingProof.data_request_id, 'public.json')
    try {
        const vKey = JSON.parse(fs.readFileSync(vkey_path, 'utf-8'))
        const publicSignals = JSON.parse(fs.readFileSync(public_path, 'utf-8'))
        const proof = JSON.parse(fs.readFileSync(proof_path, 'utf-8')).proof

        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
        if (!isValid) {
          throw new Error('Invalid proof')
        }
        res.status(200).json({ message: `proof verified for ${proof_id}` })
      } catch (err) {
        console.error('[POST /verify]',err);
        res.status(500).json({ error: 'Verification process failed' });
      }
})

export default router