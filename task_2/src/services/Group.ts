import { Group, IGroup } from '../models/Group.js'
import { UserGroupService } from './UserGroup.js'
import { sequelizeConnection } from '../data-access/config.js'
import { NO_GROUP_FOUND, GROUP_NAME_NOT_AVAILABLE, GROUP_CREATED, GROUP_UPDATED } from './constants.js'
import { logService } from '../utils/index.js'

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
  getIsGroupAvailable: (groupId: number) => Promise<boolean>
}

export class GroupService implements IGroupService {
  async getAll() {
    logService('GroupService', 'getAll', {})

    const groups = await Group.findAll()
    const response = {
      success: true,
      data: groups,
    }

    return { response, status: 200 }
  }

  async getById(groupId: number) {
    logService('GroupService', 'getById', { groupId })

    const group = await Group.findByPk(groupId)

    if (!group) {
      const error = {
        success: false,
        message: NO_GROUP_FOUND,
        error: groupId,
      }

      return { error, status: 404 }
    }

    const response = {
      success: true,
      data: group,
    }

    return { response, status: 200 }
  }

  async create(group: IGroup) {
    logService('GroupService', 'create', { group })

    const isGroupNameNotAvailable = await this.getIsGroupNameNotAvailable(group.name)
    if (isGroupNameNotAvailable) {
      const error = {
        success: false,
        message: GROUP_NAME_NOT_AVAILABLE,
        error: group,
      }

      return { error, status: 400 }
    }

    const createdGroup = await Group.create(group)

    const response = {
      success: true,
      message: GROUP_CREATED,
      data: createdGroup,
    }

    return { response, status: 201 }
  }

  async update(updatedGroup: IGroup) {
    logService('GroupService', 'update', { updatedGroup })

    const groupId = updatedGroup.id
    const groupToBeUpdated = await this.getById(groupId)

    if (groupToBeUpdated?.error) {
      return { error: groupToBeUpdated.error, status: groupToBeUpdated.status }
    }

    const isGroupNameNotAvailable = await this.getIsGroupNameNotAvailable(updatedGroup.name)
    if (isGroupNameNotAvailable) {
      const error = {
        success: false,
        message: GROUP_NAME_NOT_AVAILABLE,
        error: updatedGroup,
      }

      return { error, status: 400 }
    }

    await Group.update(updatedGroup, {
      where: {
        id: groupId,
      },
    })

    const response = {
      success: true,
      message: GROUP_UPDATED,
      data: updatedGroup,
    }

    return { response, status: 200 }
  }

  async delete(groupId: number) {
    logService('GroupService', 'delete', { groupId })

    const groupToBeDeleted = await this.getById(groupId)

    if (groupToBeDeleted?.error) {
      return { error: groupToBeDeleted.error, status: groupToBeDeleted.status }
    }

    const transaction = await sequelizeConnection.transaction()
    const userGroupService = new UserGroupService()

    try {
      await userGroupService.deleteGroupFromUserGroup(groupId)

      await Group.destroy({
        where: {
          id: groupId,
        },
      })

      transaction.commit()

      return { status: 204 }
    } catch (exception) {
      await transaction.rollback()

      const error = {
        success: false,
        error: exception,
      }

      return { error, status: 500 }
    }
  }

  async getIsGroupNameNotAvailable(targetGroupName: string) {
    logService('GroupService', 'getIsGroupNameNotAvailable', { targetGroupName })

    const groups = await Group.findAll()
    const isLoginNotAvailable = groups.find((group) => group.name === targetGroupName)

    return !!isLoginNotAvailable
  }

  async getIsGroupAvailable(groupId: number) {
    logService('GroupService', 'getIsGroupAvailable', { groupId })

    const group = await Group.findOne({
      attributes: ['id'],
      where: {
        id: groupId,
      },
    })

    return !!group
  }
}
