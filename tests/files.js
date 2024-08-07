/* eslint-env mocha */

const request = require('./request')

describe('buhoi files', function () {
  it('should allow to send files', async function () {
    const { status, headers, data } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecretFile',
      method: 'get',
      headers: { Cookie: 'doge=dodo' },
    })

    status.should.eql(200)
    data.should.eql('secret! shhh!')
    headers['content-type'].should.eql('text/plain; charset=utf-8')
    headers['content-disposition'].should.eql('attachment; filename="secret.txt"')
  })
})
