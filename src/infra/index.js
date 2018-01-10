const korrekt = require('korrekt')

const log = require('./log')
const pg = require('./pg')
const mq = require('./mq')
const webpack = require('./webpack')

module.exports = { initialize, terminate, v: korrekt, webpack }

async function initialize () {
  module.exports.log = await log.initialize()
  await Promise.all([pg.initialize(), mq.initialize()]).then(([pg, mq]) => {
    module.exports.pg = pg
    module.exports.mq = mq
  })
}

async function terminate () {
  await Promise.all([
    pg.terminate(module.exports.pg),
    mq.terminate(module.exports.mq),
  ])
}
