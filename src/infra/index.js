const korrekt = require('korrekt')

const log = require('./log')
const pg = require('./pg')
const mq = require('./mq')

module.exports = { initialize, terminate, v: korrekt }

async function initialize () {
  module.exports.log = await log.intialize()
  await Promise.all([pg.initialize(), mq.intialize()]).then(([pg, mq]) => {
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