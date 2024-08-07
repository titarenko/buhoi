/* eslint-env mocha */

const request = require('./request')

describe('buhoi session', function () {
  it('should allow to set session', async function () {
    const { status, headers, data } = await request({
      url: 'https://localhost:3001/rpc/users.login',
      method: 'post',
      data: [{ login: '1', password: '2' }],
    })
    status.should.eql(200)
    data.should.eql('')
    headers['set-cookie'].should.eql(['doge=dodo; Path=/; HttpOnly; Secure'])
  })

  it('should allow to unset session', async function () {
    const { status, headers, data } = await request({
      url: 'https://localhost:3001/rpc/users.logout',
      method: 'post',
      headers: { Cookie: 'doge=dodo' },
      data: [],
    })
    status.should.eql(200)
    data.should.eql('')
    headers['set-cookie'].should.eql(['doge=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'])
  })
})
