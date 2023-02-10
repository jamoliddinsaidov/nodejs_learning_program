import { Request, Response } from 'express'
import { ValidationError } from 'joi'
import { UserRequestBody, userRequestSchema } from '../models/schema/userSchema.js'
import { getGenericErrorMessage } from '../utils/index.js'
import { UserService } from '../services/User.js'
import { IUser } from '../models/User.js'

const userService = new UserService()

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id)
    const result = await userService.getById(userId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const createUser = async (req: Request, res: Response) => {
  const schemaValidation: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

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
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const schemaValidation: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

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

    const result = await userService.update(updatedUser)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id)
    const result = await userService.delete(userId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.sendStatus(result.status)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const getAutoSuggestUsers = async (req: Request, res: Response) => {
  try {
    const { loginSubstring, limit = 10 } = req.body

    const result = await userService.autoSuggest(loginSubstring, limit)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}
