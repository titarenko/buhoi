const cookie = require('cookie')

module.exports = function session ({ cookieName = 'doge' }) {
  return function sessionAction (req, res, next) {
    req.session = cookie.parse(req.headers.cookie)[cookieName]
    res.setSession = session => res.cookie(cookieName, session, {
      httpOnly: true,
      expires: 0,
      secure: true,
    })
    res.clearSession = () => res.clearCookie(cookieName) 
  }
}
