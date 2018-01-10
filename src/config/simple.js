const glob = require('glob')
const humanInterval = require('human-interval')
const korrekt = require('korrekt')

const validateOptions = korrekt.create({
  featuresPath: korrekt.required(korrekt.string({ min: 1 })),
  publicPath: korrekt.required(korrekt.string({ min: 1 })),
  webpackConfigPath: korrekt.required(korrekt.string({ min: 1 })),
  isAuthorized: korrekt.required(korrekt.function({ exactly: 3 })),
})

module.exports = function createSimpleConfig (options = { }) {
  try {
    const {
      featuresPath,
      publicPath,
      webpackConfigPath,
      isAuthorized,
    } = validateOptions(options)
    return {
      featuresPath,
      publicPath,
      webpackConfigPath,
      rpc: {
        resolveProcedure: createResolveProcedure(featuresPath),
        resolutionCacheDuration: humanInterval('1 year'),

        isAuthorized,
        authorizationCacheDuration: 5000,

        getContext: () => null,
        contextCacheDuration: 5000,
      },
    }
  } catch (e) {
    if (e instanceof korrekt.ValidationError) {
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
