import express from 'express'
import { userRouter } from './routes/user.js'
import { sequelizeConnection } from './data-access/config.js'
import {
  DB_CONNECTED_MESSAGE,
  DB_CONNECTION_FAILED_MESSAGE,
  SERVER_IS_RUNNING_MESSAGE,
  SERVER_IS_CLOSING_MESSAGE,
} from './data-access/constants.js'
import { groupRouter } from './routes/group.js'

const app = express()

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }))

// built-in middleware to handle json data
app.use(express.json())

// routes
app.use('/user/', userRouter)
app.use('/group/', groupRouter)

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
