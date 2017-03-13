const mockRequire = require('mock-require')
const sinon = require('sinon')
const should_ = require('should')
const shouldSinon_ = require('should-sinon')

describe('server', function () {
	describe('http', function () {
		let instance, processOn, processStub, server
		beforeEach(function () {
			processOn = sinon.spy()
			processStub = sinon.stub(process, 'on', processOn)
			instance = { shutdown: sinon.spy() }
			mockRequire('http-shutdown', () => instance)
			server = mockRequire.reRequire('../modules/server')
		})
		afterEach(function () {
			mockRequire.stopAll()
			processStub.restore()
		})
		it('should create http server with graceful shutdown included', function () {
			server.http((req_, res_) => undefined)
			processOn.should.be.calledWith('SIGINT')
			processOn.should.be.calledWith('SIGTERM')
			processOn.getCall(0).args[1]()
			processOn.getCall(1).args[1]()
			instance.shutdown.should.be.calledTwice()
		})
	})
})