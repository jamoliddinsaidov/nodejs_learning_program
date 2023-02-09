import { Op } from 'sequelize'
import { User, IUser } from '../models/User.js'
import {
  NO_USER_FOUND_MESSAGE,
  LOGIN_NOT_AVAILABLE_MESSAGE,
  USER_CREATED_MESSAGE,
  USER_UPDATED_MESSAGE,
  USER_DELETED_MESSAGE,
  NO_LOGIN_SUBSTRING_MESSAGE,
  NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING_MESSAGE,
} from './constants.js'

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
}

interface IUserService {
  getById: (userId: number) => Promise<IUserServiceResponse>
  create: (user: IUser) => Promise<IUserServiceResponse>
  update: (user: IUser) => Promise<IUserServiceResponse>
  delete: (userId: number) => Promise<IUserServiceResponse>
  autoSuggest: (loginSubstring: string, limit: number) => Promise<IUserServiceResponse>
  getIsLoginNotAvailable: (login: string) => Promise<boolean>
}

export class UserService implements IUserService {
  async getById(userId: number) {
    const user = await User.findByPk(userId)

    if (!user) {
      const error: IErrorResponse = {
        success: false,
        message: NO_USER_FOUND_MESSAGE,
        error: userId,
      }

      return { error }
    }

    const response: ISuccessReponse = {
      success: true,
      data: user,
    }

    return { response }
  }

  async create(user: IUser) {
    const isLoginNotAvailable = await this.getIsLoginNotAvailable(user.login)
    if (isLoginNotAvailable) {
      const error: IErrorResponse = {
        success: false,
        message: LOGIN_NOT_AVAILABLE_MESSAGE,
        error: user,
      }

      return { error }
    }

    await User.create(user)

    const response: ISuccessReponse = {
      success: true,
      message: USER_CREATED_MESSAGE,
      data: user,
    }
    return { response }
  }

  async update(updatedUser: IUser) {
    const userId = updatedUser.id
    const userToBeUpdated = await this.getById(userId)

    if (userToBeUpdated?.error) {
      return { error: userToBeUpdated.error }
    }

    const isLoginNotAvailable = await this.getIsLoginNotAvailable(updatedUser.login)
    if (isLoginNotAvailable) {
      const error: IErrorResponse = {
        success: false,
        message: LOGIN_NOT_AVAILABLE_MESSAGE,
        error: userId,
      }

      return { error }
    }

    await User.update(updatedUser, {
      where: {
        id: userId,
      },
    })

    const response: ISuccessReponse = {
      success: true,
      message: USER_UPDATED_MESSAGE,
      data: updatedUser,
    }

    return { response }
  }

  async delete(userId: number) {
    const userToBeDeleted = await this.getById(userId)

    if (userToBeDeleted?.error) {
      return { error: userToBeDeleted.error }
    }

    const deletedUser = userToBeDeleted.response.data as IUser
    deletedUser.is_deleted = true

    await User.update(deletedUser, {
      where: {
        id: userId,
      },
    })

    const response: ISuccessReponse = {
      success: true,
      message: USER_DELETED_MESSAGE,
      data: deletedUser,
    }

    return { response }
  }

  async autoSuggest(loginSubstring: string, limit: number) {
    if (!loginSubstring) {
      const error: IErrorResponse = {
        success: false,
        message: NO_LOGIN_SUBSTRING_MESSAGE,
      }

      return { error }
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
      const error: IErrorResponse = {
        success: false,
        message: NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING_MESSAGE,
        error: loginSubstring,
      }

      return { error }
    }

    const response: ISuccessReponse = {
      success: true,
      data: suggestedUsers,
    }

    return { response }
  }

  async getIsLoginNotAvailable(targetLogin: string) {
    const users = await User.findAll()
    const isLoginNotAvailable = users.find((user) => user.login === targetLogin)

    return !!isLoginNotAvailable
  }
}
