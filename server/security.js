const Promise = require('bluebird')
const util = require('util')
const bcrypt = require('bcryptjs')

module.exports = {
	bypass: buildFilter({ requireAuthentication: false }),
	allow: buildFilter({ filterType: 'role' }),
	permit: buildFilter({ filterType: 'permission' }),

	hashPassword,
	verifyPassword,

	NotAuthenticatedError,
	NotAuthorizedError,
}

function buildFilter ({ requireAuthentication = true, filterType }) {
	return function () {
		const args = Array.from(arguments)
		const params = args.filter(it => typeof it != 'function')
		const actions = args.filter(it => typeof it == 'function')

		const isAuthorized = filterType == 'role'
			? user => params.length == 0 || params.some(it => user.roles.includes(it))
			: user => params.length == 0 || params.every(it => user.permissions.includes(it))

		return function (req_, res_) {
			return Promise.try(() => {
				if (requireAuthentication && !this.user) {
					throw new NotAuthenticatedError()
				}
				if (requireAuthentication && !isAuthorized(this.user)) {
					throw new NotAuthorizedError()
				}
				return actions.reduce(
					(previous, it) => previous.then(() => it.apply(this, arguments)),
					Promise.resolve()
				)
			})
		}
	}
}

function hashPassword (password) {
	return bcrypt.hashSync(password, 10)
}

function verifyPassword (password, hash) {
	return bcrypt.compareSync(password, hash)
}

function NotAuthenticatedError () {
	Error.call(this)
	Error.captureStackTrace(this, NotAuthenticatedError)
	this.message = 'not authenticated'
}

util.inherits(NotAuthenticatedError, Error)

function NotAuthorizedError () {
	Error.call(this)
	Error.captureStackTrace(this, NotAuthorizedError)
	this.message = 'not authorized'
}

util.inherits(NotAuthorizedError, Error)