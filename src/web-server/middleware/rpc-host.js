const assert = require('assert')
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

  argsMaxSize,
  resultCacheSize,

  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
  ProcedureTimeoutError,
} = { }) {
  assert.equal(typeof isAuthorized, 'function')
  assert(Number.isInteger(authorizationCacheDuration))

  assert.equal(typeof resolveProcedure, 'function')
  assert(Number.isInteger(resolutionCacheDuration) || resolutionCacheDuration === undefined)

  assert.equal(typeof getContext, 'function')
  assert(Number.isInteger(contextCacheDuration) || contextCacheDuration === undefined)

  assert.equal(typeof argsMaxSize, 'string') // '1mb'
  assert(Number.isInteger(resultCacheSize))

  assert(Error.isPrototypeOf(NotAuthorizedError))
  assert(Error.isPrototypeOf(NotFoundError))
  assert(Error.isPrototypeOf(ProtocolViolationError))
  assert(Error.isPrototypeOf(ProcedureTimeoutError))

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
      max: resultCacheSize,
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

    const argsJson = await getArgsJson(req, argsMaxSize)

    const cachedResultKey = instance.cache
      ? [session, feature, procedure, argsJson].join(';')
      : undefined

    if (cache.getResult.has(cachedResultKey)) {
      render(cache.getResult.get(cachedResultKey), res)
    } else {
      const args = getArgs(argsJson, ProtocolViolationError)
      const context = await cache.getContext(session)
      try {
        const result = await instance.body.call(context, ...args, req, res)
        if (instance.cache) {
          cache.getResult.set(cachedResultKey, result, instance.cache)
        }
        render(result, res)
      } catch (e) {
        if (e.message.includes('statement cancelled due to statement timeout')) {
          throw new ProcedureTimeoutError(feature, procedure)
        } else {
          throw e
        }
      }
    }
  }
}

function getArgsJson (req, argsMaxSize) {
  return req.method === 'GET'
    ? req.query.args && decodeURIComponent(req.query.args)
    : rawBody(req, {
      length: req.headers['content-length'],
      limit: argsMaxSize,
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
