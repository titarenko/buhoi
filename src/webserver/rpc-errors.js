const v = require('korrekt')

class NotAuthorizedError extends Error {
}

class NotFoundError extends Error {
}

module.exports = {
  NotAuthorizedError,
  NotFoundError,
  ValidationError: v.ValidationError,
}
