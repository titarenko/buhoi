const mockRequire = require('mock-require')
const sinon = require('sinon')
const should_ = require('should')
const shouldSinon_ = require('should-sinon')

describe('loggers', function () {
	describe('slack', function () {
		let request, slack
		beforeEach(function () {
			request = sinon.spy()
			mockRequire('request', request)
			slack = mockRequire.reRequire('../modules/loggers').slack
		})
		afterEach(function () {
			mockRequire.stopAll()
		})
		it('should send messages', function () {
			const instance = slack({ token: 'chpoken', channel: 'ololo', level: 'error' })
			instance({ time: '1', level: 'error', 'category': '2', message: '3' })
			request.should.be.calledWith({
				url: 'https://slack.com/api/chat.postMessage',
				method: 'POST',
				form: {
					token: 'chpoken',
					channel: 'ololo',
					icon_emoji: undefined,
					mrkdwn: true,
					text: '*1* `2` ```\n3\n```',
				},
			})
		})
	})
	describe('logstash', function () {
		let socket, logstash
		beforeEach(function () {
			socket = {
				on: sinon.spy(),
				send: sinon.spy(),
			}
			mockRequire('dgram', { createSocket: () => socket })
			logstash = mockRequire.reRequire('../modules/loggers').logstash
		})
		afterEach(function () {
			mockRequire.stopAll()
		})
		it('should send messages', function () {
			const instance = logstash({ url: 'localhost:3000' })
			const message = { time: '2', level: 'debug', 'category': '3', message: '4' }
			instance(message)
			const buffer = new Buffer(JSON.stringify(message))
			socket.send.should.be.calledWith(buffer, 0, buffer.length, '3000', 'localhost')
		})
	})
})