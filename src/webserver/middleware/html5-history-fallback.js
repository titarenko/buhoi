module.exports = function html5HistoryFallback (publicPath) {
  return function html5HistoryFallbackMiddleware (req, res, next) {
    return res.sendFile(`${publicPath}/index.html`)
  }
}
