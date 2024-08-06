/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request')) // todo: use axios here and in other tests

describe('buhoi caching', function () {
  before(function () {
    if (!process.env.BUHOI_REDIS) {
      this.skip()
    }
  })

  it('should cache results if requested', async function () {
    const get = () => request({
      url: 'https://localhost:3001/rpc/todos.cachedPublicProcedure',
      method: 'GET',
      json: [],
      strictSSL: false,
      timeout: 1000,
    })
    const response1 = await get()
    const response2 = await get()
    await Promise.delay(1100)
    const response3 = await get()
    response1.body.should.eql(response2.body)
    response2.body.should.not.eql(response3.body)
  })

  it('should use different cache per user', async function () {
    const get = session => request({
      url: 'https://localhost:3001/rpc/todos.cachedPublicProcedure',
      method: 'GET',
      headers: { Cookie: `doge=${session}` },
      json: [],
      strictSSL: false,
      timeout: 1000,
    })
    const response1 = await get('dodo1')
    const response2 = await get('dodo2')
    response1.body.should.not.eql(response2.body)
  })
})
