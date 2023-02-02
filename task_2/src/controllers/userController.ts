import { Request, Response } from 'express'
import fs from 'fs/promises'
import { ValidationError } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { User, UserRequestBody, userRequestSchema } from '../models/User.js'
import {
  USER_CREATED_MESSAGE,
  USER_UPDATED_MESSAGE,
  USER_DELETED_MESSAGE,
  SOMETHING_WENT_WRONG_MESSAGE,
  NO_USER_FOUND_MESSAGE,
  NO_LOGIN_SUBSTRING_MESSAGE,
  NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING_MESSAGE,
  LOGIN_NOT_AVAILABLE_MESSAGE,
  databaseFilePath,
} from './constants.js'
import { jsonStringfy } from '../utils/jsonStringfy.js'
import { sortUserByLogin } from '../utils/sortUserByLogin.js'

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(400).json({
        success: false,
        message: NO_USER_FOUND_MESSAGE,
        error: userId,
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MESSAGE,
      error: error.message,
    })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { error, value }: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      error,
    })
  }

  try {
    const users = await _getUsers()
    const isLoginNotAvailable = users.find((user) => user.login === value.login)

    if (isLoginNotAvailable) {
      return res.status(400).json({
        success: false,
        message: LOGIN_NOT_AVAILABLE_MESSAGE,
        data: value,
      })
    }

    const user: User = {
      id: uuidv4(),
      login: value.login,
      password: value.password,
      age: value.age,
      isDeleted: false,
    }

    const newUsers = jsonStringfy([...users, user])

    await fs.writeFile(databaseFilePath, newUsers)

    res.status(201).json({
      success: true,
      message: USER_CREATED_MESSAGE,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MESSAGE,
      error: error.message,
    })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    // check if the user with the provided ID exists
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: NO_USER_FOUND_MESSAGE,
        data: userId,
      })
    }

    // check if all the required fields are provided
    const { error, value }: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error,
      })
    }

    const users = await _getUsers()
    const isLoginNotAvailable = users.find((user) => user.login === value.login)

    if (isLoginNotAvailable) {
      return res.status(400).json({
        success: false,
        message: LOGIN_NOT_AVAILABLE_MESSAGE,
        data: value,
      })
    }

    const updatedUser: User = {
      id: user.id,
      login: value.login,
      password: value.password,
      age: value.age,
      isDeleted: user.isDeleted,
    }

    const updatedUserIndex = users.findIndex((user) => user.id === updatedUser.id)
    users[updatedUserIndex] = updatedUser

    await fs.writeFile(databaseFilePath, jsonStringfy(users))

    res.status(200).json({
      success: true,
      message: USER_UPDATED_MESSAGE,
      data: updatedUser,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MESSAGE,
      error: error.message,
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // check if the user with the provided ID exists
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(400).json({
        success: false,
        error: NO_USER_FOUND_MESSAGE,
        data: userId,
      })
    }

    const users = await _getUsers()
    const deletedUser: User = { ...user, isDeleted: true }

    const deletedUserIndex = users.findIndex((user) => user.id === deletedUser.id)
    users[deletedUserIndex] = deletedUser

    await fs.writeFile(databaseFilePath, jsonStringfy(users))

    res.status(200).json({
      success: true,
      message: USER_DELETED_MESSAGE,
      data: deletedUser,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MESSAGE,
      error: error.message,
    })
  }
}

export const getAutoSuggestUsers = async (req: Request, res: Response) => {
  try {
    const { loginSubstring, limit = 10 } = req.body

    if (!loginSubstring) {
      return res.status(400).json({
        success: false,
        error: NO_LOGIN_SUBSTRING_MESSAGE,
      })
    }

    const searchRegex = new RegExp(loginSubstring, 'gi')

    const users = await _getUsers()
    const suggestedUsers = users
      .filter((user) => user.login.match(searchRegex))
      .sort((userA, userB) => sortUserByLogin(userA, userB, loginSubstring))

    if (!suggestedUsers.length) {
      return res.status(404).json({
        success: false,
        error: NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING_MESSAGE,
        data: loginSubstring,
      })
    }

    if (suggestedUsers.length > limit) {
      suggestedUsers.length = limit
    }

    res.status(200).json({
      success: true,
      data: suggestedUsers,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MESSAGE,
      error: error.message,
    })
  }
}

const _getUsers = async () => {
  const data = await fs.readFile(databaseFilePath, 'utf-8')
  return JSON.parse(data) as User[]
}

const _getUserById = async (userId: string) => {
  const users = await _getUsers()

  return users.find((user) => user.id === userId)
}
