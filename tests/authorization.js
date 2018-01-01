/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

const secrets = require('./app/features/secrets')

describe('buhoi authorization', function () {
  it('should deny unauthorized access', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    secrets.getSecretSpy.calledOnce.should.eql(false)
    statusCode.should.eql(403)
    true.should.eql(body === undefined)
  })

  it('should allow authorized access', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      headers: { 'Cookie': 'doge=dodo' },
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    secrets.getSecretSpy.calledOnce.should.eql(true)
    statusCode.should.eql(200)
    body.should.eql('secret! shh!')
  })
})
