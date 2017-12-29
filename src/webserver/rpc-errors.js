const v = require('korrekt')

class NotAuthorizedError extends Error {
}

class NotFoundError extends Error {
}

class ProtocolViolationError extends Error {
}

module.exports = {
  NotAuthorizedError,
  NotFoundError,
  ProtocolViolationError,
  ValidationError: v.ValidationError,
}
