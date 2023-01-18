import { Request, Response } from 'express'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { User, userRequestSchema } from '../models/User.js'
import { USER_CREATED_MESSAGE, SOMETHING_WENT_WRONG_MESSAGE, databaseFilePath } from './constants.js'

export const createUser = async (req: Request, res: Response) => {
  const { error, value } = userRequestSchema.validate(req.body)

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
    const data = await fs.readFile(databaseFilePath, 'utf-8')
    const users = JSON.stringify([...JSON.parse(data), user], null, 2)

    await fs.writeFile(databaseFilePath, users)

    res.status(201).json({ message: USER_CREATED_MESSAGE, user })
  } catch (error) {
    res.status(500).json({ message: SOMETHING_WENT_WRONG_MESSAGE, error: error.message })
  }
}
