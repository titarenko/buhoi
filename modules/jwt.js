const jsonwebtoken = require('jsonwebtoken')

const algorithm = 'HS512'

module.exports = function (secret) {
	return {
		deserialize: token => {
			if (!token) {
				return null
			}
			try {
				return jsonwebtoken.verify(token, secret, { algorithms: [algorithm] })
			} catch (e_) {
				return null
			}
		},
		serialize: payload => jsonwebtoken.sign(payload, secret, { algorithm }),
	}
}
