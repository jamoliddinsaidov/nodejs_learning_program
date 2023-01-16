import express from 'express'
import { userRouter } from './routes/user.js'

const app = express()

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }))

// built-in middleware to handle json data
app.use(express.json())

// routes
app.use('/user/', userRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
