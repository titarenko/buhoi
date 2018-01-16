const assert = require('assert')
const glob = require('glob')
const humanInterval = require('human-interval')

const projectPath = `${__dirname}/../../..`

module.exports = function createSimpleConfig ({
  featuresPath = `${projectPath}/features`,
  publicPath = `${projectPath}/ui/public`,
  webpackConfigPath = `${projectPath}/ui/webpack.config.js`,
  isAuthorized,
} = { }) {
  assert.equal(typeof isAuthorized, 'function')

  return {
    featuresPath,
    publicPath,
    webpackConfigPath,
    rpc: {
      isAuthorized,
      authorizationCacheDuration: humanInterval(process.env.BUHOI_AUTH_CACHE_DURATION || '1 minute'),

      maxInputSize: process.env.BUHOI_MAX_INPUT_SIZE || '10mb',
      resolveProcedure: createResolveProcedure(featuresPath),
      getContext: () => null,
    },
  }
}

function createResolveProcedure (featuresPath) {
  const registry = glob.sync('**/index.js', { cwd: featuresPath })
    .reduce((map, path) => ({
      ...map,
      [getFeatureName(path)]: loadFeature(featuresPath, path),
    }), { })

  return function resolveProcedure (feature, procedure) {
    const procedures = registry[feature]
    return procedures && procedures[procedure]
  }
}

function getFeatureName (path) {
  return path.replace('/index.js', '')
}

function loadFeature (basePath, featurePath) {
  const feature = require(`${basePath}/${featurePath}`)
  return Object.keys(feature)
    .filter(name => typeof feature[name] === 'function')
    .reduce((map, name) => {
      const body = feature[name]
      const code = body.toString()
      const cacheMatch = code.match(/\/\/ @cache (.+)/)
      return {
        ...map,
        [name]: {
          public: code.includes('// @public'),
          cache: cacheMatch && humanInterval(cacheMatch[1]),
          body,
        },
      }
    }, { })
}
