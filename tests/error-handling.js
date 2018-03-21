/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

describe('buhoi error handling', function () {
  it('should render validation errors as json with code 400', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/todos.create',
      method: 'POST',
      json: [{ name: '1' }],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(400)
    body.should.eql({ field: 'has invalid value' })
  })

  it('should render error as empty response with code 500', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/todos.raiseError',
      method: 'POST',
      json: [],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(500)
    true.should.eql(body === undefined)
  })
})
