import { Op } from 'sequelize'
import { UserGroup, IUserGroup } from '../models/UserGroup.js'
import { sequelizeConnection } from '../data-access/config.js'
import { INCORRECT_USED_IDS_MESSAGE, NO_GROUP_FOUND_MESSAGE, USER_ADDED_TO_GROUP_MESSAGE } from './constants.js'
import { UserService } from './User.js'
import { GroupService } from './Group.js'

interface ISuccessReponse {
  success?: boolean
  message?: string
  data?: IUserGroup
}

interface IErrorResponse {
  success?: boolean
  message?: string
  error?: any
}

interface IUserGroupServiceResponse {
  response?: ISuccessReponse
  error?: IErrorResponse
  status: number
}

interface IUserGroupService {
  addUsersToGroup: (groupId: number, userIds: number[]) => Promise<IUserGroupServiceResponse>
  updateUsersGroup: (groupId: number, userIds: number[]) => Promise<IUserGroupServiceResponse>
  getIsUserGroupAlreadyCreated: (groupId: number) => Promise<boolean>
  deleteUserFromGroup: (userId: number) => void
  deleteGroupFromUserGroup: (groupId: number) => void
}

export class UserGroupService implements IUserGroupService {
  async addUsersToGroup(groupId: number, userIds: number[]) {
    const userService = new UserService()
    const groupService = new GroupService()

    const areUsersAvailable = await userService.getAreUsersAvailable(userIds)
    if (!areUsersAvailable) {
      const error = {
        success: false,
        message: INCORRECT_USED_IDS_MESSAGE,
        error: userIds,
      }

      return { error, status: 400 }
    }

    const IsGroupAvailable = await groupService.getIsGroupAvailable(groupId)
    if (!IsGroupAvailable) {
      const error = {
        success: false,
        message: NO_GROUP_FOUND_MESSAGE,
        error: groupId,
      }

      return { error, status: 400 }
    }

    const isUserGroupAlreadyCreated = await this.getIsUserGroupAlreadyCreated(groupId)
    if (isUserGroupAlreadyCreated) {
      const result = await this.updateUsersGroup(groupId, userIds)

      if (result?.error) {
        const error = {
          success: result.error.success,
          error: result.error.error,
        }

        return { error, status: result.status }
      }

      const response = {
        success: result.response.success,
        message: result.response.message,
        data: result.response.data,
      }

      return { response, status: 201 }
    }

    const transaction = await sequelizeConnection.transaction()

    try {
      const userGroup = await UserGroup.create(
        {
          fk_group_id: groupId,
          fk_user_ids: userIds,
        },
        { transaction }
      )

      await transaction.commit()

      const response = {
        success: true,
        message: USER_ADDED_TO_GROUP_MESSAGE,
        data: userGroup,
      }

      return { response, status: 201 }
    } catch (exception) {
      await transaction.rollback()

      const error = {
        success: false,
        error: exception,
      }

      return { error, status: 500 }
    }
  }

  async updateUsersGroup(groupId: number, userIds: number[]) {
    const transaction = await sequelizeConnection.transaction()

    try {
      const userGroup = await UserGroup.findOne({
        where: {
          fk_group_id: groupId,
        },
      })

      const updatedUserIds = Array.from(new Set([...userGroup.fk_user_ids, ...userIds]))
      const updatedUserGroup = {
        fk_group_id: groupId,
        fk_user_ids: updatedUserIds,
      }

      await UserGroup.update(updatedUserGroup, {
        where: {
          fk_group_id: groupId,
        },
      })

      await transaction.commit()

      const response = {
        success: true,
        message: USER_ADDED_TO_GROUP_MESSAGE,
        data: updatedUserGroup,
      }

      return { response, status: 201 }
    } catch (exception) {
      await transaction.rollback()

      const error = {
        success: false,
        error: exception,
      }

      return { error, status: 500 }
    }
  }

  async getIsUserGroupAlreadyCreated(groupId: number) {
    const userGroup = await UserGroup.findOne({
      where: {
        fk_group_id: groupId,
      },
    })

    return !!userGroup
  }

  async deleteUserFromGroup(userId: number) {
    const query = `SELECT * FROM UserGroups WHERE '${userId}'=ANY(fk_user_ids)`
    const [userGroups] = await sequelizeConnection.query(query)

    for (const usrGrp of userGroups) {
      const removeUserFromGroup = async () => {
        const userGroup = usrGrp as IUserGroup
        const updatedUserIds = userGroup.fk_user_ids.filter((usrId) => usrId !== userId)

        const updatedUserGroup = {
          fk_group_id: userGroup.fk_group_id,
          fk_user_ids: updatedUserIds,
        }

        await UserGroup.update(updatedUserGroup, {
          where: {
            fk_group_id: userGroup.fk_group_id,
          },
        })
      }

      removeUserFromGroup()
    }
  }

  async deleteGroupFromUserGroup(groupId: number) {
    await UserGroup.destroy({
      where: {
        fk_group_id: groupId,
      },
    })
  }
}
