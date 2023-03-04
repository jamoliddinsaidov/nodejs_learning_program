import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import { User, IUser } from '../models/User.js'
import { sequelizeConnection } from '../data-access/config.js'
import {
  NO_USER_FOUND,
  LOGIN_NOT_AVAILABLE,
  USER_CREATED,
  USER_UPDATED,
  NO_LOGIN_SUBSTRING,
  NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING,
} from './constants.js'
import { UserGroupService } from './UserGroup.js'
import { logService } from '../utils/index.js'

interface ISuccessReponse {
  success?: boolean
  message?: string
  data?: IUser | IUser[]
}

interface IErrorResponse {
  success?: boolean
  message?: string
  error?: IUser | number | string
}

interface IUserServiceResponse {
  response?: ISuccessReponse
  error?: IErrorResponse
  status: number
}

interface IUserService {
  getById: (userId: number) => Promise<IUserServiceResponse>
  create: (user: IUser) => Promise<IUserServiceResponse>
  update: (user: IUser) => Promise<IUserServiceResponse>
  delete: (userId: number) => Promise<IUserServiceResponse>
  autoSuggest: (loginSubstring: string, limit: number) => Promise<IUserServiceResponse>
  getIsLoginNotAvailable: (login: string) => Promise<boolean>
  getAreUsersAvailable: (userIds: number[]) => Promise<boolean>
  getByLogin: (login: string) => Promise<IUserServiceResponse>
  updateRefreshToken: (login: string, refreshToken: string) => void
  deleteRefreshToken: (userId: number) => void
}

export class UserService implements IUserService {
  async getById(userId: number) {
    logService('UserService', 'getById', { userId })

    const user = await User.findByPk(userId)

    if (!user) {
      const error = {
        success: false,
        message: NO_USER_FOUND,
        error: userId,
      }

      return { error, status: 404 }
    }

    const response = {
      success: true,
      data: user,
    }

    return { response, status: 200 }
  }

  async create(user: IUser) {
    logService('UserService', 'create', { user })

    const isLoginNotAvailable = await this.getIsLoginNotAvailable(user.login)
    if (isLoginNotAvailable) {
      const error = {
        success: false,
        message: LOGIN_NOT_AVAILABLE,
        error: user,
      }

      return { error, status: 400 }
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)
    user.password = hashedPassword

    const createdUser = await User.create(user)

    const response = {
      success: true,
      message: USER_CREATED,
      data: createdUser,
    }
    return { response, status: 201 }
  }

  async update(updatedUser: IUser) {
    logService('UserService', 'update', { updatedUser })

    const userId = updatedUser.id
    const userToBeUpdated = await this.getById(userId)

    if (userToBeUpdated?.error) {
      return { error: userToBeUpdated.error, status: userToBeUpdated.status }
    }

    const isLoginNotAvailable = await this.getIsLoginNotAvailable(updatedUser.login)
    if (isLoginNotAvailable) {
      const error = {
        success: false,
        message: LOGIN_NOT_AVAILABLE,
        error: userId,
      }

      return { error, status: 400 }
    }

    const hashedPassword = await bcrypt.hash(updatedUser.password, 10)
    updatedUser.password = hashedPassword

    if (userToBeUpdated.response.data?.refresh_token) {
      updatedUser.refresh_token = userToBeUpdated.response.data?.refresh_token
    }

    await User.update(updatedUser, {
      where: {
        id: userId,
      },
    })

    const response = {
      success: true,
      message: USER_UPDATED,
      data: updatedUser,
    }

    return { response, status: 200 }
  }

  async delete(userId: number) {
    logService('UserService', 'delete', { userId })

    const userToBeDeleted = await this.getById(userId)

    if (userToBeDeleted?.error) {
      return { error: userToBeDeleted.error, status: userToBeDeleted.status }
    }

    const deletedUser = userToBeDeleted.response.data as IUser
    deletedUser.is_deleted = true

    const transaction = await sequelizeConnection.transaction()
    const userGroupService = new UserGroupService()

    try {
      await userGroupService.deleteUserFromGroup(userId)

      await User.update(deletedUser, {
        where: {
          id: userId,
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

  async autoSuggest(loginSubstring: string, limit: number) {
    logService('UserService', 'autoSuggest', { loginSubstring, limit })

    if (!loginSubstring) {
      const error = {
        success: false,
        message: NO_LOGIN_SUBSTRING,
      }

      return { error, status: 400 }
    }

    const suggestedUsers: IUser[] = await User.findAll({
      where: {
        login: {
          [Op.like]: `%${loginSubstring}%`,
        },
      },
      order: [['login', 'ASC']],
      limit,
    })

    if (!suggestedUsers.length) {
      const error = {
        success: false,
        message: NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING,
        error: loginSubstring,
      }

      return { error, status: 400 }
    }

    const response = {
      success: true,
      data: suggestedUsers,
    }

    return { response, status: 200 }
  }

  async getIsLoginNotAvailable(targetLogin: string) {
    logService('UserService', 'getIsLoginNotAvailable', { targetLogin })

    const users = await User.findAll()
    const isLoginNotAvailable = users.find((user) => user.login === targetLogin)

    return !!isLoginNotAvailable
  }

  async getAreUsersAvailable(userIds: number[]) {
    logService('UserService', 'getAreUsersAvailable', { userIds })

    const availableUserIds = (
      await User.findAll({
        attributes: ['id'],
      })
    ).map((user) => user.id)

    const areTargetUsersAvailable = userIds.every((userId) => availableUserIds.includes(userId))

    return areTargetUsersAvailable
  }

  async getByLogin(login: string) {
    logService('UserService', 'getByLogin', { login })

    const user = await User.findOne({
      where: {
        login,
      },
    })

    if (!user) {
      const error = {
        success: false,
        message: NO_USER_FOUND,
        error: login,
      }

      return { error, status: 404 }
    }

    const response = {
      success: true,
      data: user,
    }

    return { response, status: 200 }
  }

  async getByRefreshToken(refreshToken: string) {
    logService('UserService', 'getByRefreshToken', { refreshToken })

    const user = await User.findOne({
      where: {
        refresh_token: refreshToken,
      },
    })

    if (!user) {
      const error = {
        success: false,
        message: NO_USER_FOUND,
        error: refreshToken,
      }

      return { error, status: 404 }
    }

    const response = {
      success: true,
      data: user,
    }

    return { response, status: 200 }
  }

  async updateRefreshToken(login: string, refreshToken: string) {
    logService('UserService', 'updateRefreshToken', { login, refreshToken })
    await User.update({ refresh_token: refreshToken }, { where: { login } })
  }

  async deleteRefreshToken(userId: number) {
    logService('UserService', 'deleteRefreshToken', { userId })
    await User.update({ refresh_token: null }, { where: { id: userId } })
  }
}
