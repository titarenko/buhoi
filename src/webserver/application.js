const express = require('express')
const totlog = require('totlog')
const rpcHost = require('./rpc-host')

function createApp (options) {
  const app = express()
  const publicPath = resolve(`${__dirname}/../ui/public`)

  app.use(require('./middleware/access-log')({ category: __filename }))
  
  app.use(letsencrypt(options.letsencryptPath))
  app.use(require('./webpack'))
  app.use(require('./session'))
  app.use(bodyParser.json())
  app.use(require('./query-parser'))
  app.use(rpcHost(registry))
  app.use(express.static(publicPath))
  app.use((error, req, res, next) => {
    if (error instanceof validation.ValidationError) {
      res.status(400).json(error.fields)
    } else if (error instanceof errors.NotAuthenticatedError) {
      res.status(401).end()
    } else if (error instanceof errors.NotAuthorizedError) {
      log.warn(req.path, error)
      res.status(403).end()
    } else {
      log.error(req.path, error)
      res.status(500).end()
    }
  })

  return app
}
