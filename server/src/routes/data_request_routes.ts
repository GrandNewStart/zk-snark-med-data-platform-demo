import { Router, Request, Response } from 'express'
import { execSync } from 'child_process'
import util from 'util'
import { exec } from 'child_process'
const execPromise = util.promisify(exec)
import { ensureDir } from 'fs-extra'
import { DataRequestDTO } from '../dto/data_request.dto'
import { DataRequest } from '../models/data_request'
import { dataRequestStore } from '../db'
import path from 'path'
import fs from 'fs'

const router = Router()

/**
 * POST data-request
 * 
 * - creates circuit & proof-generation files
 * - creates & stores Circuit entity
 * - creates & stores DataRequest entity
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('[POST /data-request]',req.body)
  const { user_id, data_type, min, max, leq, geq } = req.body as DataRequestDTO

  if (!user_id || !data_type || min === null || max === null || !leq || !geq) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  // Create data request instance
  const newRequest = new DataRequest(user_id, data_type, min, max, leq, geq)

  // Create circuit directory
  const circuitDir = path.join(__dirname, '../..', 'circuits', 'compiled', newRequest.id)
  await ensureDir(circuitDir)

  // Create public.json
  fs.writeFileSync(path.join(circuitDir, 'public.json'), JSON.stringify({min, max}));

  // Prepare circuit generation
  const circomPath = path.join(__dirname, '../..', 'circuits', 'templates', 'range_proof.circom')

  // Generate circuit
  try {
    const { stdout, stderr } = await execPromise(`circom ${circomPath} --r1cs --wasm --sym -o ${circuitDir}`)
    console.log('[POST /data-request] stdout:', stdout)
    console.error('[POST /data-request] stderr:', stderr)
    console.log(`[POST /data-request] Compiled circuit for ${newRequest.id}`)
  } catch (err) {
    console.error('[POST /data-request] Circom compilation failed:', err)
    res.status(500).json({ error: 'Circuit compilation failed' })
    return
  }

  // Store data request
  dataRequestStore.push(newRequest)

  res.status(201).json({ 
    data_request_id: newRequest.id, 
    exp_date: newRequest.exp_date 
  })
})

/**
 * GET data-request/{id}
 * 
 * - returns DataRequest entity
 */
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const request = dataRequestStore.find((entry) => entry.id === id)

  if (!request) {
    res.status(404).json({ error: 'DataRequest not found' })
  }

  res.status(200).json(request)
})

export default router