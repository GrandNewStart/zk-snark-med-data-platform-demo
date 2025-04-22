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
  const circuitCompiledDir = path.join(rootDir, 'circuits')
  const proofsDir = path.join(rootDir, 'proofs')
  const setupDir = path.join(rootDir, 'trusted_setup')

  // Clear setups
  if (fs.existsSync(setupDir)) {
    fs.rmSync(setupDir, { recursive: true, force: true })
    fs.mkdirSync(setupDir)
  }

  // Clear circuits
  if (fs.existsSync(circuitCompiledDir)) {
    fs.rmSync(circuitCompiledDir, { recursive: true, force: true })
    fs.mkdirSync(circuitCompiledDir)
  }

  // Clear proofs
  if (fs.existsSync(proofsDir)) {
    fs.rmSync(proofsDir, { recursive: true, force: true })
    fs.mkdirSync(proofsDir)
  }

  // Generate trusted setup
  const bn128 = await buildBn128()
  const setup1 = path.join(setupDir, 'setup_1.ptau')
  const setup2 = path.join(setupDir, 'setup_2.ptau')
  const setup3 = path.join(setupDir, 'setup_3.ptau')
  const setupFinal = path.join(setupDir, 'setup_final.ptau')
  await powersOfTau.newAccumulator(bn128, 10, setup1)
  await powersOfTau.contribute(setup1, setup2, 'First contribution', 'random')
  await powersOfTau.contribute(setup2, setup3, 'Second contribution', 'entropy')
  await powersOfTau.preparePhase2(setup3, setupFinal)
  
  console.log('Environment initialized.')
}

initializeEnvironment().then(() => {
  app.listen(3001, () => {
    console.log('Server running on http://localhost:3001')
  })
})