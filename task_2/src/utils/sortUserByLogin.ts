import { User } from '../models/User.js'

export const sortUserByLogin = (userA: User, userB: User, loginSubstring: string) => {
  if (userA.login.indexOf(loginSubstring) > userB.login.indexOf(loginSubstring)) {
    return 1
  }

  if (userA.login.indexOf(loginSubstring) < userB.login.indexOf(loginSubstring)) {
    return -1
  }

  return 0
}
