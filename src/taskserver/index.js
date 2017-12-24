const { scheduleJob } = require('node-schedule')
const { mq } = require('../infra')

function startTasks () {
  if (['0', 'false'].includes(process.env.TASKS)) {
    return
  }

  const name = path => path
    .replace('/tasks', '')
    .replace('/', ':')
    .replace(/.js$/, '')

  const rootPath = `${__dirname}/../../../../features`
  const tasks = glob.sync('**/tasks/*.js', { cwd: rootPath })
  const modules = tasks.map(path => require(`${rootPath}/${path}`))

  tasks.forEach((path, index) => mq.consumeJob(name(path), modules[index].handler))

  mq.consumeJob('schedule', () => new Promise((resolve, reject) =>
    modules.forEach((m, index) => scheduleJob(
      m.schedule,
      () => mq.publishJob(name(tasks[index]))
    ))
  ))
}
