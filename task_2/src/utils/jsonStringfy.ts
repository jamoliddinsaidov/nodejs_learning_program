import { User } from '../models/schema/userSchema.js'

export const jsonStringfy = (users: User[]) => {
  return JSON.stringify(users, null, 2)
}
