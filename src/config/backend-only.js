const simple = require('./simple')

module.exports = function createBackendOnlyConfig (options) {
  const simpleConfig = simple(options)
  return {
    ...simpleConfig,
    publicPath: undefined,
    webpackConfigPath: undefined,
  }
}
