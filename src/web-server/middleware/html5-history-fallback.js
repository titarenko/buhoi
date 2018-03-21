const assert = require('assert')

module.exports = function html5HistoryFallback (publicPath) {
  assert(typeof publicPath, 'string')
  return function html5HistoryFallbackMiddleware (req, res, next) {
    return res.sendFile(`${publicPath}/index.html`)
  }
}
