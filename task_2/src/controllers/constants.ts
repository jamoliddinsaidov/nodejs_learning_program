import path from 'path'
import { fileURLToPath } from 'url'

// paths
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// path to the database folder in src
export const databaseFilePath = path.join(dirname, '..', '..', 'src', 'database', 'users.json')

// user controller constants
export const NO_USER_FOUND_MESSAGE = 'No user found matching with the provided user ID'
export const USER_CREATED_MESSAGE = 'User is successfully created'
export const USER_UPDATED_MESSAGE = 'User is successfully updated'
export const USER_DELETED_MESSAGE = 'User is successfully deleted'
export const NO_LOGIN_SUBSTRING_MESSAGE = 'Please provide a valid loginSubstring'
export const NO_USERS_FOUND_MATCHING_LOGIN_SUBSTRING_MESSAGE =
  'No users found matching with the provided user loginSubstring'
export const LOGIN_NOT_AVAILABLE_MESSAGE = 'The login you provided is not available. Please try another one'

// general message constants
export const SOMETHING_WENT_WRONG_MESSAGE = 'Something went wrong. Please try again'
