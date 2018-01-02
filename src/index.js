const infra = require('./infra')
const webServer = require('./web-server')
const rpcResults = require('./web-server/rpc-results')
const taskServer = require('./task-server')
const _ = require('lodash')
const client = require('./client')

module.exports = {
  start,
  stop,

  pg: infra.pg,
  mq: infra.mq,
  log: infra.log,
  v: infra.v,

  file: rpcResults.file,
  session: rpcResults.session,

  client,
}

function start (options = { }) {
  _.extend({
    featuresPath: `${__dirname}/../../features`,
    publicPath: `${__dirname}/../../public`,
    webpackConfigPath: `${__dirname}/../../pages/webpack.config.js`,
  }, options)

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
