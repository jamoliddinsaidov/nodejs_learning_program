import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { AUTHORIZATION_HEADER_NOT_PROVIDED, AUTHORIZATION_TOKEN_INVALID } from '../services/constants.js'
dotenv.config()

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ success: false, message: AUTHORIZATION_HEADER_NOT_PROVIDED })
  }

  const [type, token] = authHeader.split(' ')
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ success: false, message: AUTHORIZATION_TOKEN_INVALID, error })
    }

    next()
  })
}
