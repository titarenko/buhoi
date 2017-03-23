const http = require('http')
const httpShutdown = require('http-shutdown')
const https = require('https')
const fs = require('fs')
const path = require('path')
const constants = require('constants')

module.exports = {
	http: createHttpServer,
	https: createHttpsServer,
}

function createHttpServer (app) {
	return app && app.redirectToHttps === true
		? createHttpToHttpsServer()
		: httpShutdown(http.createServer(app))
}

function createHttpToHttpsServer () {
	return httpShutdown(http.createServer(redirectApp))
	function redirectApp (req, res) {
		const redirectLocation = `https://${req.headers['host']}${req.url}`
		res.writeHead(301, { 'Location': redirectLocation })
		res.end()
	}
}

function createHttpsServer (app, { letsencrypt }) {
	const options = {
		key: fs.readFileSync(path.join(letsencrypt, 'privkey1.pem')),
		cert: fs.readFileSync(path.join(letsencrypt, 'fullchain1.pem')),
		ca: fs.readFileSync(path.join(letsencrypt, 'chain1.pem')),
		dhparam: fs.readFileSync(path.join(letsencrypt, 'dh1.pem')),
		secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
	}
	return httpShutdown(https.createServer(app, options))
}