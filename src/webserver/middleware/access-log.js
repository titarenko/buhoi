const Stream = require('totlog/stream')
const morgan = require('morgan')

module.exports = function accessLog (options) {
  const format = ':status :response-time ms :remote-addr :req[cookie] :method :url'
  const stream = new Stream(options)
  return morgan(format, { stream })
}
