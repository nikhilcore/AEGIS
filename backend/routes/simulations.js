
import express from 'express'
import { pool } from '../db/pool.js'

const router = express.Router()

const allowedSeverities = ['Low', 'Medium', 'High', 'Critical']

// ============================================
// GET ALL SIMULATIONS
// ============================================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          s.*,
          a.name AS target_asset_name
       FROM simulations s
       LEFT JOIN assets a ON a.id = s.target_asset_id
       ORDER BY s.started_at DESC`
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      simulations: result.rows,
    })
  } catch (error) {
    console.error('Error fetching simulations:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve simulations.',
    })
  }
})

// ============================================
// GET SIMULATION BY ID
// ============================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT
          s.*,
          a.name AS target_asset_name
       FROM simulations s
       LEFT JOIN assets a ON a.id = s.target_asset_id
       WHERE s.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Simulation not found.',
      })
    }

    res.json({
      status: 'success',
      simulation: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching simulation:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve simulation.',
    })
  }
})

// ============================================
// CREATE SIMULATION
// ============================================

router.post('/', async (req, res) => {
  try {
    const {
      scenario_id,
      scenario_name,
      target_asset_id,
      severity,
    } = req.body

    if (
      !scenario_id ||
      !scenario_name ||
      !target_asset_id ||
      !severity
    ) {
      return res.status(400).json({
        status: 'error',
        message:
          'scenario_id, scenario_name, target_asset_id and severity are required.',
      })
    }

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid severity.',
      })
    }

    // Validate asset
    const assetCheck = await pool.query(
      'SELECT id FROM assets WHERE id = $1',
      [target_asset_id]
    )

    if (assetCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Target asset does not exist.',
      })
    }

    // Prevent multiple active simulations in the database
    const activeCheck = await pool.query(
      `SELECT id
       FROM simulations
       WHERE status = 'Running'
       LIMIT 1`
    )

    if (activeCheck.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'A simulation is already running.',
      })
    }

    const result = await pool.query(
      `INSERT INTO simulations (
          scenario_id,
          scenario_name,
          target_asset_id,
          severity,
          status
       )
       VALUES ($1, $2, $3, $4, 'Running')
       RETURNING *`,
      [
        scenario_id,
        scenario_name,
        target_asset_id,
        severity,
      ]
    )

    res.status(201).json({
      status: 'success',
      message: 'Simulation recorded successfully.',
      simulation: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating simulation:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to create simulation.',
    })
  }
})

// ============================================
// STOP SIMULATION
// ============================================

router.patch('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE simulations
       SET status = 'Stopped',
           stopped_at = NOW()
       WHERE id = $1
         AND status = 'Running'
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message:
          'Running simulation not found or already stopped.',
      })
    }

    res.json({
      status: 'success',
      message: 'Simulation stopped successfully.',
      simulation: result.rows[0],
    })
  } catch (error) {
    console.error('Error stopping simulation:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to stop simulation.',
    })
  }
})

export default router
