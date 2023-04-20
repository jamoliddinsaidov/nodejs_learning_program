import request from 'supertest'
import jwt from 'jsonwebtoken'
import { localHostUrl } from '../../utils/constants.js'

const accessToken = jwt.sign(
  {
    login: 'testUser',
  },
  `${process.env.ACCESS_TOKEN_SECRET}`,
  { expiresIn: '5m' }
)
const authorization = `Bearer ${accessToken}`

describe('UserController', () => {
  it('should get user by ID', async () => {
    const response = await request(localHostUrl).get('/user/4').set('Authorization', authorization)

    expect(response.status).toEqual(200)
    expect(response.body.data.login).toBe('testUser')
  })

  it('should create a new user', async () => {
    const response = await request(localHostUrl).post('/user/create').set('Authorization', authorization).send({
      login: 'anotherTestUser',
      password: 'P@sw0rd123',
      age: 30,
    })

    expect(response.status).toEqual(201)
    expect(response.body.data.login).toBe('anotherTestUser')
    expect(response.body.data.age).toEqual(30)
  })

  it('should update user info by ID', async () => {
    const response = await request(localHostUrl).put('/user/update/6').set('Authorization', authorization).send({
      login: 'updatedTestUseR',
      password: 'T@es123',
      age: 25,
    })

    expect(response.status).toEqual(200)
    expect(response.body.data.login).toBe('updatedTestUseR')
    expect(response.body.data.age).toEqual(25)
  })

  it('should delete user by ID', async () => {
    const response = await request(localHostUrl).delete('/user/delete/6').set('Authorization', authorization)

    expect(response.status).toEqual(204)
  })

  it('should auto suggest users', async () => {
    const response = await request(localHostUrl).get('/user/autoSuggest').set('Authorization', authorization).send({
      loginSubstring: 'sherl',
      limit: 2,
    })

    expect(response.status).toEqual(200)
    expect(response.body.data.length).toEqual(1)
    expect(response.body.data[0].login).toBe('sherlock')
  })
})
