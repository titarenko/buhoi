const assert = require('assert')
const { Router } = require('express')
const rawBody = require('raw-body')
const contentType = require('content-type')

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
  getContext,
  maxInputSize,

  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
  ProcedureTimeoutError,
} = { }) {
  const { cache } = require('../../infra')

  assert.equal(typeof isAuthorized, 'function')
  assert(Number.isInteger(authorizationCacheDuration))

  assert.equal(typeof resolveProcedure, 'function')
  assert.equal(typeof getContext, 'function')
  assert.equal(typeof maxInputSize, 'string') // for example, '1mb'

  assert(Error.isPrototypeOf(NotAuthenticatedError))
  assert(Error.isPrototypeOf(NotAuthorizedError))
  assert(Error.isPrototypeOf(NotFoundError))
  assert(Error.isPrototypeOf(ProtocolViolationError))
  assert(Error.isPrototypeOf(ProcedureTimeoutError))

  const cachedIsAuthorized = cache.createCachedFunction(isAuthorized, authorizationCacheDuration)
  const cachedGetContext = cache.createCachedFunction(getContext, authorizationCacheDuration)

  return async function handle (req, res) {
    const { session } = req
    const { feature, procedure } = req.params

    const isAuthorizedResult = await cachedIsAuthorized(session, feature, procedure)

    if (!isAuthorizedResult) {
      if (!session || isAuthorizedResult == null) {
        throw new NotAuthenticatedError()
      }
      if (!isAuthorizedResult) {
        throw new NotAuthorizedError(session, feature, procedure)
      }
    }

    const instance = resolveProcedure(feature, procedure)
    if (!instance || !instance.public) {
      throw new NotFoundError(feature, procedure)
    }

    const argsJson = await getArgsJson(req, maxInputSize)

    const cachedResultKey = instance.cache
      ? [session, feature, procedure, argsJson].join(';')
      : undefined

    const cachedResultValue = await cache.get(cachedResultKey)
    if (cachedResultValue !== undefined) {
      render(cachedResultValue, res)
    } else {
      const args = getArgs(argsJson, ProtocolViolationError)
      const context = await cachedGetContext(session)
      try {
        const result = await instance.body.call(context, ...args, req, res)
        if (instance.cache) {
          cache.set(cachedResultKey, result, instance.cache)
        }
        render(result, res)
      } catch (e) {
        if (e.message.includes('canceling statement due to statement timeout')) {
          throw new ProcedureTimeoutError(feature, procedure)
        } else {
          throw e
        }
      }
    }
  }
}

function getArgsJson (req, maxInputSize) {
  return req.method === 'GET'
    ? req.query.args && decodeURIComponent(req.query.args)
    : rawBody(req, {
      length: req.headers['content-length'],
      limit: maxInputSize,
      encoding: getEncoding(req),
    })
}

function getEncoding (req, defaultEncoding = 'utf-8') {
  try {
    return contentType.parse(req).parameters.charset || defaultEncoding
  } catch (e) {
    return defaultEncoding
  }
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
