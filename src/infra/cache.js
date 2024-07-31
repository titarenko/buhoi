const assert = require('assert')
// const redis = require('redis')
// const Promise = require('bluebird')

const { createClient } = require('redis')

// Promise.promisifyAll(redis.RedisClient.prototype)

module.exports = {
  initialize,
  terminate,
  set,
  get,
  createCachedFunction,
}

function initialize () {
  const { BUHOI_REDIS } = process.env

  if (BUHOI_REDIS) {
    module.exports.client = createClient(BUHOI_REDIS)
  }

  return module.exports
}

function terminate (instance) {
  if (instance && instance.client) {
    return instance.client.quit()
  }
}

function set (key, value, ttl) {
  const { client } = module.exports
  if (!client) {
    return
  }
  return client.setAsync(key, JSON.stringify(value), 'EX', Math.ceil(ttl / 1000))
}

async function get (key) {
  if (key === undefined) {
    return
  }

  const { client } = module.exports
  if (!client) {
    return
  }

  const value = await client.getAsync(key)

  if (value === null) {
    return
  }

  return JSON.parse(value)
}

function createCachedFunction (fn, ttl) {
  const { client } = module.exports
  if (!client) {
    return fn
  }

  assert(typeof fn.name, 'string')

  return async (...args) => {
    const key = `${fn.name}|${args.join('|')}`
    const value = await get(key)
    if (value !== undefined) {
      return value
    }
    const result = await fn(...args)
    await set(key, result, ttl)
    return result
  }
}
