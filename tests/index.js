/* eslint-env mocha */

const buhoi = require('../src')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const todos = require('./app/features/todos')

describe('buhoi', function () {
  beforeEach(() => buhoi.start({
    featuresPath: `${__dirname}/app/features`,
    publicPath: `${__dirname}/app/public`,
    isAuthorized: () => true,
  }))
  afterEach(() => buhoi.stop())

  it('should serve public procedures', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/todos.publicProcedure',
      method: 'POST',
      json: { 1: 2 },
      strictSSL: false,
    })
    todos.publicProcedureSpy.calledOnce.should.eql(true)
    statusCode.should.eql(200)
    body.should.eql([1, 2, 3])
  })
})
