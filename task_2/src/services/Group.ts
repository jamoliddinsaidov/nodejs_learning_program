import { Group, IGroup } from '../models/Group.js'
import {
  NO_GROUP_FOUND_MESSAGE,
  GROUP_NAME_NOT_AVAILABLE_MESSAGE,
  GROUP_CREATED_MESSAGE,
  GROUP_UPDATED_MESSAGE,
} from './constants.js'

interface ISuccessReponse {
  success?: boolean
  message?: string
  data?: IGroup | IGroup[]
}

interface IErrorResponse {
  success?: boolean
  message?: string
  error?: IGroup | number
}

interface IGroupServiceResponse {
  response?: ISuccessReponse
  error?: IErrorResponse
  status: number
}

interface IGroupService {
  getAll: () => Promise<IGroupServiceResponse>
  getById: (groupId: number) => Promise<IGroupServiceResponse>
  create: (group: IGroup) => Promise<IGroupServiceResponse>
  update: (group: IGroup) => Promise<IGroupServiceResponse>
  delete: (groupId: number) => Promise<IGroupServiceResponse>
  getIsGroupNameNotAvailable: (targetGroupName: string) => Promise<boolean>
}

export class GroupService implements IGroupService {
  async getAll() {
    const groups = await Group.findAll()
    const response: ISuccessReponse = {
      success: true,
      data: groups,
    }

    return { response, status: 200 }
  }

  async getById(groupId: number) {
    const group = await Group.findByPk(groupId)

    if (!group) {
      const error: IErrorResponse = {
        success: false,
        message: NO_GROUP_FOUND_MESSAGE,
        error: groupId,
      }

      return { error, status: 404 }
    }

    const response: ISuccessReponse = {
      success: true,
      data: group,
    }

    return { response, status: 200 }
  }

  async create(group: IGroup) {
    const isGroupNameNotAvailable = await this.getIsGroupNameNotAvailable(group.name)
    if (isGroupNameNotAvailable) {
      const error: IErrorResponse = {
        success: false,
        message: GROUP_NAME_NOT_AVAILABLE_MESSAGE,
        error: group,
      }

      return { error, status: 400 }
    }

    const createdGroup = await Group.create(group)

    const response: ISuccessReponse = {
      success: true,
      message: GROUP_CREATED_MESSAGE,
      data: createdGroup,
    }

    return { response, status: 201 }
  }

  async update(updatedGroup: IGroup) {
    const groupId = updatedGroup.id
    const groupToBeUpdated = await this.getById(groupId)

    if (groupToBeUpdated?.error) {
      return { error: groupToBeUpdated.error, status: groupToBeUpdated.status }
    }

    const isGroupNameNotAvailable = await this.getIsGroupNameNotAvailable(updatedGroup.name)
    if (isGroupNameNotAvailable) {
      const error: IErrorResponse = {
        success: false,
        message: GROUP_NAME_NOT_AVAILABLE_MESSAGE,
        error: updatedGroup,
      }

      return { error, status: 400 }
    }

    await Group.update(updatedGroup, {
      where: {
        id: groupId,
      },
    })

    const response: ISuccessReponse = {
      success: true,
      message: GROUP_UPDATED_MESSAGE,
      data: updatedGroup,
    }

    return { response, status: 200 }
  }

  async delete(groupId: number) {
    const groupToBeDeleted = await this.getById(groupId)

    if (groupToBeDeleted?.error) {
      return { error: groupToBeDeleted.error, status: groupToBeDeleted.status }
    }

    await Group.destroy({
      where: {
        id: groupId,
      },
    })

    return { status: 204 }
  }

  async getIsGroupNameNotAvailable(targetGroupName: string) {
    const groups = await Group.findAll()
    const isLoginNotAvailable = groups.find((group) => group.name === targetGroupName)

    return !!isLoginNotAvailable
  }
}
