/* eslint-env mocha */

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const fs = require('fs')

const todos = require('./app/features/todos')
const users = require('./app/features/users')

describe('buhoi arg parsing', function () {
  beforeEach(() => {
    todos.publicProcedureSpy.resetHistory()
  })

  it('should treat no content as empty arg array', async function () {
    const { statusCode } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      strictSSL: false,
      timeout: 1000,
    })
    todos.publicProcedureSpy.calledOnce.should.eql(true)
    todos.publicProcedureSpy.lastCall.args.slice(0, -2).should.eql([])
    statusCode.should.eql(200)
  })

  it('should treat no args in qs as empty arg array', async function () {
    const { statusCode } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'GET',
      strictSSL: false,
      timeout: 1000,
    })
    todos.publicProcedureSpy.calledOnce.should.eql(true)
    todos.publicProcedureSpy.lastCall.args.slice(0, -2).should.eql([])
    statusCode.should.eql(200)
  })

  it('should respond with 500 if args are invalid JSON', async function () {
    const { statusCode } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'GET',
      qs: { args: 'arg' },
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(500)
  })

  it('should respond with 500 if body does not contains array of args', async function () {
    const { statusCode } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'POST',
      json: 'dolphin',
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(500)
  })

  it('should receive forms with files', async function () {
    const { statusCode } = await request({
      url: 'https://localhost:3001/rpc/users.uploadAvatar',
      method: 'POST',
      formData: {
        user_id: 10,
        avatar: fs.createReadStream(`${__dirname}/app/public/index.html`),
      },
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    users.uploadAvatarSpy.calledOnce.should.eql(true)
    const args = users.uploadAvatarSpy.lastCall.args
    args[0].should.have.property('user_id')
    args[0].user_id.should.eql('10')
    args[0].should.have.property('avatar')
    args[0].avatar.buffer.should.eql(Buffer.from('myindex'))
  })
})
