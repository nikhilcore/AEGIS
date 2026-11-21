import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from the backend .env file')
}

export function authenticateToken(req, res, next) {
  const token = req.cookies?.aegis_token

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired authentication token.',
    })
  }
}