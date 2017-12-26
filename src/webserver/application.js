const express = require('express')
const rpcErrors = require('./rpc-errors')

module.exports = function ({
  web: { publicPath, webpackConfigPath },
  rpc,
  beforeExit,
} = { }) {
  const app = express()

  app.use(require('./middleware/access-log')({ category: __filename }))
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(require('./middleware/webpack-hot-dev-server')({ webpackConfigPath, beforeExit }))
  app.use(require('./middleware/rpc-host')({ ...rpc, ...rpcErrors }))
  app.use(express.static(publicPath))
  app.use(require('./middleware/html5-history-fallback')(publicPath))
  app.use(require('./middleware/error-handler')(rpcErrors))

  return app
}
