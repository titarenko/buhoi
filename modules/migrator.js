const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const knex = require('knex')
const keyBy = require('lodash.keyby')
const log = require('totlog')(__filename)

const readdir = Promise.promisify(fs.readdir, { context: fs })

module.exports = migrate

function migrate ({ connection, folders }) {
	const [who, where, database] = connection.slice(11).split(/@\//)
	const [host, port = '5432'] = where.split(':')
	const [user] = who.split(':')

	fs.writeFileSync(`${process.env.HOME}/.pgpass`, `${host}:${port}:${database}:${who}`)

	const pg = knex({ client: 'pg', connection })
	const psql = file => execSync(`psql -v ON_ERROR_STOP=1 -q -w -h ${host} -U ${user} -d ${database} -f ${file}`)

	const files = Promise.resolve(folders)
		.mapSeries(d => readdir(d).then(files => files.map(f => path.join(d, f))))
		.then(groups => groups.length > 1 ? groups[0].concat(...groups.slice(1)) : groups[0] || [])

	Promise.join(
		pg('migrations'),
		files,
		(migrations, files) => runAll({ pg, psql, migrations, files })
	).tap(() => {
		log.debug('done!')
		process.exit(0)
	}).catch(e => {
		if (e.message == 'Pool was destroyed' || e.code == 'ECONNREFUSED') {
			log.warn('pg is not ready yet, try later')
			process.exit(75)
		}
		log.error(`fatal ${e.stack}`)
		process.exit(1)
	})
}

function runAll ({ pg, psql, migrations, files }) {
	const index = keyBy(migrations, 'name')
	files = files.filter(file => !index[file] && /\.sql$/.test(file))
	files.sort()
	return files.reduce(
		(previous, file) => previous.then(() => runSingle({ pg, psql, file })),
		Promise.resolve()
	)
}

function runSingle ({ pg, psql, file }) {
	return Promise
		.try(() => psql(file))
		.then(() => pg('migrations').insert({ name: path.filename(file) }).returning('name').then(it => it[0]))
		.tap(name => log.debug(`applied ${name}`))
}