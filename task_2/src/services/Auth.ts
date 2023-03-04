import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { logService } from '../utils/index.js'
import { ACCESS_TOKEN_UPDATED, PASSWORD_DOES_NOT_MATCH, REFRESH_TOKEN_IS_DELETED, USER_LOGGED_IN } from './constants.js'
import { UserService } from './User.js'

dotenv.config()

interface ISuccessReponse {
  success?: boolean
  message?: string
  data?: { accessToken: string; refreshToken: string }
}

interface IErrorResponse {
  success?: boolean
  message?: string
  error?: string
}

interface IAuthServiceResponse {
  response?: ISuccessReponse
  error?: IErrorResponse
  status: number
}

interface IAuthService {
  login: (username: string, password: string) => Promise<IAuthServiceResponse>
  logout: (refreshToken: string) => Promise<IAuthServiceResponse>
}

const userService = new UserService()

export class AuthService implements IAuthService {
  async login(username: string, password: string) {
    logService('AuthService', 'login', { username, password })

    const user = await userService.getByLogin(username)

    if (user?.error) {
      return { error: user.error, status: user.status }
    }

    const isPasswordMatch = await bcrypt.compare(password, user.response.data.password)

    if (!isPasswordMatch) {
      const error = {
        success: false,
        message: PASSWORD_DOES_NOT_MATCH,
        error: password,
      }

      return { error, status: 401 }
    }

    const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
    const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

    await userService.updateRefreshToken(username, refreshToken)

    const response = {
      success: true,
      message: USER_LOGGED_IN,
      data: { accessToken, refreshToken },
    }

    return { response, status: 200 }
  }

  async logout(refreshToken: string) {
    logService('AuthService', 'logout', { refreshToken })

    const user = await userService.getByRefreshToken(refreshToken)

    if (user?.error) {
      return { error: user.error, status: user.status }
    }

    await userService.deleteRefreshToken(user.response.data.id)

    const response = {
      success: true,
      message: REFRESH_TOKEN_IS_DELETED,
    }

    return { response, status: 204 }
  }
}
