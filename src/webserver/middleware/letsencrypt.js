const express = require('express')

module.exports = function createRouter (acmeChallengePath) {
  const router = module.exports = express.Router()
  router.use('/.well-known/acme-challenge', express.static(acmeChallengePath))
  return router
}
