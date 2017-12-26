const { Router } = require('express')
const memoizee = require('memoizee')

module.exports = function rpcHost ({
  isAuthorized,
  authorizationCacheDuration,

  resolveProcedure,
  resolutionCacheDuration,

  getContext,
  contextCacheDuration,

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
  }

  router.use('/rpc/:feature.:procedure', async function (req, res) {
    const { feature, procedure } = req.params

    if (!await cache.isAuthorized(req.session, feature, procedure)) {
      throw new NotAuthorizedError(req.session, feature, procedure)
    }

    const instance = cache.resolveProcedure(feature, procedure)
    if (!instance) {
      throw new NotFoundError(feature, procedure)
    }

    const args = req.method === 'GET'
      ? JSON.parse(decodeURIComponent(req.query.args))
      : req.body

    const result = await procedure.call(await cache.getContext(req.session), ...args, req, res)
    if (typeof result === 'function') {
      await result(res)
    } else {
      if (result !== undefined) {
        res.json(result)
      } else {
        res.end()
      }
    }
  })

  return router
}
