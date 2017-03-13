const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const dgram = require('dgram')
const log = require('./log')(__filename, true)

module.exports =  { slack, logstash }

function slack ({ token, channel, icon, level = 'error' }) {
	if (!token) {
		throw new Error('Token is required.')
	}

	if (!channel) {
		throw new Error('Channel is required.')
	}

	return function (ev) {
		if (ev.level != level) {
			return
		}
		return request({
			url: 'https://slack.com/api/chat.postMessage',
			method: 'POST',
			form: {
				token: token,
				channel: channel,
				icon_emoji: icon,
				mrkdwn: true,
				text: `*${ev.time}* ${'`'}${ev.category}${'`'} ${'```\n'}${ev.message}${'\n```'}`,
			},
		}).catch(e => log.error(`failed to send log message to slack due to ${e.stack}`))
	}
}


function logstash ({ url }) {
	if (!url) {
		throw new Error('URL is required.')
	}

	const [host, port] = url.split(':')

	if (!port) {
		throw new Error('Port is required.')
	}

	let udpSocket

	return function (ev) {
		if (!udpSocket) {
			udpSocket = dgram.createSocket('udp4')
			udpSocket.on('error', error => {
				log.error(`udp socket error ${error.stack}`)
				udpSocket.close()
				udpSocket = null
			})
		}

		const buffer = new Buffer(JSON.stringify(ev))
		udpSocket.send(buffer, 0, buffer.length, port, host, error => {
			if (!error) {
				return
			}
			log.error(`failed to send log message to logstash due to ${error.stack}`)
		})
	}
}