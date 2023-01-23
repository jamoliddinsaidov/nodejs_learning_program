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
  databaseFilePath,
} from './constants.js'
import { jsonStringfy } from '../utils.js'

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(400).json({ error: NO_USER_FOUND_MESSAGE, userId })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: SOMETHING_WENT_WRONG_MESSAGE, error: error.message })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { error, value }: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

  if (error) {
    const errorMessage = error.details[0].message
    return res.status(400).json({ error: errorMessage })
  }

  const user: User = {
    id: uuidv4(),
    login: value.login,
    password: value.password,
    age: value.age,
    isDeleted: false,
  }

  try {
    const existingUsers = await _getUsers();
    const newUsers = jsonStringfy([...existingUsers, user])

    await fs.writeFile(databaseFilePath, newUsers)

    res.status(201).json({ message: USER_CREATED_MESSAGE, user })
  } catch (error) {
    res.status(500).json({ message: SOMETHING_WENT_WRONG_MESSAGE, error: error.message })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    // check if the user with the provided ID exists
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(400).json({ error: NO_USER_FOUND_MESSAGE, userId })
    }

    // check if all the required fields are provided
    const { error, value }: { error: ValidationError; value: UserRequestBody } = userRequestSchema.validate(req.body)

    if (error) {
      const errorMessage = error.details[0].message
      return res.status(400).json({ error: errorMessage })
    }

    const users = await _getUsers();
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

    res.status(200).json({ message: USER_UPDATED_MESSAGE, updatedUser })
  } catch (error) {
    res.status(500).json({ message: SOMETHING_WENT_WRONG_MESSAGE, error: error.message })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // check if the user with the provided ID exists
    const userId = req.params.id
    const user = await _getUserById(userId)

    if (!user) {
      return res.status(400).json({ error: NO_USER_FOUND_MESSAGE, userId })
    }

    const users = await _getUsers()
    const deletedUser: User = { ...user, isDeleted: true }

    const deletedUserIndex = users.findIndex((user) => user.id === deletedUser.id)
    users[deletedUserIndex] = deletedUser

    await fs.writeFile(databaseFilePath, jsonStringfy(users))

    res.status(200).json({ message: USER_DELETED_MESSAGE, deletedUser })
  } catch (error) {
    res.status(500).json({ message: SOMETHING_WENT_WRONG_MESSAGE, error: error.message })
  }
}

export const getAutoSuggestUsers = async (req: Request, res: Response) => {
  const { login, limit = 10 } = req.body

  const searchRegex = new RegExp(login, 'gi');

  const users = await _getUsers();
  let suggestedUsers = users.filter((user) => user.login.match(searchRegex));
  
  if (suggestedUsers.length > limit) {
    suggestedUsers.length = limit
  }

  res.status(500).json({ suggestedUsers })
}

const _getUsers = async () => {
  const data = await fs.readFile(databaseFilePath, 'utf-8')
  return JSON.parse(data) as User[]
}

const _getUserById = async (userId: string) => {
  const users = await _getUsers()

  return users.find((user) => user.id === userId)
}
