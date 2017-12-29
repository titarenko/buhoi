const infra = require('./infra')
const webserver = require('./webserver')
const rpcResults = require('./webserver/rpc-results')
const taskserver = require('./taskserver')
const _ = require('lodash')

module.exports = {
  start,
  stop,

  pg: infra.pg,
  mq: infra.mq,
  log: infra.log,
  v: infra.v,

  file: rpcResults.file,
  session: rpcResults.session,
}

function start (options = { }) {
  _.extend({
    featuresPath: `${__dirname}/../../features`,
    publicPath: `${__dirname}/../../public`,
    webpackConfigPath: `${__dirname}/../../pages/webpack.config.js`,
  }, options)

  infra.initialize()

  webserver.start(options)
  taskserver.start(options)
}

async function stop () {
  await Promise.all([
    webserver.stop(),
    taskserver.stop(),
  ])
  await infra.terminate()
}
