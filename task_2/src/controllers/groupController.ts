import { Request, Response } from 'express'
import { GroupService } from '../services/Group.js'
import { groupRequestSchema } from '../models/schema/groupSchema.js'
import { getGenericErrorMessage } from '../utils/index.js'
import { ValidationError } from 'joi'
import { IGroup } from '../models/Group.js'

const groupService = new GroupService()

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const result = await groupService.getAll()

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id)
    const result = await groupService.getById(groupId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const createGroup = async (req: Request, res: Response) => {
  const schemaValidation: { error: ValidationError; value: IGroup } = groupRequestSchema.validate(req.body)

  if (schemaValidation.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  try {
    const result = await groupService.create(schemaValidation.value)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const updateGroup = async (req: Request, res: Response) => {
  const schemaValidation: { error: ValidationError; value: IGroup } = groupRequestSchema.validate(req.body)

  if (schemaValidation.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  try {
    const groupId = parseInt(req.params.id)
    const updatedGroup: IGroup = {
      id: groupId,
      name: schemaValidation.value.name,
      permissions: schemaValidation.value.permissions,
    }

    const result = await groupService.update(updatedGroup)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id)
    const result = await groupService.delete(groupId)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.sendStatus(result.status)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
  }
}
