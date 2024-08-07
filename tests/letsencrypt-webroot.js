/* eslint-env mocha */

const request = require('./request')

describe('buhoi letsencrypt webroot', function () {
  it('should serve letsencrypt webroot', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/.well-known/acme-challenge/index.html',
      method: 'get',
    })
    status.should.eql(200)
    data.should.eql('myindex')
  })
})
