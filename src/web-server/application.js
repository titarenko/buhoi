const assert = require('assert')
const express = require('express')
const errors = require('./errors')

module.exports = { create, dispose }

function create ({
  publicPath,
  webpackConfigPath,
  rpc,
} = { }) {
  assert.equal(typeof publicPath, 'string')
  assert.equal(typeof webpackConfigPath, 'string')
  assert.equal(typeof rpc, 'object')

  const app = express()

  const webpackHotDevServer = require('./middleware/webpack-hot-dev-server')(webpackConfigPath)
  app.webpackHotDevServer = webpackHotDevServer

  app.use(require('./middleware/access-log')({ category: __filename }))
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(webpackHotDevServer)
  app.use(require('./middleware/session')())
  app.use(require('./middleware/rpc-host')({ ...rpc, ...errors }))
  app.use(express.static(publicPath))
  app.use(require('./middleware/html5-history-fallback')(publicPath))
  app.use(require('./middleware/error-handler')(errors))

  return app
}

function dispose (app) {
  return app.webpackHotDevServer.dispose()
}
