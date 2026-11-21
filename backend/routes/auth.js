import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const COOKIE_NAME = 'aegis_token'
const JWT_SECRET = process.env.JWT_SECRET

const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )
}

// ============================================
// REGISTER
// ============================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email and password are required.',
      })
    }

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be between 2 and 100 characters.',
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address.',
      })
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be between 8 and 128 characters.',
      })
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email already exists.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [trimmedName, normalizedEmail, passwordHash, 'Analyst']
    )

    const user = result.rows[0]

    const token = createToken(user)

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      user,
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    return res.status(500).json({
      status: 'error',
      message: 'Unable to create account.',
    })
  }
})

// ============================================
// LOGIN
// ============================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'This account has been disabled.',
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      })
    }

    const token = createToken(user)

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    })

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    return res.json({
      status: 'success',
      message: 'Login successful.',
      user: safeUser,
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      status: 'error',
      message: 'Unable to log in.',
    })
  }
})

// ============================================
// LOGOUT
// ============================================

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions)

  return res.json({
    status: 'success',
    message: 'Logged out successfully.',
  })
})

// ============================================
// CURRENT AUTHENTICATED USER
// ============================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      res.clearCookie(COOKIE_NAME, cookieOptions)

      return res.status(401).json({
        status: 'error',
        message: 'User account is unavailable.',
      })
    }

    return res.json({
      status: 'success',
      user: result.rows[0],
    })
  } catch (error) {
    console.error('Current user error:', error.message)

    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve user information.',
    })
  }
})

export default router