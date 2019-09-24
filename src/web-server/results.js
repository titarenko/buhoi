const mime = require('mime')

module.exports = { session, file, stream }

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
      if (typeof content.pipe === 'function') {
        content.pipe(res)
      } else {
        res.send(content)
      }
    }
  }
}

function stream (stream, headers) {
  return function renderStream (res) {
    if (headers) {
      Object.keys(headers).forEach(k => res.set(k, headers[k]))
    }
    stream.pipe(res)
  }
}
