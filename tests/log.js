const should_ = require('should')
const sinon = require('sinon')
const shouldSinon_ = require('should-sinon')
const log = require('../modules/log')
const colors_ = require('colors')

describe('log', function () {
	let time, clock, consoleError, consoleLog
	beforeEach(function () {
		time = new Date()
		clock = sinon.useFakeTimers(time.getTime())
		consoleError = sinon.stub(console, 'error') // eslint-disable-line no-console
		consoleLog = sinon.stub(console, 'log') // eslint-disable-line no-console
	})
	afterEach(function () {
		clock.restore()
		console.error.restore() // eslint-disable-line no-console
		console.log.restore() // eslint-disable-line no-console
	})
	describe('error', function () {
		it('should use util.format for arg processing', function () {
			log(__filename).error('obj %j', { a: 1 })
			const message = `${time.toString().white} ${'error'.red} ${'tests/log.js'.cyan} obj {"a":1}`
			consoleError.should.be.calledWith(message)
		})
	})
	describe('warn', function () {
		it('should use util.format for arg processing', function () {
			log(__filename).warn('obj %j', { a: 2 })
			const message = `${time.toString().white} ${'warn'.yellow} ${'tests/log.js'.cyan} obj {"a":2}`
			consoleLog.should.be.calledWith(message)
		})
	})
	describe('debug', function () {
		it('should use util.format for arg processing', function () {
			log(__filename).debug('obj %j', { a: 3 })
			const message = `${time.toString().white} debug ${'tests/log.js'.cyan} obj {"a":3}`
			consoleLog.should.be.calledWith(message)
		})
	})
})