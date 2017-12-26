const knex = require('knex')

module.exports = { initialize, terminate }

function initialize () {
  const { BUHOI_PG, BUHOI_APP } = process.env

  if (!BUHOI_PG) {
    return
  }

  const pg = knex({ client: 'pg', connection: BUHOI_PG })

  if (BUHOI_APP) {
    pg.modify = (user, fn) => pg.transaction(async t => {
      await pg('pg_settings')
        .transacting(t)
        .update({ setting: user.id })
        .where({ name: `${BUHOI_APP}.current_user_id` })
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
