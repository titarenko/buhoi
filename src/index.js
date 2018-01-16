const config = require('./config')
const infra = require('./infra')
const webServer = require('./web-server')
const results = require('./web-server/results')
const taskServer = require('./task-server')

module.exports = {
  config,

  start,
  stop,

  pg: infra.pg,
  mq: infra.mq,
  log: infra.log,
  v: infra.v,
  webpack: infra.webpack,

  file: results.file,
  session: results.session,
}

function start (options) {
  infra.initialize()

  webServer.start(options)
  taskServer.start(options)
}

async function stop () {
  await Promise.all([
    webServer.stop(),
    taskServer.stop(),
  ])
  await infra.terminate()
}
