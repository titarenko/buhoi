module.exports = { getConfig }

function getConfig ({
  entryPath,
  outputPath,
  stylesPath,
  uiModulesPath,
}) {
  const sassLoaderOptions = stylesPath
    ? '?' + JSON.stringify({ includePaths: [stylesPath], sourceMap: true })
    : ''
  const styleLoaderChain = `css-loader!resolve-url-loader!sass-loader${sassLoaderOptions}`
  return {
    entry: entryPath,
    output: {
      path: outputPath,
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /js$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /scss$/,
          loader: `style-loader!${styleLoaderChain}`,
        },
        {
          test: /(png|woff|woff2|eot|ttf|svg)$/,
          use: 'url-loader',
        },
        {
          test: /vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              scss: `vue-style-loader!${styleLoaderChain}`,
            },
          },
        },
      ],
    },
    resolve: {
      modules: ['node_modules', uiModulesPath].filter(Boolean),
    },
    devtool: 'source-map',
  }
}
