const util = require('util')
const path = require('path')
const colors = require('colors/safe')
const EventEmitter = require('events').EventEmitter

module.exports = function (category, silent) {
	category = path.relative(path.join(__dirname, '../'), category)
	return new Logger(category, silent)
}

function Logger (category, silent) {
	this._category = category
	this._silent = silent
}

util.inherits(Logger, EventEmitter)

Logger.prototype.error = function () {
	this._log('error', colors.red, Array.from(arguments))
}

Logger.prototype.warn = function () {
	this._log('warn', colors.yellow, Array.from(arguments))
}

Logger.prototype.debug = function () {
	this._log('debug', x => x, Array.from(arguments))
}

Logger.prototype._log = function (level, color, args) {
	const time = new Date().toString()
	const message = util.format.apply(util, args)

	const content = `${time} ${level} ${this._category} ${message}`
	const coloredContent = `${colors.white(time)} ${color(level)} ${colors.cyan(this._category)} ${message}`

	if (level == 'error') {
		console.error(coloredContent) // eslint-disable-line no-console
	} else {
		console.log(coloredContent) // eslint-disable-line no-console
	}

	if (!this._silent) {
		this.emit('message', {
			time,
			level,
			category: this._category,
			message,
			content,
		})
	}
}