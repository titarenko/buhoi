const knex = require('knex')

module.exports = { initialize, terminate }

function initialize () {
  const { BUHOI_PG, BUHOI_APP } = process.env

  if (!BUHOI_PG) {
    return
  }

  const pg = knex({
    client: 'pg',
    connection: BUHOI_PG,
    pool: {
      min: process.env.BUHOI_PG_POOL || 2,
      max: process.env.BUHOI_PG_POOL || 10,
    },
  })

  if (BUHOI_APP) {
    pg.modify = (user, fn) => pg.transaction(async t => {
      await pg.raw('select set_config(:name, :value, false)', {
        name: `${BUHOI_APP}.current_user_id`,
        value: user.id,
      }).transacting(t)
      await fn(t)
    })
  }

  return pg
}

function terminate (pg) {
  if (pg) {
    return new Promise(pg.destroy)
  }
}
