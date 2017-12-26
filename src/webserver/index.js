const glob = require('glob')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const { pg, rmq, errors } = require('infra')
const totlog = require('totlog')
const log = require('totlog')(__filename)
const historyFallback = require('./html5-history-fallback')
const validation = require('./validation')

module.exports = { start, stop }

publicPath = `${__dirname}/../../../public`

function start (optio) {
  module.exports.transport = transport
  module.exports.carrier = carrier

  log.debug('web server started')

  return {
    stop: () => {
      log.debug('shutdown requested')
      redirector.shutdown(() => {
        carrier.shutdown(() => {
          pg.destroy(async () => {
            await rmq.close()
            log.debug('server stopped')
            process.exit(0)
          })
        })
      })
    },
  }
}

function createRedirector () {
  return httpShutdown(http.createServer((req, res) => {
    res.writeHead(301, { 'Location': `https://${req.headers['host']}${req.url}` })
    res.end()
  }))
}

function createCarrier (app) {
  const load = cert => fs.readFileSync(`${process.env.CERTS}/${cert}`)
  return httpShutdown(https.createServer({
    key: load('privkey.pem'),
    cert: load('fullchain.pem'),
    ca: load('chain.pem'),
    dhparam: load('dh.pem'),
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
  }, app))
}

function createApp () {
  const app = express()
  const publicPath = resolve(`${__dirname}/../ui/public`)

  app.use(morgan(':status :remote-addr :date[iso] :method :url :response-time ms'))
  app.use('/.well-known/acme-challenge', express.static(process.env.WEBROOT))
  app.use(require('./webpack'))
  app.use(require('./session'))
  app.use(bodyParser.json())
  app.use(require('./query-parser'))
  app.use(getAreas(publicPath))
  app.use(express.static(publicPath))
  app.use((error, req, res, next) => {

  })

  return app
}

function getAreas (publicPath) {
  const areas = glob.sync('**/index.js', { cwd: `${__dirname}/../areas` })
  const router = express.Router()
  areas.forEach(path => {
    const area = path.replace('/index.js', '')
    const instance = require(`areas/${area}`)
    router.use(`/${area}`, historyFallback(publicPath), instance)
  })
  return router
}
