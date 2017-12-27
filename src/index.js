const infra = require('./infra')
const webserver = require('./webserver')
const rpcResults = require('./webserver/rpc-results')
const taskserver = require('./taskserver')

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

function start () {
  infra.initialize()

  webserver.start()
  taskserver.start()
}

async function stop () {
  await Promise.all([
    webserver.stop(),
    taskserver.stop(),
  ])
  await infra.terminate()
}
