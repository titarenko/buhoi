const mime = require('mime')

module.exports = { session, file }

function session (session, payload) {
  return function renderSession (res) {
    if (session == null) {
      res.clearSession()
    } else {
      res.setSession(session)
    }
    if (payload !== undefined) {
      res.json(payload)
    }
    res.end()
  }
}

function file (name, content) {
  return function renderFile (res) {
    if (content === undefined) {
      res.sendFile(name)
    } else {
      res.attachment(name)
      res.set('Content-Type', mime.getType(name))
      res.send(content)
    }
  }
}
