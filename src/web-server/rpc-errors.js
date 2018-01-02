const v = require('korrekt')

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

module.exports = {
  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
  ValidationError: v.ValidationError,
}
