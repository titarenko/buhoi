const assert = require('assert')
const express = require('express')
const compression = require('compression')
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
  postrouter,
  publicPath,
  webpackConfigPath,
  rpc,
  session,
} = { }) {
  assert.ok(typeof publicPath === 'string' || publicPath === undefined, 'publicPath must be a string or undefined')
  assert.equal(typeof rpc, 'object')

  const app = express()
  if (!process.env.BUHOI_DISABLE_COMPRESSION) {
    app.use(compression())
  }

  const webpackHotDevServer = require('./middleware/webpack-hot-dev-server')(webpackConfigPath)
  app.webpackHotDevServer = webpackHotDevServer

  app.use(require('./middleware/access-log')({ category: __filename }))
  if (prerouter) {
    app.use(prerouter)
  }
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(webpackHotDevServer)
  app.use(require('./middleware/session')(session))
  app.use(require('./middleware/rpc-host')({ ...rpc, ...errors }))
  if (publicPath) {
    app.use(express.static(publicPath))
    app.use(require('./middleware/html5-history-fallback')(publicPath))
  }
  if (postrouter) {
    app.use(postrouter)
  }
  app.use(require('./middleware/error-handler')(errors))

  return app
}

function createWebrootApp (options) {
  const app = express()
  app.use(require('./middleware/letsencrypt-webroot')())
  return app
}
