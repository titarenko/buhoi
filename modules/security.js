const Promise = require('bluebird')
const util = require('util')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
	bypass: buildFilter({ requireAuthentication: false }),
	allow: buildFilter({ filterType: 'role' }),
	permit: buildFilter({ filterType: 'permission' }),

	hashPassword,
	verifyPassword,

	serialize: jwt.sign,
	deserialize,

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

function deserialize (token, secret) {
	try {
		return jwt.verify(token, secret)
	} catch (e) {
		return null
	}
}

function NotAuthenticatedError () {
	this.message = 'not authenticated'
	Error.call(this, this.message)
	Error.captureStackTrace(this, NotAuthenticatedError)
}

util.inherits(NotAuthenticatedError, Error)

function NotAuthorizedError () {
	this.message = 'not authorized'
	Error.call(this, this.message)
	Error.captureStackTrace(this, NotAuthorizedError)
}

util.inherits(NotAuthorizedError, Error)