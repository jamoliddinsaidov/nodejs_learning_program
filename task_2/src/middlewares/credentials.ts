import { Request, Response, NextFunction } from 'express'
import { allowedOrigins } from '../config/allowedOrigins.js'

export const addCredentialsHeader = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin

  if (allowedOrigins.includes(origin)) {
    // for a CORS request with credentials
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  next()
}
