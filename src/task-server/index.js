const assert = require('assert')
const { globSync } = require('glob')
const { scheduleJob } = require('node-schedule')

module.exports = { start, stop }

function start ({ featuresPath } = { }) {
  assert(typeof featuresPath, 'string')

  const { mq } = require('../infra')
  if (!mq || process.env.BUHOI_DISABLE_TASKS) {
    return
  }

  const MessageHandlerFailureError = require('../infra/mq').MessageHandlerFailureError

  const tasks = globSync('**/tasks/*.js', { cwd: featuresPath }).map(path => ({
    name: path
      .replace('/tasks', '')
      .replace('/', ':')
      .replace(/.js$/, ''),
    instance: require(`${featuresPath}/${path}`),
  }))

  tasks.forEach(({ name, instance: { event, handler, options, persistent } }) => {
    async function wrappedHandler (...args) {
      try {
        return await handler.apply(this, args)
      } catch (error) {
        throw new MessageHandlerFailureError({
          event,
          task: name,
          error,
        })
      }
    }
    if (event) {
      if (process.env.BUHOI_PERSISTENT_EVENTS || persistent) {
        mq.consumePersistentEvent(event, name, wrappedHandler, options)
      } else {
        mq.consumeEvent(event, wrappedHandler, options)
      }
    } else {
      mq.consumeJob(name, wrappedHandler, options)
    }
  })

  mq.consumeJob('schedule', () => new Promise((resolve, reject) => {
    tasks.forEach(({ name, instance: { schedule } }) =>
      schedule && scheduleJob(schedule, () => mq.publishJob(name)),
    )
  }))
}

function stop (instance) {
}
