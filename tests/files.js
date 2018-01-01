/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi files', function () {
  it('should allow to send files', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecretFile',
      headers: { 'Cookie': 'doge=dodo' },
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('secret! shhh!')
    headers['content-type'].should.eql('text/plain; charset=utf-8')
    headers['content-disposition'].should.eql('attachment; filename="secret.txt"')
  })
})
