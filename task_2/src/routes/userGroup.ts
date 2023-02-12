import { Router } from 'express'
import { addUsersToGroup } from '../controllers/userGroupController.js'

export const userGroupRouter = Router()

userGroupRouter.post('/addUsersToGroup', addUsersToGroup)
