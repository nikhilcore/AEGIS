
import express from 'express'
import { pool } from '../db/pool.js'

const router = express.Router()

const allowedSeverities = ['Low', 'Medium', 'High', 'Critical']
const allowedStatuses = ['Open', 'Investigating', 'Contained', 'Resolved']

// ============================================
// GET ALL INCIDENTS
// ============================================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM incidents
       ORDER BY created_at DESC`
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      incidents: result.rows,
    })
  } catch (error) {
    console.error('Error fetching incidents:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve incidents.',
    })
  }
})

// ============================================
// GET INCIDENT BY ID
// ============================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM incidents
       WHERE id::text = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident not found.',
      })
    }

    res.json({
      status: 'success',
      incident: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching incident:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve incident.',
    })
  }
})

// ============================================
// CREATE INCIDENT
// ============================================

router.post('/', async (req, res) => {
  try {
    const {
      title,
      severity,
      status,
      asset_id,
      category,
      description,
      assigned_to,
    } = req.body

    if (!title || !severity || !asset_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, severity and asset_id are required.',
      })
    }

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid severity.',
      })
    }

    const incidentStatus = status || 'Open'

    if (!allowedStatuses.includes(incidentStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident status.',
      })
    }

    // Validate asset
    const assetCheck = await pool.query(
      'SELECT id FROM assets WHERE id = $1',
      [asset_id]
    )

    if (assetCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Specified asset does not exist.',
      })
    }

    const result = await pool.query(
      `INSERT INTO incidents (
        title,
        severity,
        status,
        asset_id,
        category,
        description,
        assigned_to,
        resolved_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        title,
        severity,
        incidentStatus,
        asset_id,
        category || null,
        description || null,
        assigned_to || null,
        incidentStatus === 'Resolved' ? new Date() : null,
      ]
    )

    res.status(201).json({
      status: 'success',
      message: 'Incident created successfully.',
      incident: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating incident:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to create incident.',
    })
  }
})

// ============================================
// UPDATE INCIDENT STATUS
// ============================================

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident status.',
      })
    }

    const result = await pool.query(
      `UPDATE incidents
       SET status = $1,
           updated_at = NOW(),
           resolved_at = CASE
             WHEN $1 = 'Resolved' THEN NOW()
             ELSE NULL
           END
       WHERE id::text = $2
       RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident not found.',
      })
    }

    res.json({
      status: 'success',
      message: 'Incident status updated successfully.',
      incident: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating incident:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to update incident status.',
    })
  }
})


 // ============================================
 // GET INCIDENT NOTES
 // ============================================

router.get('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM incident_notes
       WHERE incident_id = $1
       ORDER BY created_at ASC`,
      [id]
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      notes: result.rows,
    })
  } catch (error) {
    console.error('Error fetching incident notes:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve incident notes.',
    })
  }
})

// ============================================
// ADD INCIDENT NOTE
// ============================================

router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params
    const { note, author } = req.body

    if (!note || typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'A non-empty note is required.',
      })
    }

    const incidentCheck = await pool.query(
      `SELECT id FROM incidents WHERE id::text = $1`,
      [id]
    )

    if (incidentCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident not found.',
      })
    }

    const result = await pool.query(
      `INSERT INTO incident_notes (
        incident_id,
        note,
        author
      )
      VALUES ($1, $2, $3)
      RETURNING *`,
      [incidentCheck.rows[0].id, note.trim(), author || 'Simulation Analyst']
    )

    res.status(201).json({
      status: 'success',
      message: 'Incident note added successfully.',
      note: result.rows[0],
    })
  } catch (error) {
    console.error('Error adding incident note:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to add incident note.',
    })
  }
})

// ============================================
// GET EVENTS LINKED TO AN INCIDENT
// ============================================

router.get('/:id/events', async (req, res) => {
  try {
    const { id } = req.params

    // Check whether the incident exists
    const incidentCheck = await pool.query(
      `SELECT id FROM incidents WHERE id::text = $1`,
      [id]
    )

    if (incidentCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident not found.',
      })
    }

    // Retrieve linked events
    const result = await pool.query(
      `SELECT e.*
       FROM incident_events ie
       JOIN events e ON ie.event_id = e.id
       WHERE ie.incident_id = $1
       ORDER BY e.timestamp DESC`,
      [incidentCheck.rows[0].id]
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      events: result.rows,
    })
  } catch (error) {
    console.error('Error fetching incident events:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve linked events.',
    })
  }
})

// ============================================
// LINK EVENT TO INCIDENT
// ============================================

router.post('/:id/events', async (req, res) => {
  try {
    const { id } = req.params
    const { event_id } = req.body

    if (!event_id) {
      return res.status(400).json({
        status: 'error',
        message: 'event_id is required.',
      })
    }

    // Find incident
    const incidentCheck = await pool.query(
      `SELECT id FROM incidents WHERE id::text = $1`,
      [id]
    )

    if (incidentCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incident not found.',
      })
    }

    // Find event using UUID or external_id
    const eventCheck = await pool.query(
      `SELECT id
       FROM events
       WHERE id::text = $1 OR external_id = $1
       LIMIT 1`,
      [event_id]
    )

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found.',
      })
    }

    // Link incident and event
    const result = await pool.query(
      `INSERT INTO incident_events (incident_id, event_id)
       VALUES ($1, $2)
       ON CONFLICT (incident_id, event_id) DO NOTHING
       RETURNING *`,
      [
        incidentCheck.rows[0].id,
        eventCheck.rows[0].id,
      ]
    )

    res.status(201).json({
      status: 'success',
      message: result.rows.length > 0
        ? 'Event linked to incident successfully.'
        : 'Event is already linked to this incident.',
      correlation: result.rows[0] || null,
    })
  } catch (error) {
    console.error('Error linking event to incident:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to link event to incident.',
    })
  }
})

export default router
