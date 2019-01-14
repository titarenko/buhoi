const Promise = require('bluebird')

module.exports = { handler }

async function handler () {
  await Promise.delay(50)
  throw new Error('async error from task')
}
