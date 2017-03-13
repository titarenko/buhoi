const http = require('http')
const httpShutdown = require('http-shutdown')

module.exports = { http: createHttpServer }

function createHttpServer (app, options) {
	const signals = options && options.signals || ['SIGINT', 'SIGTERM']
	const server = httpShutdown(http.createServer(app))
	signals.forEach(it => process.on(it, () => server.shutdown()))
	return server
}