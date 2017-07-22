const jsonwebtoken = require('jsonwebtoken')
const cookie = require('cookie')

const algorithm = 'HS512'

module.exports = function (secret) {
	return { serialize, deserialize, middleware }

	function deserialize (token) {
		if (!token) {
			return null
		}
		try {
			return jsonwebtoken.verify(token, secret, { algorithms: [algorithm] })
		} catch (e_) {
			return null
		}
	}

	function serialize (payload) {
		return jsonwebtoken.sign(payload, secret, { algorithm })
	}

	function middleware ({ field = 'user', options = { expires: 0, secure: true, httpOnly: true } }) {
		return (req, res, next) => {
			const cookies = cookie.parse(req.headers.cookie || '')
			req[field] = deserialize(cookies[field])
			res.jwt = payload => {
				if (payload != null) {
					res.cookie(field, serialize(payload), options)
				} else {
					res.clearCookie(field)
				}
			}
			next()
		}
	}
}
