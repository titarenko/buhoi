const infra = require('./infra')
const webserver = require('./webserver')
const taskserver = require('./taskserver')

module.exports = {
  start,
  stop,

  pg: infra.pg,
  mq: infra.mq,
  log: infra.log,
  v: infra.v,
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
