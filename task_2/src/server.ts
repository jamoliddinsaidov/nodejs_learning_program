import express from 'express'
import { sequelizeConnection } from './data-access/config.js'
import { userRouter } from './routes/user.js'
import { groupRouter } from './routes/group.js'
import { userGroupRouter } from './routes/userGroup.js'
import { logger, logUnhandledError } from './middlewares/index.js'
import { DB_CONNECTED, DB_CONNECTION_FAILED, SERVER_IS_RUNNING, SERVER_IS_CLOSING } from './data-access/constants.js'

const app = express()

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }))

// built-in middleware to handle json data
app.use(express.json())

// routes
app.use('/user/', userRouter)
app.use('/group/', groupRouter)
app.use('/userGroup/', userGroupRouter)

// middleware to log errors
app.use(logUnhandledError)

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

process
  .on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at Promise ${promise}.\nReason: ${reason}`)
    process.exit(-1)
  })
  .on('uncaughtException', (error) => {
    logger.error(error)
    process.exit(-1)
  })
