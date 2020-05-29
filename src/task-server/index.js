const assert = require('assert')
const glob = require('glob')
const { scheduleJob } = require('node-schedule')

module.exports = { start, stop }

function start ({ featuresPath } = { }) {
  assert(typeof featuresPath, 'string')

  const { mq } = require('../infra')
  if (!mq || process.env.BUHOI_DISABLE_TASKS) {
    return
  }

  const MessageHandlerFailureError = require('../infra/mq').MessageHandlerFailureError

  const tasks = glob.sync('**/tasks/*.js', { cwd: featuresPath }).map(path => ({
    name: path
      .replace('/tasks', '')
      .replace('/', ':')
      .replace(/.js$/, ''),
    instance: require(`${featuresPath}/${path}`),
  }))

  tasks.forEach(({ name, instance: { event, handler } }) => {
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
      if (process.env.BUHOI_PERSISTENT_EVENTS) {
        mq.consumePersistentEvent(event, name, wrappedHandler)
      } else {
        mq.consumeEvent(event, wrappedHandler)
      }
    } else {
      mq.consumeJob(name, wrappedHandler)
    }
  })

  mq.consumeJob('schedule', () => new Promise((resolve, reject) => {
    tasks.forEach(({ name, instance: { schedule } }) =>
      schedule && scheduleJob(schedule, () => mq.publishJob(name))
    )
  }))
}

function stop (instance) {
}
