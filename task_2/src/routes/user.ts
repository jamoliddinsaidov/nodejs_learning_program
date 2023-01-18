import { Router } from 'express'
import { getUserById, createUser } from '../controllers/userController.js'

export const userRouter = Router()

userRouter.get('/:id', getUserById)
userRouter.post('/create', createUser)
