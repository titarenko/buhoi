const loaderUtils = require('loader-utils')
const Promise = require('bluebird')
const fs = require('fs')

const readFile = Promise.promisify(fs.readFile, { context: fs })

module.exports = function (source, sourceMap) {
	const sourceMapping = source.match(/sourceMappingURL=\S+\.js\.map/g)
	if (!sourceMapping) {
		return source
	}

	const filename = sourceMapping[0].slice(17)
	const resolve = Promise.promisify(this.resolve, { context: this })
	const done = this.async()

	resolve(this.context, loaderUtils.urlToRequest(filename))
		.then(filepath => {
			this.addDependency(filepath)
			return readFile(filepath, 'utf-8')
		})
		.then(content => done(null, source, content))
		.catch(error => {
			this.emitWarning(`failed to load ${filename} due to ${error.stack}`)
			done(error, source, sourceMap)
		})
}