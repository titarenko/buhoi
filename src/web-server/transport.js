const { constants } = require('crypto')
const fs = require('fs')
const http = require('http')
const https = require('https')
const httpShutdown = require('http-shutdown')

module.exports = { create, dispose }

function create (app) {
  if (process.env.NODE_ENV === 'development' || process.env.BUHOI_CERTS_PATH) {
    return createHttpsTransport(app)
  } else {
    return createHttpTransport(app)
  }
}

function dispose (transport) {
  if (transport.redirector) {
    return new Promise(
      resolve => transport.redirector.shutdown(
        () => transport.carrier.shutdown(resolve),
      ),
    )
  } else {
    return new Promise(resolve => transport.carrier.shutdown(resolve))
  }
}

function createHttpsTransport (app) {
  const {
    BUHOI_PORTS = process.env.NODE_ENV === 'development'
      ? '3000;3001'
      : '80;443',
  } = process.env

  const [httpPort, httpsPort] = BUHOI_PORTS.split(';')

  const redirector = createRedirector()
  const carrier = createCarrier(app)

  redirector.listen(httpPort)
  carrier.listen(httpsPort)

  return { redirector, carrier }
}

function createHttpTransport (app) {
  const {
    BUHOI_PORTS = process.env.NODE_ENV === 'development' ? '3000' : '80',
  } = process.env

  const server = http.createServer(app)

  server.keepAliveTimeout = getKeepAliveTimeout()

  const carrier = httpShutdown(server)

  carrier.listen(BUHOI_PORTS)

  return { carrier }
}

function createRedirector () {
  return httpShutdown(http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers['host']}${req.url}` })
    res.end()
  }))
}

function createCarrier (app) {
  const {
    BUHOI_CERTS_PATH = process.env.NODE_ENV === 'development'
      ? `${__dirname}/../../etc/certs`
      : undefined,
  } = process.env

  if (!BUHOI_CERTS_PATH) {
    throw new Error('BUHOI_CERTS_PATH is required')
  }

  const load = cert => fs.readFileSync(`${BUHOI_CERTS_PATH}/${cert}`)

  const server = https.createServer({
    key: load('privkey.pem'),
    cert: load('fullchain.pem'),
    ca: load('chain.pem'),
    dhparam: load('dh.pem'),
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
  }, app)

  server.keepAliveTimeout = getKeepAliveTimeout()

  return httpShutdown(server)
}

function getKeepAliveTimeout () {
  const keepAliveTimeout = Number(process.env.BUHOI_KEEP_ALIVE_TIMEOUT)
  return isNaN(keepAliveTimeout) ? 0 : keepAliveTimeout
}
