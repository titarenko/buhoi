/* eslint-env mocha */

const request = require('./request')

describe('buhoi https redirect', function () {
  it('should redirect any url requested with http to same url over https', async function () {
    const { status, headers, data } = await request({
      url: 'http://localhost:3000/any/url',
      method: 'get',
      maxRedirects: 0,
    })
    status.should.eql(301)
    data.should.eql('')
    headers['location'].should.eql('https://localhost:3000/any/url')
  })
})
