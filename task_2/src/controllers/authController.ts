import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { loginSchema } from '../models/schema/loginSchema.js'
import { AuthService } from '../services/Auth.js'
import { UserService } from '../services/User.js'
import {
  ALREADY_LOGGED_OUT,
  JWT_COOKIE_IS_CLEARED,
  JWT_COOKIE_NOT_PROVIDED,
  ACCESS_TOKEN_UPDATED,
} from '../services/constants.js'
import { getGenericErrorMessage, logError } from '../utils/index.js'

const authService = new AuthService()

export const login = async (req: Request, res: Response) => {
  const schemaValidation = loginSchema.validate(req.body)

  if (schemaValidation.error) {
    return res.status(400).json({
      success: false,
      message: schemaValidation.error.details[0].message,
      error: schemaValidation.error,
    })
  }

  const { username, password } = schemaValidation.value

  try {
    const result = await authService.login(username, password)

    if (result?.error) {
      return res.status(result.status).json(result.error)
    }

    const {
      success,
      message,
      data: { accessToken, refreshToken },
    } = result.response

    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 86400000 })
    res.status(result.status).json({
      data: { accessToken },
      success,
      message,
    })
  } catch (error) {
    logError('AuthController', 'login', { username, password }, error.message)
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req?.cookies?.jwt;

  if (!refreshToken) {
    return res.status(204).json({ success: true, message: ALREADY_LOGGED_OUT })
  }

  try {
    const result = await authService.logout(refreshToken)

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })

    if (result?.error) {
      return res.status(204).json({ success: true, message: JWT_COOKIE_IS_CLEARED })
    }

    res.status(result.status).json(result.response)
  } catch (error) {
    logError('AuthController', 'logout', { refreshToken }, error.message)
    res.status(500).json(getGenericErrorMessage(error))
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req?.cookies?.jwt;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: JWT_COOKIE_NOT_PROVIDED })
  }

  try {
    const userService = new UserService()
    const user = await userService.getByRefreshToken(refreshToken)

    if (user?.error) {
      return res.status(user.status).json(user.error)
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(403).json({ success: false, ...error })
      }

      const accessToken = jwt.sign({ username: user.response.data.login }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '10m',
      })

      res.status(200).json({
        success: true,
        message: ACCESS_TOKEN_UPDATED,
        data: { accessToken },
      })
    })
  } catch (error) {
    logError('AuthController', 'refreshToken', { refreshToken }, error.message)
    res.status(500).json(getGenericErrorMessage(error))
  }
}
