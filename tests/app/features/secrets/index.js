const sinon = require('sinon')

const getSecretSpy = sinon.spy()

module.exports = {
  getSecretSpy,
  getSecret,
}

function getSecret (...args) {
  // @public
  getSecretSpy(...args)
  return Promise.resolve('secret! shh!')
}
