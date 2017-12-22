const korrekt = require('korrekt')
const session = require('./session')
const rpc = require('./rpc')
const log = require('totlog')(__filename)

module.exports = function errorHandler (error, req, res, next) {
  if (error instanceof korrekt.ValidationError) {
    res.status(400).json(error.results)
  } else if (error instanceof session.NotAuthenticatedError) {
    res.status(401).end()
  } else if (error instanceof session.NotAuthorizedError) {
    res.status(403).end()
  } else if (error instanceof rpc.NotFoundError) {
    res.status(404).end()
  } else {
    log.error(req.path, req.user, error)
    res.status(500).end()
  }
}
