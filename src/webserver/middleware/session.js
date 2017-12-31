const cookie = require('cookie')
const memoizee = require('memoizee')
const express = require('express')

module.exports = function session ({ cookieName = 'doge' } = { }) {
  express.response.setSession = function setSession (session) {
    this.cookie(cookieName, session, {
      httpOnly: true,
      expires: 0,
      secure: true,
    })
  }

  express.response.clearSession = function clearSession () {
    this.clearCookie(cookieName)
  }

  const getSessionFromCookie = memoizee(
    cookieHeaderValue => cookieHeaderValue && cookie.parse(cookieHeaderValue)[cookieName],
    { primitive: true }
  )

  return function sessionMiddleware (req, res, next) {
    req.session = getSessionFromCookie(req.headers.cookie)
    next()
  }
}
