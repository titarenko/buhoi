/* eslint-env mocha */

const request = require('./request')

describe('buhoi html5 history fallback', function () {
  it('should provide fallback for HTML5 history routing mode', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/todos',
      method: 'get',
    })

    status.should.eql(200)
    data.should.eql('myindex')
  })
})
