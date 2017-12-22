const constants = require('constants')
const fs = require('fs')
const { resolve } = require('path')
const http = require('http')
const httpShutdown = require('http-shutdown')
const https = require('https')
const glob = require('glob')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const { scheduleJob } = require('node-schedule')
const { pg, rmq, errors } = require('infra')
const totlog = require('totlog')
const log = require('totlog')(__filename)
const historyFallback = require('./html5-history-fallback')
const validation = require('./validation')

module.exports = { start }

function start () {
  configureLogging()
  startTasks()

  const redirector = createRedirector()
  const carrier = createCarrier(createApp())

  redirector.listen(process.env.HTTP_PORT || 80)
  carrier.listen(process.env.HTTPS_PORT || 443)

  log.debug('server started')

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
    if (error instanceof validation.ValidationError) {
      res.status(400).json(error.fields)
    } else if (error instanceof errors.NotAuthenticatedError) {
      res.status(401).end()
    } else if (error instanceof errors.NotAuthorizedError) {
      log.warn(req.path, error)
      res.status(403).end()
    } else {
      log.error(req.path, error)
      res.status(500).end()
    }
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

function configureLogging () {
  const url = process.env.LOGSTASH_URL
  if (url) {
    totlog.on('message', totlog.appenders.logstash({ url }))
  }
}

function startTasks () {
  if (['0', 'false'].includes(process.env.TASKS)) {
    return
  }

  const name = path => path
    .replace('/tasks', '')
    .replace('/', ':')
    .replace(/.js$/, '')

  const tasks = glob.sync('**/tasks/*.js', { cwd: `${__dirname}/../features` })
  const modules = tasks.map(path => require(`features/${path}`))

  tasks.forEach((path, index) => rmq.consumeJob(name(path), modules[index].handler))

  rmq.consumeJob('schedule', () => new Promise((resolve, reject) =>
    modules.forEach((m, index) => scheduleJob(
      m.schedule,
      () => rmq.publishJob(name(tasks[index]))
    ))
  ))
}