/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi session', function () {
  it('should allow to set session', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/users.login',
      method: 'POST',
      json: [{ login: '1', password: '2' }],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    true.should.eql(body === undefined)
    headers['set-cookie'].should.eql(['doge=dodo; Path=/; HttpOnly; Secure'])
  })

  it('should allow to unset session', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/users.logout',
      method: 'POST',
      headers: { Cookie: 'doge=dodo' },
      json: [],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    true.should.eql(body === undefined)
    headers['set-cookie'].should.eql(['doge=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'])
  })
})
