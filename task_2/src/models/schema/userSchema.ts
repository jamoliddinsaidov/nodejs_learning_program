import Joi from 'joi'

export const userRequestSchema = Joi.object({
  login: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,30}$')),
  age: Joi.number().min(4).max(130),
})
