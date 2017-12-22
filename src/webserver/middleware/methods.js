const mime = require('mime')
const cookie = require('cookie')
const path = require('path')

module.exports = createMiddleware

function createRouter (rootPath) {
  const registry = createRegistry(rootPath)
  const router = Router()
  router.use('/web-methods/:name', async function (req, res, next) {
    req.session = cookie.parse(req.headers.cookie).doge
    const procedure = registry[req.params.name]
    if (procedure) {
      procedure(req, res)
    } else {
      next()
    }
  })
  return router
}

function createRegistry (rootPath) {
  return glob.sync('**/*.js', { cwd: rootPath })
    .map(it => ({
      name: it.replace(/\.js$/, ''),
      instance: require(path.join(rootPath, it)),
    }))
    .filter(it => !isProcedureDefinition(it.instance))
    .reduce(
      (registry, it) => ({ ...registry, [it.name]: createProcedure(it.instance) }),
      { }
    )
}

function isProcedureDefinition (def) {
  return (def.permissions === undefined || Array.isArray(def.permissions))
    && (def.validator == null || typeof def.validator === 'function')
    && typeof def.body === 'function'
}

function createProcedure (def) {
  return async function procedureRouteHandler (req, res) {
    if (!isAuthorized(def, req)) {
      return res.status(req.user ? 404 : 401).end()
    }
    try {
      if (def.validator) {
        await def.validator(req.method req.body.args)
      }
      render(def.type, await def.body(req), res)
    } catch (e) {
      if (e instanceof korrekt.ValidationError) {
        return res.status(400).json(e.results)
      }
      throw e
    }
  }
}

function getName (req) {
  
}

function getArgs (req) {
  return req.method === 'GET'
    ? JSON.parse(decodeURIComponent(req.query.args))
    : req.body
}

function isAuthorized (def, req) {
  return def.permissions === null
    || req.user && def.permissions.every(p => req.user.permissions[p])
}

function render (type, result, res) {
  switch (type) {
    case 'session': return renderSession(result, res)
    case 'file': return renderFile(result, res)
    default: return renderJson(result, res)
  }
}

function renderSession (result, res) {
  if (result == null) {
    res.clearCookie('doge')
  } else {
    res.cookie('doge', result, {
      httpOnly: true,
      expires: 0,
      secure: true,
    })
  }
}

function renderFile (result, res) {
  res.attachment(result.name)
  res.set('Content-Type', mime.getType(result.name))
  res.send(result.content)
}

function renderJson (result, res) {
  if (result === undefined) {
    res.end()
  } else {
    res.json(result)
  }
}
