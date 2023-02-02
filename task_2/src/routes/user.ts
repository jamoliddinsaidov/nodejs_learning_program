import { Router } from 'express'
import { getUserById, createUser, updateUser, deleteUser, getAutoSuggestUsers } from '../controllers/userController.js'

export const userRouter = Router()

userRouter.post('/create', createUser)
userRouter.get('/autoSuggest', getAutoSuggestUsers)
userRouter.get('/:id', getUserById)
userRouter.put('/update/:id', updateUser)
userRouter.delete('/delete/:id', deleteUser)
