const axios = require('axios')
const https = require('https')

module.exports = function (params) {
  return axios({
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 1000,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    validateStatus: status => status < 500,
    ...params,
  })
}
