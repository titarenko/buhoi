const knex = require('knex')

module.exports = { initialize, terminate }

function initialize () {
  const { BUHOI_PG, BUHOI_APP, BUHOI_PG_RO } = process.env

  if (!BUHOI_PG) {
    return
  }

  const poolSize = process.env.BUHOI_PG_POOL != null
    ? Number(process.env.BUHOI_PG_POOL)
    : undefined

  const pg = knex({
    client: 'pg',
    connection: BUHOI_PG,
    pool: poolSize && { min: 0, max: poolSize },
  })

  if (BUHOI_APP) {
    pg.modify = (user, fn) => pg.transaction(async t => {
      await pg.raw('select set_config(:name, :value, false)', {
        name: `${BUHOI_APP}.current_user_id`,
        value: user.id,
      }).transacting(t)
      return fn(t)
    })
  }

  if (BUHOI_PG_RO) {
    pg.ro = knex({
      client: 'pg',
      connection: BUHOI_PG_RO,
      pool: poolSize && { min: 0, max: poolSize },
    })
  }

  return pg
}

function terminate (pg) {
  if (pg) {
    return new Promise(pg.ro
      ? destroyPg(pg.ro)
      : r => r()
    ).then(() => destroyPg(pg))
  }
}

function destroyPg (pg) {
  return new Promise((resolve, reject) => {
    try {
      pg.destroy().then(() => resolve())
    } catch (e) {
      reject(e)
    }
  })
}
