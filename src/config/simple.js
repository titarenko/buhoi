const glob = require('glob')
const humanInterval = require('human-interval')
const { v } = require('../infra')

const validateOptions = v.create({
  featuresPath: v.string({ min: 1 }),
  publicPath: v.string({ min: 1 }),
  webpackConfigPath: v.string({ min: 1 }),
  isAuthorized: v.required(v.function({ exactly: 3 })),
})

module.exports = function createSimpleConfig (options = { }) {
  const projectPath = `${__dirname}/../../..`
  try {
    const {
      featuresPath = `${projectPath}/features`,
      publicPath = `${projectPath}/ui/public`,
      webpackConfigPath = `${projectPath}/ui/webpack.config.js`,
      isAuthorized,
    } = validateOptions(options)
    return {
      featuresPath,
      publicPath,
      webpackConfigPath,
      rpc: {
        isAuthorized,
        authorizationCacheDuration: humanInterval(process.env.BUHOI_AUTH_CACHE_DURATION || '1 minute'),

        resolveProcedure: createResolveProcedure(featuresPath),
        resolutionCacheDuration: humanInterval('1 year'),

        getContext: () => null,
        contextCacheDuration: humanInterval('1 year'),

        argsMaxSize: process.env.BUHOI_ARGS_MAX_SIZE || '10mb',

        resultCacheSize: process.env.BUHOI_RESULT_CACHE_SIZE || 10000,
      },
    }
  } catch (e) {
    if (e instanceof v.ValidationError) {
      const invalidOptions = Object.keys(e.toJSON())
      throw new Error(`Option ${invalidOptions[0]} has invalid value.`)
    }
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
