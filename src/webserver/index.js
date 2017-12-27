const application = require('./application')
const transport = require('./transport')

module.exports = { start, stop }

let app, server

function start (options) {
  app = application.create(options)
  server = transport.create(app)
}

async function stop () {
  await transport.dispose(server)
  await application.dispose(app)
}
