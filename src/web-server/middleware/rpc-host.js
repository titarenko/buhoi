const { Router } = require('express')
const memoizee = require('memoizee')
const rawBody = require('raw-body')
const contentType = require('content-type')
const lruCache = require('lru-cache')

module.exports = function rpcHost (options) {
  const router = Router()
  const handler = createHandler(options)

  router.use('/rpc/:feature.:procedure', async function (req, res, next) {
    try {
      await handler(req, res)
    } catch (e) {
      next(e)
    }
  })

  return router
}

function createHandler ({
  isAuthorized,
  authorizationCacheDuration,

  resolveProcedure,
  resolutionCacheDuration,

  getContext,
  contextCacheDuration,

  argsSizeLimit,
  resultCacheSizeLimit,

  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
}) {
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
      max: resultCacheSizeLimit,
    }),
  }

  return async function handle (req, res) {
    const { session } = req
    const { feature, procedure } = req.params

    if (!await cache.isAuthorized(session, feature, procedure)) {
      throw new NotAuthorizedError(session, feature, procedure)
    }

    const instance = cache.resolveProcedure(feature, procedure)
    if (!instance || !instance.public) {
      throw new NotFoundError(feature, procedure)
    }

    const argsJson = await getArgsJson(req, argsSizeLimit)

    const cachedResultKey = instance.cache
      ? [session, feature, procedure, argsJson].join(';')
      : undefined

    if (cache.getResult.has(cachedResultKey)) {
      render(cache.getResult.get(cachedResultKey), res)
    } else {
      const args = getArgs(argsJson, ProtocolViolationError)
      const context = await cache.getContext(session)
      const result = await instance.body.call(context, ...args, req, res)
      if (instance.cache) {
        cache.getResult.set(cachedResultKey, result, instance.cache)
      }
      render(result, res)
    }
  }
}

function getArgsJson (req, argsSizeLimit) {
  return req.method === 'GET'
    ? req.query.args && decodeURIComponent(req.query.args)
    : rawBody(req, {
      length: req.headers['content-length'],
      limit: argsSizeLimit,
      encoding: contentType.parse(req).parameters.charset || 'utf-8',
    })
}

function getArgs (argsJson, ProtocolViolationError) {
  try {
    const args = JSON.parse(argsJson || '[]') || []
    if (!Array.isArray(args)) {
      throw new ProtocolViolationError(argsJson)
    }
    return args
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw new ProtocolViolationError(argsJson)
    } else {
      throw e
    }
  }
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
