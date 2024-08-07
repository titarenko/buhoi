/* eslint-env mocha */

const request = require('./request')

describe('buhoi caching', function () {
  before(function () {
    if (!process.env.BUHOI_REDIS) {
      this.skip()
    }
  })

  it('should cache results if requested', async function () {
    const get = () => request({
      url: 'https://localhost:3001/rpc/todos.cachedPublicProcedure',
      method: 'get',
      data: [],
    })
    const response1 = await get()
    const response2 = await get()
    await new Promise((resolve) => setTimeout(resolve, 1100))
    const response3 = await get()
    response1.data.should.eql(response2.data)
    response2.data.should.not.eql(response3.data)
  })

  it('should use different cache per user', async function () {
    const get = session => request({
      url: 'https://localhost:3001/rpc/todos.cachedPublicProcedure',
      method: 'get',
      headers: { Cookie: `doge=${session}` },
      data: [],
    })
    const response1 = await get('dodo1')
    const response2 = await get('dodo2')
    response1.data.should.not.eql(response2.data)
  })
})
