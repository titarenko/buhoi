const express = require('express')
const rpcErrors = require('./rpc-errors')

module.exports = { create, dispose }

function create ({
  web: { publicPath, webpackConfigPath },
  rpc,
}) {
  const app = express()

  const webpackHotDevServer = require('./middleware/webpack-hot-dev-server')(webpackConfigPath)
  app.webpackHotDevServer = webpackHotDevServer

  app.use(require('./middleware/access-log')({ category: __filename }))
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(webpackHotDevServer)
  app.use(require('./middleware/rpc-host')({ ...rpc, ...rpcErrors }))
  app.use(express.static(publicPath))
  app.use(require('./middleware/html5-history-fallback')(publicPath))
  app.use(require('./middleware/error-handler')(rpcErrors))

  return app
}

function dispose (app) {
  return app.webpackHotDevServer.dispose()
}
