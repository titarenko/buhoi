const webpack = require('webpack')

const isDevelopment = !['production', 'staging'].includes(process.env.NODE_ENV)

module.exports = create

function create ({ entryPath, outputPath }) {
	return {
		entry: entryPath,
		output: {
			path: outputPath,
			filename: 'bundle.js',
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							plugins: ['inferno', 'syntax-jsx', 'transform-runtime'],
							presets: ['es2015', 'stage-0', 'es2017'],
						},
					},
				},
			],
		},
		resolve: { extensions: ['.js', '.jsx'] },
		plugins: [
			new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(isDevelopment ? '' : 'production') }),
			new webpack.ProvidePlugin({ 'Inferno': 'inferno' }),
		].concat(!isDevelopment ? [
			new webpack.optimize.DedupePlugin(),
			new webpack.optimize.AggressiveMergingPlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: { warnings: false },
				output: { comments: false },
			}),
		] : []),
		devtool: 'source-map',
		devServer: {
			hot: true,
			contentBase: outputPath,
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