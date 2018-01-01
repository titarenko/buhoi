/* eslint-env mocha */

const buhoi = require('../src')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const todos = require('./app/features/todos')
const secrets = require('./app/features/secrets')

describe('buhoi', function () {
  process.env.BUHOI_WEBROOT = `${__dirname}/app/public`

  beforeEach(() => buhoi.start({
    featuresPath: `${__dirname}/app/features`,
    publicPath: `${__dirname}/app/public`,
    webpackConfigPath: `${__dirname}/app/pages/webpack.config.js`,
    rpc: {
      isAuthorized: (session, feature, procedure) =>
        feature !== 'secrets' || session === 'dodo',
    },
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
    todos.publicProcedureSpy.firstCall.args.slice(0, -2).should.eql([{ 1: 2 }])
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

  it('should deny unauthorized access', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    secrets.getSecretSpy.calledOnce.should.eql(false)
    statusCode.should.eql(403)
    true.should.eql(body === undefined)
  })

  it('should allow authorized access', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecret',
      headers: { 'Cookie': 'doge=dodo' },
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    secrets.getSecretSpy.calledOnce.should.eql(true)
    statusCode.should.eql(200)
    body.should.eql('secret! shh!')
  })

  it('should serve letsencrypt webroot', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/.well-known/acme-challenge/index.html',
      method: 'GET',
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('myindex')
  })

  it('should provide fallback for HTML5 history routing mode', async function () {
    const { statusCode, body } = await request({
      url: 'https://localhost:3001/todos',
      method: 'GET',
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('myindex')
  })

  it('should allow to set session', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/users.login',
      method: 'POST',
      json: [{ login: '1', password: '2' }],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    true.should.eql(body === undefined)
    headers['set-cookie'].should.eql(['doge=dodo; Path=/; HttpOnly; Secure'])
  })

  it('should allow to unset session', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/users.logout',
      method: 'POST',
      headers: { 'Cookie': 'doge=dodo' },
      json: [],
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    true.should.eql(body === undefined)
    headers['set-cookie'].should.eql(['doge=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'])
  })

  it('should allow to send files', async function () {
    const { statusCode, body, headers } = await request({
      url: 'https://localhost:3001/rpc/secrets.getSecretFile',
      headers: { 'Cookie': 'doge=dodo' },
      method: 'GET',
      json: true,
      strictSSL: false,
      timeout: 1000,
    })
    statusCode.should.eql(200)
    body.should.eql('secret! shhh!')
    headers['content-type'].should.eql('text/plain; charset=utf-8')
    headers['content-disposition'].should.eql('attachment; filename="secret.txt"')
  })
})
