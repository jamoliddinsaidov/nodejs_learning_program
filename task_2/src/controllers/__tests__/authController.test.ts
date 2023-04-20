import request from 'supertest'
import { localHostUrl } from '../../utils/constants.js'

describe('AuthController', () => {
  it('should allow user to log in', async () => {
    const response = await request(localHostUrl).post('/auth/login').send({
      username: 'testUser',
      password: 'P@sw0rd',
    })

    expect(response.status).toEqual(200)
    expect(response.body.success).toBe(true)
  })
})
