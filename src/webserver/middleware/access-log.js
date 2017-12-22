const Stream = require('totlog/stream')

module.exports = function (options) {
  const format = ':status :response-time ms :remote-addr :req[session] :method :url'
  const stream = new Stream(options)
  return morgan(format, { stream })
}
