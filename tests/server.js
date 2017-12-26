const mockRequire = require('mock-require')
const sinon = require('sinon')
const should_ = require('should')
const shouldSinon_ = require('should-sinon')

describe('server', function () {
  describe('http', function () {
    let instance, server
    beforeEach(function () {
      instance = { shutdown: sinon.spy() }
      mockRequire('http-shutdown', () => instance)
      server = mockRequire.reRequire('../modules/server')
    })
    afterEach(function () {
      mockRequire.stopAll()
    })
    it('should create http server with graceful shutdown included', function () {
      server.http((req_, res_) => undefined)
      instance.shutdown.should.be.Function()
    })
  })
})
