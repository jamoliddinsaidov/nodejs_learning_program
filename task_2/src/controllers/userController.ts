import { Request, Response } from 'express'
import { ValidationError } from 'joi'
import { userRequestSchema } from '../models/schema/userSchema.js'
import { getGenericErrorMessage } from '../utils/index.js'
import { UserService } from '../services/User.js'
import { IUser } from '../models/User.js'
import { logError } from '../utils/index.js'

const userService = new UserService()

export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id)

  try {
    const result = await userService.getById(userId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError('UserController', 'getUserById', { userId }, error.message)
  }
}

export const createUser = async (req: Request, res: Response) => {
  const schemaValidation: { error: ValidationError; value: IUser } = userRequestSchema.validate(req.body)

  if (schemaValidation.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  try {
    const result = await userService.create(schemaValidation.value)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError('UserController', 'createUser', { user: schemaValidation.value }, error.message)
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const schemaValidation: { error: ValidationError; value: IUser } = userRequestSchema.validate(req.body)

  if (schemaValidation.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  const userId = parseInt(req.params.id)
  const updatedUser: IUser = {
    id: userId,
    login: schemaValidation.value.login,
    password: schemaValidation.value.password,
    age: schemaValidation.value.age,
    is_deleted: false,
  }

  try {
    const result = await userService.update(updatedUser)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError('UserController', 'updateUser', { updatedUser }, error.message)
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id)

  try {
    const result = await userService.delete(userId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.sendStatus(result.status)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError('UserController', 'deleteUser', { userId }, error.message)
  }
}

export const getAutoSuggestUsers = async (req: Request, res: Response) => {
  const { loginSubstring, limit = 10 } = req.body

  try {
    const result = await userService.autoSuggest(loginSubstring, limit)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError('UserController', 'getAutoSuggestUsers', { loginSubstring, limit }, error.message)
  }
}
