import { Router } from 'express'
import { getUserById, createUser, updateUser } from '../controllers/userController.js'

export const userRouter = Router()

userRouter.get('/:id', getUserById)
userRouter.post('/create', createUser)
userRouter.put('/update/:id', updateUser)
