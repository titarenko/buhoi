/* eslint-env mocha */

const buhoi = require('../src')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const todos = require('./app/features/todos')

describe('buhoi', function () {
  beforeEach(() => buhoi.start({
    featuresPath: `${__dirname}/app/features`,
    publicPath: `${__dirname}/app/public`,
    webpackConfigPath: `${__dirname}/app/pages/webpack.config.js`,
    rpc: { isAuthorized: () => true },
  }))
  afterEach(() => buhoi.stop())

  it('should serve public procedures', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'POST',
      json: [{ 1: 2 }],
      strictSSL: false,
      timeout: 1000,
    })
    todos.publicProcedureSpy.calledOnce.should.eql(true)
    todos.publicProcedureSpy.firstCall.args.should.eql([{ 1: 2 }])
    statusCode.should.eql(200)
    body.should.eql([1, 2, 3])
  })

  it('should not serve private procedures', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/todos.privateProcedure',
      method: 'POST',
      json: [{ 'undefined': 'null' }],
      strictSSL: false,
      timeout: 1000,
    })
    todos.privateProcedureSpy.calledOnce.should.eql(false)
    statusCode.should.eql(404)
    true.should.eql(body === undefined)
  })
})
