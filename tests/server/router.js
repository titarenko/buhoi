const router = require('../../server/router')
const sinon = require('sinon')
const fs = require('fs')
const mockRequire = require('mock-require')
const supertest = require('supertest')
const should_ = require('should')
const shouldSinon_ = require('should-sinon')
const express = require('express')
const bodyParser = require('body-parser')
const korrekt = require('korrekt')
const security = require('../../server/security')

describe('router', function () {
	const projects = {
		create: sinon.spy(),
		update: sinon.spy(),
		remove: sinon.spy(),
		restore: sinon.spy(),
		list: sinon.spy(() => [{ id: 1, name: '1' }]),
		view: sinon.spy(() => ({ id: 2, name: '2' })),
		lookup: sinon.spy(() => [{ id: 3, name: '3' }]),
		mymethod1: sinon.spy(() => true),
		mymethod2: sinon.spy(),
		camelCasedMethod: sinon.spy(),
		validationFailure: sinon.spy(() => { throw new korrekt.ValidationError({ name: 'required' }) }),
		authenticationFailure: sinon.spy(() => { throw new security.NotAuthenticatedError() }),
		authorizationFailure: sinon.spy(() => { throw new security.NotAuthorizedError() }),
		completeFailure: sinon.spy(() => { throw new Error('failure') }),
	}
	const issues = {
		list: sinon.spy(),
		view: sinon.spy(),
		create: sinon.spy(() => ({ id: 105 })),
		update: sinon.spy(() => ({ id: 101 })),
		lookup: sinon.spy(),
		restore: sinon.spy(() => ({ id: 10 })),
		proc: sinon.spy(),
		write: sinon.spy(() => ({ id: 100 })),
	}
	const hacked = {
		list: sinon.spy(() => []),
		view: sinon.spy(() => ({ })),
	}
	let request
	beforeEach(function () {
		sinon.stub(fs, 'readdirSync', () => ['projects', 'issues'])
		mockRequire('entities/projects/ctrl', projects)
		mockRequire('entities/issues/ctrl', issues)
		mockRequire('entities/hacked/ctrl', hacked)
		const app = express()
		app.use(bodyParser.json())
		app.use(router({ basePath: './entities' }))
		request = supertest(app)
	})
	afterEach(function () {
		mockRequire.stopAll()
		fs.readdirSync.restore()
	})
	it('should route GET request without id in path to "list" method', function () {
		const query = {
			filtering: { 'name ilike': '%bob%', 'age >': 25 },
			grouping: { field: 'name' },
			sorting: { field: 'name', direction: 'desc' },
			paging: { size: 10, offset: 100 },
		}
		return request
			.get('/projects')
			.query({ q: encodeURIComponent(JSON.stringify(query)) })
			.expect(200)
			.then(() => projects.list.should.be.calledWith(query))
	})
	it('should return "not found" if "list" returned no results', function () {
		return request
			.get('/issues')
			.expect(404)
	})
	it('should route GET request with id in path to "view" method', function () {
		return request
			.get('/projects/1')
			.expect(200)
			.then(() => projects.view.should.be.calledWith('1'))
	})
	it('should return "not found" if "view" returned no object', function () {
		return request
			.get('/issues/1')
			.expect(404)
	})
	it('should route POST request to "create" method', function () {
		const attrs = { name: '1' }
		return request
			.post('/projects')
			.send(attrs)
			.expect(204)
			.then(() => projects.create.should.be.calledWith(attrs))
	})
	it('should return 201 (created) if "create" returned non-empty result', function () {
		return request
			.post('/issues')
			.expect(201, { id: 105 })
	})
	it('should route POST request with id in body to "update" method', function () {
		const attrs = { id: 1, name: '1' }
		return request
			.post('/projects')
			.send(attrs)
			.expect(204)
			.then(() => projects.update.should.be.calledWith(attrs))
	})
	it('should return 200 if "update" (via POST) returned non-empty result', function () {
		return request
			.post('/issues')
			.send({ id: 101, name: 'too bad' })
			.expect(200, { id: 101 })
	})
	it('should route PUT request with id in path to "update" method', function () {
		const attrs = { id: 1, name: '1' }
		return request
			.put('/projects/1')
			.send({ name: attrs.name })
			.expect(204)
			.then(() => projects.update.should.be.calledWith(attrs))
	})
	it('should return 200 if PUT request has non-empty response', function () {
		return request
			.put('/issues/101')
			.expect(200, { id: 101 })
	})
	it('should route DELETE request with id in path to "remove" method', function () {
		return request
			.delete('/projects/100200')
			.expect(204)
			.then(() => projects.remove.should.be.calledWith('100200'))
	})
	it('should route DELETE request with id in body to "remove" method', function () {
		return request
			.delete('/projects')
			.send({ id: 100500 })
			.expect(204)
			.then(() => projects.remove.should.be.calledWith(100500))
	})
	it('should route POST "restore" request to "restore" method', function () {
		return request
			.post('/projects.restore')
			.send({ id: 10 })
			.expect(204)
			.then(() => projects.restore.should.be.calledWith(10))
	})
	it('should return 200 if "restore" returned non-empty answer', function () {
		return request
			.post('/issues.restore')
			.send({ id: 10 })
			.expect(200, { id: 10 })
	})
	it('should route GET "lookup" request to "lookup" method', function () {
		return request
			.get('/projects.lookup')
			.query({ q: encodeURIComponent(JSON.stringify({ 'id in': [1, 2, 3] })) })
			.expect(200)
			.then(response => {
				response.body.should.eql([{ id: 3, name: '3' }])
				projects.lookup.should.be.calledWith({ 'id in': [1, 2, 3] })
			})
	})
	it('should return "not found" if "lookup" returned nothing', function () {
		return request
			.get('/issues.lookup')
			.expect(404)
	})
	it('should route GET RPC request to appropriate method', function () {
		return request
			.get('/projects.mymethod1')
			.expect(200)
			.then(() => projects.mymethod1.should.be.called())
	})
	it('should return 404 if RPC read request returned empty result', function () {
		return request
			.get('/issues.proc')
			.expect(404)
	})
	it('should route POST RPC request to appropriate method', function () {
		return request
			.post('/projects.mymethod2')
			.expect(204)
			.then(() => projects.mymethod2.should.be.called())
	})
	it('should return 200 if RPC write request returned non-empty result', function () {
		return request
			.post('/issues.write')
			.expect(200, { id: 100 })
	})
	it('should convert snake cased names to camel cased while serving RPC', function () {
		return request
			.post('/projects.camel-cased-method')
			.then(() => projects.camelCasedMethod.should.be.called())
	})
	it('should handle unexpected errors', function () {
		return request
			.get('/projects.complete-failure')
			.expect(500)
			.then(response => response.body.should.be.empty())
	})
	it('should handle validation errors', function () {
		return request
			.get('/projects.validation-failure')
			.expect(400)
			.then(response => response.body.should.eql({ name: 'required' }))
	})
	it('should handle authentication errors', function () {
		return request
			.get('/projects.authentication-failure')
			.expect(401)
	})
	it('should handle authorization errors', function () {
		return request
			.get('/projects.authorization-failure')
			.expect(403)
	})
	it('should return "not found" for non-existing entities', function () {
		return request
			.get('/users')
			.expect(404)
	})
	it('should not allow navigate through file system using ./../..', function () {
		return request
			.get('/./../../etc')
			.expect(404)
	})
	it('should not allow navigate through file system using knowledge about project folder structure', function () {
		return request
			.get('/hacked')
			.expect(404)
	})
	it('should tell that method is not implemented if action is not a function', function () {
		return request
			.get('/projects.boo')
			.expect(501)
	})
})