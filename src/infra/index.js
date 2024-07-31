const korrekt = require('korrekt')

const log = require('./log')
const pg = require('./pg')
const mq = require('./mq')
const cache = require('./cache')
const webpack = require('./webpack')

module.exports = { initialize, terminate, v: korrekt, webpack }

function initialize () {
  module.exports.log = module.exports.mklog = log.initialize()
  module.exports.pg = pg.initialize()
  module.exports.mq = mq.initialize()
  module.exports.cache = cache.initialize()
}

async function terminate () {
  await Promise.all([
    pg.terminate(module.exports.pg),
    mq.terminate(module.exports.mq),
    cache.terminate(module.exports.cache),
  ])
}
