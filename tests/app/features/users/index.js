const buhoi = require('../../../../src')
const sinon = require('sinon')

const uploadAvatarSpy = sinon.spy()

module.exports = {
  login,
  logout,
  uploadAvatar,
  uploadAvatarSpy,
}

function login () {
  // @public
  return buhoi.session('dodo')
}

function logout () {
  // @public
  return buhoi.session(null)
}

function uploadAvatar ({ avatar }) {
  // @public
  uploadAvatarSpy.apply(this, arguments)
}
