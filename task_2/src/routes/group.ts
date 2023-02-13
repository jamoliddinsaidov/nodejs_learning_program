import { Router } from 'express'
import { createGroup, deleteGroup, getAllGroups, getGroupById, updateGroup } from '../controllers/groupController.js'

export const groupRouter = Router()

groupRouter.get('/all', getAllGroups)
groupRouter.post('/create', createGroup)
groupRouter.get('/:id', getGroupById)
groupRouter.put('/update/:id', updateGroup)
groupRouter.delete('/delete/:id', deleteGroup)
