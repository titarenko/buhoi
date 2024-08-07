/* eslint-env mocha */

const request = require('./request')

describe('buhoi error handling', function () {
  it('should render validation errors as json with code 400', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/todos.create',
      method: 'post',
      data: [{ name: '1' }],
    })

    status.should.eql(400)
    data.should.eql({ field: 'has invalid value' })
  })

  it('should render error as empty response with code 500', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/todos.raiseError',
      method: 'post',
      data: [],
      validateStatus: () => true,
    })

    status.should.eql(500)
    data.should.eql('')
  })
})
