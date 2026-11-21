import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { pool } from '../db/pool.js'
import { firebaseAdminAuth } from '../firebaseAdmin.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from the backend .env file')
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  }
}

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Firebase ID token is required.',
      })
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken)

    const email = decodedToken.email
    const emailVerified = decodedToken.email_verified
    const name =
      decodedToken.name ||
      decodedToken.email?.split('@')[0] ||
      'AEGIS User'

    if (!email || !emailVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'A verified Google email is required.',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find an existing AEGIS user
    const existingUserResult = await pool.query(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    )

    let user

    if (existingUserResult.rows.length > 0) {
      user = existingUserResult.rows[0]

      if (!user.is_active) {
        return res.status(403).json({
          status: 'error',
          message: 'This account has been disabled.',
        })
      }
    } else {
      // Generate a random password hash for Google-only accounts
      const randomPassword = randomBytes(32).toString('hex')
      const passwordHash = await bcrypt.hash(randomPassword, 12)

      const newUserResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, is_active`,
        [name, normalizedEmail, passwordHash, 'Analyst']
      )

      user = newUserResult.rows[0]
    }

    // Create AEGIS JWT session
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Set HTTP-only cookie
    res.cookie('aegis_token', token, getCookieOptions())

    return res.status(200).json({
      status: 'success',
      message: 'Google sign-in successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Google authentication error:', error)

    return res.status(401).json({
      status: 'error',
      message: 'Google authentication failed.',
    })
  }
})

export default router