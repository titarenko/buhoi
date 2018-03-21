/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi https redirect', function () {
  it('should redirect any url requested with http to same url over https', async function () {
    const { statusCode, body, headers } = await request({
      url: 'http://localhost:3000/any/url',
      method: 'GET',
      timeout: 1000,
      followRedirect: false,
    })
    statusCode.should.eql(301)
    true.should.eql(body === '')
    headers['location'].should.eql('https://localhost:3000/any/url')
  })
})
