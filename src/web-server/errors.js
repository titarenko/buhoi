const v = require('korrekt')

class NotAuthenticatedError extends Error {
  constructor () {
    super('Session is missing.')
  }
}

class NotAuthorizedError extends Error {
  constructor (session, feature, procedure) {
    super(`Session ${session} is not allowed to call ${feature}.${procedure}.`)
  }
}

class NotFoundError extends Error {
  constructor (feature, procedure) {
    super(`Procedure ${feature}.${procedure} is not found.`)
  }
}

class ProtocolViolationError extends Error {
  constructor (args) {
    super(`Args "${args}" have invalid format.`)
  }
}

class ProcedureTimeoutError extends Error {
  constructor (feature, procedure) {
    super(`Procedure ${procedure} of feature ${feature} took to much time to complete.`)
  }
}

module.exports = {
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
  ProcedureTimeoutError,
  ValidationError: v.ValidationError,
}
