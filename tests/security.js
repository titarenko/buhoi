const should_ = require('should')
const sinon = require('sinon')
const shouldSinon_ = require('should-sinon')
const security = require('../modules/security')

describe('security', function () {
  describe('NotAuthenticatedError', function () {
    it('should be subclass of Error', function () {
      (new security.NotAuthenticatedError() instanceof Error).should.be.true()
    })
    it('should have call stack', function () {
      const error = new security.NotAuthenticatedError()
      error.message.should.eql('not authenticated')
      error.stack.should.match(/Error: not authenticated\n {4}at /)
    })
  })
  describe('NotAuthorizedError', function () {
    it('should be subclass of Error', function () {
      (new security.NotAuthorizedError() instanceof Error).should.be.true()
    })
    it('should have call stack', function () {
      const error = new security.NotAuthorizedError()
      error.message.should.eql('not authorized')
      error.stack.should.match(/Error: not authorized\n {4}at /)
    })
  })
  describe('hashPassword/verifyPassword', function () {
    it('should work in sync', function () {
      const password = 'abba8gamma'
      const hash = security.hashPassword(password)
      security.verifyPassword(password, hash).should.be.true()
    })
  })
  describe('bypass', function () {
    it('should authorize unauthenticated user', function () {
      const action = sinon.spy()
      const filter = security.bypass(action)
      const context = { }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize user regardless of roles/permissions', function () {
      const action = sinon.spy()
      const filter = security.bypass(action)
      const context = { user: { } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
  })
  describe('allow', function () {
    it('should not authorize unauthenticated user', function () {
      const action = sinon.spy()
      const filter = security.allow(action)
      const context = { }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthenticatedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize roleless user when role is required', function () {
      const action = sinon.spy()
      const filter = security.allow(5, action)
      const context = { user: { roles: [] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize user with non-matching list of roles', function () {
      const action = sinon.spy()
      const filter = security.allow(5, action)
      const context = { user: { roles: [1, 2, 3] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should authorize user by role', function () {
      const action = sinon.spy()
      const filter = security.allow(2, action)
      const context = { user: { roles: [2] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize user by any role', function () {
      const action = sinon.spy()
      const filter = security.allow(4, action)
      const context = { user: { roles: [1, 2, 3, 4, 5] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize roleless user when role is not required', function () {
      const action = sinon.spy()
      const filter = security.allow(action)
      const context = { user: { roles: [] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize user when role is not required', function () {
      const action = sinon.spy()
      const filter = security.allow(action)
      const context = { user: { roles: [6, 7, 8] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should not authorize user with permissions but without roles', function () {
      const action = sinon.spy()
      const filter = security.allow(4, 5, action)
      const context = { user: { permissions: [4, 5], roles: [] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
  })
  describe('permit', function () {
    it('should not authorize unauthenticated user', function () {
      const action = sinon.spy()
      const filter = security.permit(action)
      const context = { }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthenticatedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize permissionless user when permission is required', function () {
      const action = sinon.spy()
      const filter = security.permit(5, action)
      const context = { user: { permissions: [] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize permissionless user when permissions are required', function () {
      const action = sinon.spy()
      const filter = security.permit(5, 8, action)
      const context = { user: { permissions: [] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize user with non-matching list of permissions', function () {
      const action = sinon.spy()
      const filter = security.permit(5, action)
      const context = { user: { permissions: [1, 2, 3] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should not authorize user with partially matching list of permissions', function () {
      const action = sinon.spy()
      const filter = security.permit(5, 7, action)
      const context = { user: { permissions: [1, 5, 3] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
    it('should authorize user by permission', function () {
      const action = sinon.spy()
      const filter = security.permit(2, action)
      const context = { user: { permissions: [2] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize user by all permissions', function () {
      const action = sinon.spy()
      const filter = security.permit(4, 5, action)
      const context = { user: { permissions: [1, 2, 3, 4, 5] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize permissionless user when permission is not required', function () {
      const action = sinon.spy()
      const filter = security.permit(action)
      const context = { user: { permissions: [] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should authorize user when permission is not required', function () {
      const action = sinon.spy()
      const filter = security.permit(action)
      const context = { user: { permissions: [6, 7, 8] } }
      return filter.call(context).then(() => {
        action.should.be.called()
      })
    })
    it('should not authorize user with roles but without permissions', function () {
      const action = sinon.spy()
      const filter = security.permit(4, 5, action)
      const context = { user: { permissions: [], roles: [4, 5] } }
      return filter.call(context).catch(error => {
        error.should.be.instanceOf(security.NotAuthorizedError)
        action.should.not.be.called()
      })
    })
  })
})
