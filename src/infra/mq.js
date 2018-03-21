const mqu = require('mqu')

module.exports = { initialize, terminate }

function initialize () {
  const { BUHOI_MQ } = process.env

  if (BUHOI_MQ) {
    return mqu(BUHOI_MQ)
  }
}

function terminate (mq) {
  if (mq) {
    return mq.close()
  }
}
