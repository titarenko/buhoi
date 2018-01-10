const express = require('express')

const prefix = '/.well-known/acme-challenge'

module.exports = function letsencryptWebroot () {
  const { BUHOI_WEBROOT } = process.env
  const router = express.Router()
  if (BUHOI_WEBROOT) {
    router.use(prefix, express.static(`${BUHOI_WEBROOT}${prefix}`))
  }
  return router
}
