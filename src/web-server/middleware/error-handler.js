const log = require('totlog')(__filename)
const assert = require('assert')

module.exports = function errorHandler ({
  ValidationError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
  ProcedureTimeoutError,
} = { }) {
  assert(Error.isPrototypeOf(ValidationError))
  assert(Error.isPrototypeOf(NotAuthenticatedError))
  assert(Error.isPrototypeOf(NotAuthorizedError))
  assert(Error.isPrototypeOf(NotFoundError))
  assert(Error.isPrototypeOf(ProcedureTimeoutError))

  return function errorHandlerMiddleware (error, req, res, next) {
    switch (true) {
      case error instanceof ValidationError: return res.status(400).json(error)
      case error instanceof NotAuthenticatedError: return res.status(401).end()
      case error instanceof NotAuthorizedError: return res.status(403).end()
      case error instanceof NotFoundError: return res.status(404).end()
      case error instanceof ProcedureTimeoutError: return res.status(408).end()
      default: {
        log.error('%s %s (session %s) failed due to', req.method, req.path, req.session, error)
        return res.status(500).end()
      }
    }
  }
}
