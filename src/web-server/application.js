const assert = require('assert')
const express = require('express')
const errors = require('./errors')

module.exports = { create, dispose }

function create (options) {
  if (process.env.NODE_ENV === 'development' || process.env.BUHOI_CERTS_PATH) {
    return createNormalApp(options)
  } else {
    return createWebrootApp(options)
  }
}

function dispose (app) {
  if (app.webpackHotDevServer) {
    return app.webpackHotDevServer.dispose()
  }
}

function createNormalApp ({
  prerouter,
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
  if (prerouter) {
    app.use(prerouter)
  }
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(webpackHotDevServer)
  app.use(require('./middleware/session')())
  app.use(require('./middleware/rpc-host')({ ...rpc, ...errors }))
  app.use(express.static(publicPath))
  app.use(require('./middleware/html5-history-fallback')(publicPath))
  app.use(require('./middleware/error-handler')(errors))

  return app
}

function createWebrootApp (options) {
  const app = express()
  app.use(require('./middleware/letsencrypt-webroot')())
  return app
}
