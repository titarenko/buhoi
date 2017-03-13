const webpack = require('webpack')

module.exports = function (config) {
	if (typeof config == 'string') {
		const staticPath = `${config}/static`
		return create({
			entry: `${config}/client.js`,
			output: {
				path: staticPath,
				filename: 'bundle.js',
			},
			contentBase: staticPath,
		})
	} else {
		return create(config)
	}
}

function create ({ entry, output, contentBase }) {
	return {
		entry,
		output,
		resolve: { extensions: ['.js', '.jsx'] },
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /(node_modules)|(buhoi-client)|(buhoi-ui)/,
					use: {
						loader: 'babel-loader',
						options: {
							plugins: ['syntax-jsx', 'inferno'],
							presets: ['stage-0', 'es2015'],
						},
					},
				},
				{
					test: /\.scss$/,
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
			],
		},
		plugins: [
			new webpack.ProvidePlugin({ 'Inferno': 'inferno' }),
			new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
			new webpack.optimize.UglifyJsPlugin(),
		],
		devtool: 'source-map',
		devServer: {
			contentBase,
			proxy: {
				'/api/*': {
					target: 'http://localhost:3000',
					pathRewrite: { '^/api': '' },
				},
			},
			historyApiFallback: true,
		},
	}
}