const request = require('request')
const Promise = require('bluebird')
const korrekt = require('korrekt')
const { format } = require('util')

class UnexpectedResponseError extends Error {
  constructor (response) {
    super(format('Unexpected response %d %j', response.statusCode, response.body))
    this.response = response
  }
}

const log = require('./log')
const pg = require('./pg')
const mq = require('./mq')
const cache = require('./cache')
const webpack = require('./webpack')

module.exports = { initialize, terminate, v: korrekt, webpack }

function initialize () {
  module.exports.log = log.initialize()
  module.exports.pg = pg.initialize()
  module.exports.mq = mq.initialize()
  module.exports.cache = cache.initialize()
  module.exports.request = Promise.promisify(request)
  module.exports.request.UnexpectedResponseError = UnexpectedResponseError
}

async function terminate () {
  await Promise.all([
    pg.terminate(module.exports.pg),
    mq.terminate(module.exports.mq),
    cache.terminate(module.exports.cache),
  ])
}
