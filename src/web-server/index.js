const application = require('./application')
const transport = require('./transport')

module.exports = { start, stop }

let app, server

function start (options) {
  if (process.env.BUHOI_DISABLE_WEB) {
    return
  }
  app = application.create(options)
  server = transport.create(app)
}

async function stop () {
  if (process.env.BUHOI_DISABLE_WEB) {
    return
  }
  await transport.dispose(server)
  await application.dispose(app)
}
