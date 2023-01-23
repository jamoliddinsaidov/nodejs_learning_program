import { User } from '../models/User.js'

export const jsonStringfy = (users: User[]) => {
  return JSON.stringify(users, null, 2)
}
