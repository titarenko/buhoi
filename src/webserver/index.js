const application = require('./application')
const transport = require('./transport')

module.exports = { start, stop }

let app, server

function start (options) {
  app = application(options)
  server = transport(app)
}

async function stop () {
  await app.stop()
  await server.stop()
}
