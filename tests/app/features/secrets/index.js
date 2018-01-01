const buhoi = require('../../../../src')
const sinon = require('sinon')

const getSecretSpy = sinon.spy()

module.exports = {
  getSecretSpy,
  getSecret,
  getSecretFile,
  getTime,
}

function getSecret (...args) {
  // @public
  getSecretSpy(...args)
  return Promise.resolve('secret! shh!')
}

function getSecretFile () {
  // @public
  return buhoi.file('secret.txt', 'secret! shhh!')
}

function getTime () {
  // @public
  // @cache 0.2 seconds
  return new Date()
}
