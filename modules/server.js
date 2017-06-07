const http = require('http')
const httpShutdown = require('http-shutdown')
const https = require('https')
const fs = require('fs')
const path = require('path')
const constants = require('constants')
const httpProxy = require('http-proxy')

module.exports = {
	http: createHttpServer,
	https: createHttpsServer,
	createServer,
	createProxy,
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
	return httpShutdown(https.createServer(options, app))
}

function createServer (app, options) {
	if (options) {
		const http = createHttpServer({ redirectToHttps: true })
		const https = createHttpsServer(app, options)
		process.on('SIGINT', () => {
			http.shutdown()
			https.shutdown()
		})
		return { http, https }
	} else {
		const http = createHttpServer(app)
		process.on('SIGINT', () => http.shutdown())
		return { http, https: null }
	}
}

function createProxy (targets, options) {
	const proxy = httpProxy.createProxyServer()

	if (options) {
		const http = createHttpServer({ redirectToHttps: true })
		const https = createHttpsServer(proxyHttp, options)
		https.on('upgrade', proxyWs)
		process.on('SIGINT', () => {
			http.shutdown()
			https.shutdown()
		})
		return { http, https }
	} else {
		const http = createHttpServer(proxyHttp)
		http.on('upgrade', proxyWs)
		process.on('SIGINT', () => http.shutdown())
		return { http, https: null }
	}

	function proxyHttp (req, res) {
		const target = getProxyTarget(targets, req)
		if (target) {
			proxy.web(req, res, { target })
		} else {
			res.sendStatus(404)
		}
	}

	function proxyWs (req, socket, head) {
		const target = getProxyTarget(targets, req)
		if (target) {
			proxy.ws(req, socket, head, { target })
		} else {
			socket.destroy()
		}
	}
}

function getProxyTarget (targets, req) {
	const host = req.headers['host']
	const name = host.slice(0, host.indexOf('.'))
	return targets[name] || targets.find(x => x.isDefault)
}
