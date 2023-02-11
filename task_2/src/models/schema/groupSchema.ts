import Joi from 'joi'
import { Permission } from '../Group.js'

export const groupRequestSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  permissions: Joi.array().items(
    Permission.READ,
    Permission.WRITE,
    Permission.DELETE,
    Permission.SHARE,
    Permission.UPLOAD_FILES
  ),
})
