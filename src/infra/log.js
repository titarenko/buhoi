const totlog = require('totlog')

module.exports = { init }

function init () {
  const { BUHOI_SLACK, BUHOI_LOGSTASH } = process.env
  if (BUHOI_SLACK) {
    const [token, channel, icon] = BUHOI_SLACK.split(';')
    const slack = totlog.appenders.slack({ token, channel, icon })
    totlog.on('message', m => {
      if (m.level === 'error') {
        slack(m)
      }
    })
  }
  if (BUHOI_LOGSTASH) {
    const logstash = totlog.appenders.logstash({ url: BUHOI_LOGSTASH })
    totlog.on('message', logstash)
  }
}
