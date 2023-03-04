import { Router } from 'express'
import { login, logout, refreshToken } from '../controllers/authController.js'

export const authRouter = Router()

authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get('/refreshToken', refreshToken)
