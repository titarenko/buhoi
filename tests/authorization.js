/* eslint-env mocha */

const secrets = require('./app/features/secrets')
const request = require('./request')

describe('buhoi authorization', function () {
  it('should deny unauthorized access', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      method: 'get',
    })

    secrets.getSecretSpy.calledOnce.should.eql(false)
    status.should.eql(401)
    data.should.eql('')
  })

  it('should allow authorized access', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      method: 'get',
      headers: {
        'Cookie': 'doge=dodo',
        'Content-Type': 'application/json',
      },
    })

    secrets.getSecretSpy.calledOnce.should.eql(true)
    status.should.eql(200)
    data.should.eql('secret! shh!')
  })
})
