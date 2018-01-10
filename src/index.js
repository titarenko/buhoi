const infra = require('./infra')
const webServer = require('./web-server')
const rpcResults = require('./web-server/rpc-results')
const taskServer = require('./task-server')
const _ = require('lodash')

module.exports = {
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

function start (options = { }) {
  _.extend({
    featuresPath: `${__dirname}/../../src/features`,
    publicPath: `${__dirname}/../../src/public`,
    webpackConfigPath: `${__dirname}/../../src/pages/webpack.config.js`,
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
