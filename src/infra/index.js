const korrekt = require('korrekt')

const log = require('./log')
const pg = require('./pg')
const mq = require('./mq')
const cache = require('./cache')
const webpack = require('./webpack')

module.exports = { initialize, terminate, v: korrekt, webpack, cache }

async function initialize () {
  module.exports.log = await log.initialize()
  await Promise.all([
    pg.initialize(),
    mq.initialize(),
    cache.initialize(),
  ]).then(([pg, mq, cache]) => {
    module.exports.pg = pg
    module.exports.mq = mq
    module.exports.cache = cache
  })
}

async function terminate () {
  await Promise.all([
    pg.terminate(module.exports.pg),
    mq.terminate(module.exports.mq),
    cache.terminate(module.exports.cache),
  ])
}
