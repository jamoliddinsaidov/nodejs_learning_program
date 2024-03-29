import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { sequelizeConnection } from './data-access/config.js'
import { userRouter } from './routes/user.js'
import { groupRouter } from './routes/group.js'
import { userGroupRouter } from './routes/userGroup.js'
import { authRouter } from './routes/auth.js'
import { logger, auth, addCredentialsHeader } from './middlewares/index.js'
import { DB_CONNECTED, DB_CONNECTION_FAILED, SERVER_IS_RUNNING, SERVER_IS_CLOSING } from './data-access/constants.js'
import { corsOptions } from './config/corsOptions.js'

const app = express()

// middlewares
app.use(addCredentialsHeader)
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/auth', authRouter)

app.use(auth)
app.use('/user/', userRouter)
app.use('/group/', groupRouter)
app.use('/userGroup/', userGroupRouter)

const start = async () => {
  try {
    await sequelizeConnection.authenticate()
    logger.info(DB_CONNECTED)

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => logger.info(`${SERVER_IS_RUNNING} ${PORT}`))
  } catch (error) {
    logger.error(`${DB_CONNECTION_FAILED} ${error}`)
    logger.warn(SERVER_IS_CLOSING)
    process.exit(-1)
  }
}

start()

process
  .on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at Promise ${promise}.\nReason: ${reason}`)
    process.exit(-1)
  })
  .on('uncaughtException', (error) => {
    logger.error(error)
    process.exit(-1)
  })
