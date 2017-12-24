module.exports = function rpcHost ({
  isAuthorized,
  resolveProcedure,
  getContext,
  NotAuthorizedError,
  NotFoundError
}) {
  const router = Router()
  router.use('/rpc/:module.:procedure', async function (req, res) {
    if (!await isAuthorized(req.session, req.params)) {
      throw new NotAuthorizedError(req.session, req.params)
    }

    const procedure = resolveProcedure(req.params)
    if (!procedure) {
      throw new NotFoundError(req.params)
    }

    const args = req.method === 'GET'
      ? JSON.parse(decodeURIComponent(req.query.args))
      : req.body

    const result = await procedure.call(await getContext(req), ...args, req, res)
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
