/* eslint-env mocha */

const Promise = require('bluebird')
const { mq } = require('../src')

describe('buhoi task error handling', function () {
  it('should handle sync errors', async function () {
    let unhandled = false
    function setUnhandled () {
      unhandled = true
    }
    process.on('unhandledRejection', setUnhandled)
    await mq.publishJob('todos:throw-error-sync')
    process.removeListener('unhandledRejection', setUnhandled)
    unhandled.should.be.false()
  })

  it('should handle async errors', async function () {
    let unhandled = false
    function setUnhandled () {
      unhandled = true
    }
    process.on('unhandledRejection', setUnhandled)
    await mq.publishJob('todos:throw-error-async')
    await Promise.delay(500)
    process.removeListener('unhandledRejection', setUnhandled)
    unhandled.should.be.false()
  })
})
