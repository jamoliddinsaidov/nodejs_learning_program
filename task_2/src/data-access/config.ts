import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

const dbUserName = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const dbHost = process.env.DB_HOST
const dbName = process.env.DB_NAME

const connectionString = `postgres://${dbUserName}:${dbPassword}@${dbHost}/${dbName}`
const options = {
  define: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
}

export const sequelizeConnection = new Sequelize(connectionString, options)
