const buhoi = require('../../../../src')

module.exports = {
  login,
  logout,
}

function login () {
  // @public
  return buhoi.session('dodo')
}

function logout () {
  // @public
  return buhoi.session(null)
}
