import { Request, Response } from 'express'
import { UserGroupService } from '../services/UserGroup.js'
import { userGroupRequestSchema } from '../models/schema/userGroupSchema.js'
import { getGenericErrorMessage } from '../utils/getGenericErrorMessage.js'
import { logError } from '../utils/logError.js'

const userGroupService = new UserGroupService()

export const addUsersToGroup = async (req: Request, res: Response) => {
  const schemaValidation = userGroupRequestSchema.validate(req.body)

  if (schemaValidation?.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  try {
    const result = await userGroupService.addUsersToGroup(
      schemaValidation.value.groupId,
      schemaValidation.value.userIds
    )

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    res.status(500).json(getGenericErrorMessage(error))
    logError(
      'userGroupController',
      'addUsersToGroup',
      {
        groupId: schemaValidation.value.groupId,
        userIds: schemaValidation.value.userIds,
      },
      error.message
    )
  }
}
