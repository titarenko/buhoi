const config = require('./config')
const infra = require('./infra')
const webServer = require('./web-server')
const results = require('./web-server/results')
const taskServer = require('./task-server')

const infraPublics = ['pg', 'mq', 'log', 'mklog', 'v', 'webpack', 'request']
const resultsPublics = ['file', 'session']

infra.initialize()

module.exports = new Proxy({ config, start, stop }, { get })

async function start (options) {
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

function get (target, name) {
  return target[name] ||
    infraPublics.includes(name) && infra[name] ||
    resultsPublics.includes(name) && results[name]
}
