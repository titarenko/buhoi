const config = require('./config')
const infra = require('./infra')
const webServer = require('./web-server')
const rpcResults = require('./web-server/rpc-results')
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

  file: rpcResults.file,
  session: rpcResults.session,
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
