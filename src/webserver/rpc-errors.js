class UnauthorizedError extends Error {
  constructor () {
    super()
  }
}

class NotFoundError extends Error {
  constructor () {
    super()
  }
}

module.exports = { NotAuthorizedError, NotFoundError }
