/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi letsencrypt webroot', function () {
  it('should serve letsencrypt webroot', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/.well-known/acme-challenge/index.html',
      method: 'GET',
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('myindex')
  })
})
