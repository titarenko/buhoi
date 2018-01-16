const redis = require('redis')
const Promise = require('bluebird')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

module.exports = { initialize, terminate }

function initialize () {
  const { BUHOI_REDIS } = process.env

  if (BUHOI_REDIS) {
    return redis.createClient(BUHOI_REDIS)
  }
}

function terminate (client) {
  if (client) {
    return client.quit()
  }
}
