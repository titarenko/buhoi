const totlog = require('totlog')
const korrekt = require('korrekt')
const knex = require('knex')
const mqu = require('mqu')

module.exports = { initialize, terminate, log: totlog, v: korrekt }

function initialize () {
  intializeLog()
  initializePg()
  initializeMq()
}

function intializeLog () {
  const { BUHOI_SLACK, BUHOI_LOGSTASH } = process.env

  if (BUHOI_SLACK) {
    const [token, channel, icon] = BUHOI_SLACK.split(';')
    const slack = totlog.appenders.slack({ token, channel, icon })
    totlog.on('message', m => {
      if (m.level === 'error') {
        slack(m)
      }
    })
  }

  if (BUHOI_LOGSTASH) {
    const logstash = totlog.appenders.logstash({ url: BUHOI_LOGSTASH })
    totlog.on('message', logstash)
  }
}

function initializePg () {
  const { BUHOI_PG, BUHOI_APP } = process.env

  if (!BUHOI_PG) {
    return
  }

  const pg = knex({
    client: 'pg',
    connection: BUHOI_PG,
  })

  if (BUHOI_APP) {
    pg.modify = (user, fn) => pg.transaction(async t => {
      await pg('pg_settings')
        .transacting(t)
        .update({ setting: user.id })
        .where({ name: `${BUHOI_APP}.current_user_id` })
      await fn(t)
    })
  }

  module.exports.pg = pg
}

function initializeMq () {
  const { BUHOI_MQ } = process.env

  if (BUHOI_MQ) {
    module.exports.mq = mqu(BUHOI_MQ)
  }
}

async function terminate () {
  await Promise.all([
    terminatePg(),
    terminateMq(),
  ])
}

function terminatePg () {
  const { pg } = module.exports
  return pg ? new Promise(pg.destroy) : Promise.resolve()
}

function terminateMq () {
  const { mq } = module.exports
  return mq ? mq.close() : Promise.resolve()
}
