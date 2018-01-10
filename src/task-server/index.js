const glob = require('glob')
const { scheduleJob } = require('node-schedule')
const { mq } = require('../infra')

module.exports = { start, stop }

function start ({ featuresPath }) {
  if (!mq || process.env.BUHOI_DISABLE_TASKS) {
    return
  }

  const tasks = glob.sync('**/tasks/*.js', { cwd: featuresPath }).map(path => ({
    name: path
      .replace('/tasks', '')
      .replace('/', ':')
      .replace(/.js$/, ''),
    instance: require(`${featuresPath}/${path}`),
  }))

  tasks.forEach(({ name, instance: { handler } }) => mq.consumeJob(name, handler))

  mq.consumeJob('schedule', () => new Promise((resolve, reject) => {
    tasks.forEach(({ name, instance: { schedule } }) =>
      scheduleJob(schedule, () => mq.publishJob(name))
    )
  }))
}

function stop (instance) {
}
