const util = require('util')
const path = require('path')
const colors_ = require('colors')

module.exports = function (category) {
	category = path.relative(path.join(__dirname, '../'), category)
	return {
		error: log(true, 'error'.red, category),
		warn: log(false, 'warn'.yellow, category),
		debug: log(false, 'debug', category),
	}
}

function log (disaster, level, category) {
	return function () {
		const message = util.format.apply(util, arguments)
		const content = `${new Date().toString().white} ${level} ${category.cyan} ${message}`
		if (disaster) {
			console.error(content) // eslint-disable-line no-console
		} else {
			console.log(content) // eslint-disable-line no-console
		}
	}
}