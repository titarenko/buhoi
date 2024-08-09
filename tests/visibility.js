/* eslint-env mocha */

const request = require('./request')

const todos = require('./app/features/todos')

describe('buhoi visibility', function () {
  beforeEach(() => {
    todos.publicProcedureSpy.resetHistory()
  })

  it('should serve public procedures', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'post',
      data: [{ 1: 2 }],
    })

    todos.publicProcedureSpy.calledOnce.should.eql(true)
    todos.publicProcedureSpy.firstCall.args.slice(0, -2).should.eql([{ 1: 2 }])
    status.should.eql(200)
    data.should.eql([1, 2, 3])
  })

  it('should not serve private procedures', async function () {
    const { status, data } = await request({
      url: 'https://localhost:3001/rpc/todos.privateProcedure',
      method: 'post',
      data: [{ undefined: 'null' }],
    })

    todos.privateProcedureSpy.calledOnce.should.eql(false)
    status.should.eql(404)
    data.should.eql('')
  })
})
