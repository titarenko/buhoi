const { Router } = require('express')

module.exports = function webpackHotDevServer (webpackConfigPath) {
  const router = Router()

  if (webpackConfigPath &&
    process.env.NODE_ENV === 'development' &&
    !process.env.BUHOI_DISABLE_WEBPACK_DEV_MIDDLEWARE) {
    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware = require('webpack-hot-middleware')
    const webpack = require('webpack')
    const webpackConfig = require(webpackConfigPath)
    const compiler = webpack(webpackConfig)
    const instance = webpackDevMiddleware(compiler)

    router.use(instance)
    router.use(webpackHotMiddleware(compiler))

    router.dispose = () => new Promise(instance.close)
  } else {
    router.dispose = () => Promise.resolve()
  }

  return router
}
