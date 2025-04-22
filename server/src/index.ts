import express from 'express'
import dataRequestRoutes from './routes/data_request_routes'
import dataResponseRoutes from './routes/data_response_routes'
import verifyRoutes from './routes/verify_routes'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { powersOfTau, zKey } from 'snarkjs'
const { buildBn128 } = require('ffjavascript')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/data-request', dataRequestRoutes)
app.use('/data-response', dataResponseRoutes)
app.use('/verify', verifyRoutes)

async function initializeEnvironment() {
  const rootDir = path.join(__dirname, '..')
  const circuitCompiledDir = path.join(rootDir, 'circuits', 'compiled')
  const proofsDir = path.join(rootDir, 'proofs')

  // Clear circuits/compiled
  if (fs.existsSync(circuitCompiledDir)) {
    fs.rmSync(circuitCompiledDir, { recursive: true, force: true })
    fs.mkdirSync(circuitCompiledDir)
  }

  // Clear proofs
  if (fs.existsSync(proofsDir)) {
    fs.rmSync(proofsDir, { recursive: true, force: true })
    fs.mkdirSync(proofsDir)
  }

  // Delete old ptau files
  const files = fs.readdirSync(rootDir)
  for (const file of files) {
    if (file.endsWith('.ptau')) {
      fs.unlinkSync(path.join(rootDir, file))
    }
  }

  // Generate trusted setup
  const bn128 = await buildBn128()
  await powersOfTau.newAccumulator(bn128, 10, 'setup_1.ptau')
  await powersOfTau.contribute('setup_1.ptau', 'setup_2.ptau', 'First contribution', 'random')
  await powersOfTau.contribute('setup_2.ptau', 'setup_3.ptau', 'Second contribution', 'entropy')
  await powersOfTau.preparePhase2('setup_3.ptau', 'setup_final.ptau')
  
  console.log('Environment initialized.')
}

initializeEnvironment().then(() => {
  app.listen(3001, () => {
    console.log('Server running on http://localhost:3001')
  })
})