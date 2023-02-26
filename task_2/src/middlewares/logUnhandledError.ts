import { INTERNAL_SERVER_ERROR } from '../utils/constants.js'
import { logger } from './logger.js'

export const logUnhandledError = (error, req, res, next) => {
  logger.error(error)
  res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR })
  next()
}
