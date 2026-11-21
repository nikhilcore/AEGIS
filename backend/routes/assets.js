
import express from 'express'
import { pool } from '../db/pool.js'

const router = express.Router()

// GET all assets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM assets
       ORDER BY id ASC`
    )

    res.json({
      status: 'success',
      count: result.rows.length,
      assets: result.rows,
    })
  } catch (error) {
    console.error('Error fetching assets:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve assets.',
    })
  }
})

// GET a single asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM assets
       WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found.',
      })
    }

    res.json({
      status: 'success',
      asset: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching asset:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve asset.',
    })
  }
})

export default router
