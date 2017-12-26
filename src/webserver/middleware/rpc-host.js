const { Router } = require('express')
const memoizee = require('memoizee')
const lruCache = require('lru-cache')
const contentType = require('content-type')
const rawBody = require('raw-body')

module.exports = function rpcHost ({
  isAuthorized,
  authorizationCacheDuration,

  resolveProcedure,
  resolutionCacheDuration,

  getContext,
  contextCacheDuration,

  maxArgsSize,
  maxResultCacheSize,

  NotAuthorizedError,
  NotFoundError,
}) {
  const router = Router()
  const cache = {
    isAuthorized: memoizee(isAuthorized, {
      primitive: true,
      maxAge: authorizationCacheDuration,
    }),
    resolveProcedure: memoizee(resolveProcedure, {
      primitive: true,
      maxAge: resolutionCacheDuration,
    }),
    getContext: memoizee(getContext, {
      primitive: true,
      maxAge: contextCacheDuration,
    }),
    getResult: lruCache({
      max: maxResultCacheSize,
    }),
  }

  router.use('/rpc/:feature.:procedure', async function (req, res) {
    const { session, method } = req
    const { feature, procedure } = req.params

    if (!await cache.isAuthorized(session, feature, procedure)) {
      throw new NotAuthorizedError(session, feature, procedure)
    }

    const instance = cache.resolveProcedure(feature, procedure)
    if (!instance || !instance.public) {
      throw new NotFoundError(feature, procedure)
    }

    const argsJson = method === 'GET'
      ? decodeURIComponent(req.query.args)
      : await rawBody(req, {
        length: req.headers['content-length'],
        limit: maxArgsSize,
        encoding: contentType.parse(req).parameters.charset,
      })

    const cachedResultKey = instance.cache
      ? [feature, procedure, session, argsJson].join(';')
      : undefined

    if (cache.getResult.has(cachedResultKey)) {
      render(cache.getResult.get(cachedResultKey), res)
    } else {
      const args = JSON.parse(argsJson)
      const result = await instance.body.call(await cache.getContext(session), ...args, req, res)
      if (instance.cache) {
        cache.getResult.set(cachedResultKey, result, instance.cache)
      }

      render(result, res)
    }
  })

  return router
}

function render (result, res) {
  if (typeof result === 'function') {
    result(res)
  } else {
    if (result !== undefined) {
      res.json(result)
    } else {
      res.end()
    }
  }
}
