
import express from 'express'
import { pool } from '../db/pool.js'

const router = express.Router()

const allowedSeverities = ['Low', 'Medium', 'High', 'Critical']
const allowedStatuses = ['New', 'Investigating', 'Resolved']
const allowedSources = ['Baseline', 'Simulation']

// ============================================
// GET ALL EVENTS
// ============================================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM events
       ORDER BY timestamp DESC`
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      events: result.rows,
    })
  } catch (error) {
    console.error('Error fetching events:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve events.',
    })
  }
})

// ============================================
// GET EVENT BY DATABASE UUID OR EXTERNAL ID
// ============================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM events
       WHERE id::text = $1 OR external_id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found.',
      })
    }

    res.json({
      status: 'success',
      event: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching event:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve event.',
    })
  }
})

// ============================================
// CREATE EVENT
// ============================================

router.post('/', async (req, res) => {
  try {
    const {
      external_id,
      title,
      description,
      severity,
      asset_id,
      simulation_id,
      scenario_id,
      scenario_name,
      status,
      source,
      timestamp,
    } = req.body

    // Required field validation
    if (!title || !severity || !asset_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, severity and asset_id are required.',
      })
    }

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid severity value.',
      })
    }

    const eventStatus = status || 'New'
    const eventSource = source || 'Baseline'

    if (!allowedStatuses.includes(eventStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event status.',
      })
    }

    if (!allowedSources.includes(eventSource)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event source.',
      })
    }

    // Validate target asset
    const assetCheck = await pool.query(
      'SELECT id FROM assets WHERE id = $1',
      [asset_id]
    )

    if (assetCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'The specified asset does not exist.',
      })
    }

    // Validate simulation ID if supplied
    if (simulation_id) {
      const simulationCheck = await pool.query(
        'SELECT id FROM simulations WHERE id = $1',
        [simulation_id]
      )

      if (simulationCheck.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'The specified simulation does not exist.',
        })
      }
    }

    const result = await pool.query(
      `INSERT INTO events (
        external_id,
        title,
        description,
        severity,
        asset_id,
        simulation_id,
        scenario_id,
        scenario_name,
        status,
        source,
        timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        COALESCE($11::timestamptz, NOW())
      )
      RETURNING *`,
      [
        external_id || null,
        title,
        description || null,
        severity,
        asset_id,
        simulation_id || null,
        scenario_id || null,
        scenario_name || null,
        eventStatus,
        eventSource,
        timestamp || null,
      ]
    )

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully.',
      event: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating event:', error.message)

    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'An event with this external ID already exists.',
      })
    }

    res.status(500).json({
      status: 'error',
      message: 'Unable to create event.',
    })
  }
})


router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event status.',
      })
    }

    const result = await pool.query(
      `UPDATE events
       SET status = $1
       WHERE external_id = $2 OR id::text = $2
       RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found.',
      })
    }

    res.json({
      status: 'success',
      message: 'Event status updated successfully.',
      event: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating event status:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to update event status.',
    })
  }
})


export default router
