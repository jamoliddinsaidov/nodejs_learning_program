import express from 'express'
import { sequelizeConnection } from './data-access/config.js'
import { userRouter } from './routes/user.js'
import { groupRouter } from './routes/group.js'
import { addUsersToGroup } from './controllers/userGroupController.js'
import {
  DB_CONNECTED_MESSAGE,
  DB_CONNECTION_FAILED_MESSAGE,
  SERVER_IS_RUNNING_MESSAGE,
  SERVER_IS_CLOSING_MESSAGE,
} from './data-access/constants.js'

const app = express()

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }))

// built-in middleware to handle json data
app.use(express.json())

// routes
app.use('/user/', userRouter)
app.use('/group/', groupRouter)
app.use('/userGroup/', addUsersToGroup)

try {
  await sequelizeConnection.authenticate()
  console.log(DB_CONNECTED_MESSAGE)

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(SERVER_IS_RUNNING_MESSAGE, PORT))
} catch (error) {
  console.error(DB_CONNECTION_FAILED_MESSAGE, error)
  console.log(SERVER_IS_CLOSING_MESSAGE)
  process.exit(-1)
}
