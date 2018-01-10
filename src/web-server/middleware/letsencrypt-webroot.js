const express = require('express')

module.exports = function letsencryptWebroot () {
  const { BUHOI_WEBROOT } = process.env
  const router = express.Router()
  if (BUHOI_WEBROOT) {
    router.use('/.well-known/acme-challenge', express.static(`${BUHOI_WEBROOT}/.well-known/acme-challenge`))
  }
  return router
}
