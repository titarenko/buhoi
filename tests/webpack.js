const webpack = require('../modules/webpack')
const should_ = require('should')

describe('webpack', function () {
	it('should accept base path and construct complete config', function () {
		const config = webpack('basepath')
		config.entry.should.eql('basepath/client.js')
		config.output.should.eql({
			path: 'basepath/static',
			filename: 'bundle.js',
		})
		config.devServer.contentBase.should.eql('basepath/static')
	})
	it('should accept minimal config and construct complete config', function () {
		const expected = { entry: '1', output: '2', contentBase: '3' }
		const config = webpack(expected)
		const actual = {
			entry: config.entry,
			output: config.output,
			contentBase: config.devServer.contentBase,
		}
		actual.should.eql(expected)
	})
})