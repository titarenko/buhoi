/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi html5 history fallback', function () {
  it('should provide fallback for HTML5 history routing mode', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/todos',
      method: 'GET',
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('myindex')
  })
})
