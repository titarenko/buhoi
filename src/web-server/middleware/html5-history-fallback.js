const assert = require('assert')

module.exports = function html5HistoryFallback (publicPath) {
  assert(typeof publicPath, 'string')
  return function html5HistoryFallbackMiddleware (req, res, next) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    return res.sendFile(`${publicPath}/index.html`)
  }
}
