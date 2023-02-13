import Joi from 'joi'

export const userGroupRequestSchema = Joi.object({
  userIds: Joi.array().items(Joi.number()),
  groupId: Joi.number(),
})
