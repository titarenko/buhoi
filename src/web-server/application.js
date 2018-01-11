const express = require('express')
const rpcErrors = require('./rpc-errors')
const { v } = require('../infra')

module.exports = { create, dispose }

const validateOptions = v.create({
  publicPath: v.required(v.string({ min: 1 })),
  webpackConfigPath: v.required(v.string({ min: 1 })),
  rpc: v.required(),
})

function create (options) {
  const {
    publicPath,
    webpackConfigPath,
    rpc,
  } = validateOptions(options)

  const app = express()

  const webpackHotDevServer = require('./middleware/webpack-hot-dev-server')(webpackConfigPath)
  app.webpackHotDevServer = webpackHotDevServer

  app.use(require('./middleware/access-log')({ category: __filename }))
  app.use(require('./middleware/letsencrypt-webroot')())
  app.use(webpackHotDevServer)
  app.use(require('./middleware/session')())
  app.use(require('./middleware/rpc-host')({ ...rpc, ...rpcErrors }))
  app.use(express.static(publicPath))
  app.use(require('./middleware/html5-history-fallback')(publicPath))
  app.use(require('./middleware/error-handler')(rpcErrors))

  return app
}

function dispose (app) {
  return app.webpackHotDevServer.dispose()
}
