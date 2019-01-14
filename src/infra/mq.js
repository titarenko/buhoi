const mqu = require('mqu')
const totlog = require('totlog')

class MessageHandlerFailureError extends Error {
  constructor ({ event, task, error }) {
    super('task server message handler failure')
    this.event = event
    this.task = task
    this.initialError = error
  }
}

module.exports = { initialize, terminate, MessageHandlerFailureError }

function initialize () {
  const { BUHOI_MQ } = process.env

  if (BUHOI_MQ) {
    const instance = mqu(BUHOI_MQ)
    const log = totlog(__filename)
    instance.on('error', error => {
      if (error instanceof MessageHandlerFailureError) {
        if (error.event) {
          log.error('failed to handle event %s due to', error.event, error.initialError)
        } else {
          log.error('failed to execute task %s due to', error.task, error.initialError)
        }
      } else {
        throw error
      }
    })
  }
}

function terminate (mq) {
  if (mq) {
    return mq.close()
  }
}
