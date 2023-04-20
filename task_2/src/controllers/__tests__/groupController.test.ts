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

describe('GroupController', () => {
  it('should get all available groups', async () => {
    const response = await request(localHostUrl).get('/group/all').set('Authorization', authorization)

    expect(response.status).toEqual(200)
    expect(response.body.data.length).toEqual(6)
  })

  it('should get group by ID', async () => {
    const response = await request(localHostUrl).get('/group/1').set('Authorization', authorization)

    expect(response.status).toEqual(200)
    expect(response.body.data.name).toBe('read_group')
  })

  it('should create a new group', async () => {
    const response = await request(localHostUrl)
      .post('/group/create')
      .set('Authorization', authorization)
      .send({
        name: 'test_group',
        permissions: ['READ', 'WRITE'],
      })

    expect(response.status).toEqual(201)
    expect(response.body.data.name).toBe('test_group')
    expect(response.body.data.permissions.length).toEqual(2)
  })

  it('should update a group by ID', async () => {
    const allGroups = await request(localHostUrl).get('/group/all').set('Authorization', authorization)
    const testGroupIndex = allGroups.body.data.length - 1
    const testGroupId = allGroups.body.data[testGroupIndex].id

    const response = await request(localHostUrl)
      .put(`/group/update/${testGroupId}`)
      .set('Authorization', authorization)
      .send({
        name: 'updated_test_group',
        permissions: ['READ', 'WRITE'],
      })

    expect(response.status).toEqual(200)
    expect(response.body.data.name).toBe('updated_test_group')
  })

  it('should delete a group by ID', async () => {
    const allGroups = await request(localHostUrl).get('/group/all').set('Authorization', authorization)
    const testGroupIndex = allGroups.body.data.length - 1
    const testGroupId = allGroups.body.data[testGroupIndex].id

    const response = await request(localHostUrl)
      .delete(`/group/delete/${testGroupId}`)
      .set('Authorization', authorization)

    expect(response.status).toEqual(204)
  })
})
