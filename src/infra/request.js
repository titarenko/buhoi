const request = require('request')
const { format } = require('util')

class UnexpectedResponseError extends Error {
  constructor (response) {
    super(format('Unexpected response %d %j', response.statusCode, response.body))
    this.response = response
  }
}

module.exports = requestWithTimeout
module.exports.UnexpectedResponseError = UnexpectedResponseError

function requestWithTimeout (...args) {
  const props = args[0]
  const timeoutValue = props && props.timeout
  return new Promise((resolve, reject) => {
    const timer = timeoutValue
      ? setTimeout(() => reject(new Error('soft timeout')), timeoutValue)
      : null
    request(...args, (error, response) => {
      if (timer) {
        clearTimeout(timer)
      }
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
