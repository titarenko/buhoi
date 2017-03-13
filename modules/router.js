const Promise = require('bluebird')
const express = require('express')
const fs = require('fs')
const path = require('path')

const validation = require('./validation')
const security = require('./security')

const log = require('./log')(__filename)

const rethrower = error => { throw error }

module.exports = function ({ basePath, errorHandler = rethrower }) {
	const entities = fs.readdirSync(basePath)
	const router = express.Router()

	const handler = spec => createHandler(basePath, entities, spec, errorHandler)

	router.get('/:entity.lookup', handler({
		action: req_ => 'lookup',
		params: req => req.query.q && JSON.parse(decodeURIComponent(req.query.q)),
		status: result => result ? 200 : 404,
	}))

	router.post('/:entity.restore', handler({
		action: req_ => 'restore',
		params: req => req.body.id,
		status: result => result ? 200 : 204,
	}))

	router.get('/:entity.:procedure', handler({
		action: req => snakeCaseToCamelCase(req.params.procedure),
		params: req => req.query,
		status: result => result ? 200 : 404,
	}))

	router.post('/:entity.:procedure', handler({
		action: req => snakeCaseToCamelCase(req.params.procedure),
		params: req => req.body,
		status: result => result ? 200 : 204,
	}))

	router.get('/:entity', handler({
		action: req_ => 'list',
		params: req => req.query.q && JSON.parse(decodeURIComponent(req.query.q)),
		status: result => result ? 200 : 404,
	}))

	router.get('/:entity/:id', handler({
		action: req_ => 'view',
		params: req => req.params.id,
		status: result => result ? 200 : 404,
	}))

	router.post('/:entity', handler({
		action: req => req.body.id ? 'update' : 'create',
		params: req => req.body,
		status: (result, req) => req.body.id
			? result ? 200 : 204
			: result ? 201 : 204,
	}))

	router.put('/:entity/:id', handler({
		action: req_ => 'update',
		params: req => Object.assign({ id: req.params.id }, req.body),
		status: result => result ? 200 : 204,
	}))

	router.delete('/:entity/:id', handler({
		action: req_ => 'remove',
		params: req => req.params.id,
		status: result_ => 204,
	}))

	router.delete('/:entity', handler({
		action: req_ => 'remove',
		params: req => req.body.id,
		status: result_ => 204,
	}))

	return router
}

function snakeCaseToCamelCase (name) {
	return name.replace(/(\-\w)/g, m => m[1].toUpperCase())
}

function createHandler (basePath, entities, spec, customErrorHandler) {
	return function (req, res) {
		let entity, action, params
		Promise
			.try(function () {
				entity = req.params.entity
				action = spec.action(req)
				params = spec.params(req)

				if (!entities.includes(entity)) {
					log.warn(`${req.ip} requested non-existing entity ${entity}`)
					res.status(404).end()
					return
				}

				const ctrl = safeRequire(path.join(basePath, entity, 'ctrl'))

				if (!ctrl || typeof ctrl[action] != 'function') {
					log.warn(`${req.ip} asked for ${entity}.${action}, but it is not implemented`)
					res.status(501).end()
					return
				}
				return ctrl[action].call({ user: req.user }, params, req, res)
			})
			.then(result => {
				if (res.headersSent) {
					return
				}
				const status = spec.status(result, req)
				if (result) {
					res.status(status).json(result)
				} else {
					res.status(status).end()
				}
			})
			.catch(validation.ValidationError, error => res.status(400).json(error.fields))
			.catch(security.NotAuthenticatedError, error_ => res.status(401).end())
			.catch(security.NotAuthorizedError, error_ => res.status(403).end())
			.catch(customErrorHandler)
			.catch(error => {
				log.error(`${req.ip} called ${entity}.${action} and it failed due to ${error.stack}`)
				res.status(500).end()
			})
	}
}

function safeRequire (path) {
	try {
		return require(path)
	} catch (e) {
		if (e.message.startsWith(`Cannot find module '${path}'`)) {
			return null
		} else {
			throw e
		}
	}
}