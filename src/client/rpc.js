/* eslint-env browser */

import querystring from 'querystring'

class HttpError extends Error {
  constructor ({ statusCode }) {
    super(statusCode)
    this.code = statusCode
  }
}

export class ValidationError extends HttpError {
  constructor (response) {
    super(response)
    this.errors = response.body
  }
}

export class NotFoundError extends HttpError {
}

export class NotAuthenticatedError extends HttpError {
}

export class NotAuthorizedError extends HttpError {
}

export class RequestTimeoutError extends HttpError {
}

export class ServerError extends HttpError {
}

const errorInterceptors = []
let baseUrl = ''
export const bridge = new Proxy({ }, {
  get (target, feature) {
    return createProcedureProxy(
      feature.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    )
  },
})

function createProcedureProxy (feature) {
  return new Proxy({ }, {
    get (target, procedure) {
      return procedure.startsWith('get') || procedure.startsWith('lookup')
        ? (...args) => get(`${feature}.${procedure}`, ...args)
        : (...args) => post(`${feature}.${procedure}`, ...args)
    },
  })
}

export function changeBaseUrl (newBaseUrl) {
  baseUrl = newBaseUrl || ''
}

export function interceptError (fn) {
  if (typeof fn === 'function') {
    errorInterceptors.push(fn)
  } else {
    throw new Error('interceptor must be a function')
  }
}

export function getFullUrl (procedure, ...args) {
  const qs = { args: encodeURIComponent(JSON.stringify(args)) }
  return `${baseUrl}/rpc/${procedure}?${querystring.stringify(qs)}`
}

export function get (procedure, ...args) {
  return request({
    method: 'GET',
    url: `${baseUrl}/rpc/${procedure}`,
    qs: { args: encodeURIComponent(JSON.stringify(args)) },
  }).then(handleResponseStatusCode)
}

export function download (procedure, ...args) {
  return window.open(getFullUrl(procedure, ...args))
}

export function post (procedure, ...args) {
  return request({
    method: 'POST',
    url: `${baseUrl}/rpc/${procedure}`,
    [args.length === 1 && args[0] instanceof FormData ? 'form' : 'json']: args,
  }).then(handleResponseStatusCode)
}

export function form (obj) {
  const data = new FormData()
  for (let k of obj) {
    data.append(k, obj[k])
  }
  return data
}

function handleResponseStatusCode (response) {
  if (response.statusCode >= 400) {
    errorInterceptors.forEach(i => i(response))
  }
  switch (response.statusCode) {
    case 400:
      throw new ValidationError(response)
    case 404:
      throw new NotFoundError(response)
    case 401:
      throw new NotAuthenticatedError(response)
    case 403:
      throw new NotAuthorizedError(response)
    case 408:
      throw new RequestTimeoutError(response)
    case 500:
      throw new ServerError(response)
    default:
      return response.body
  }
}

function request ({ method = 'GET', url, headers = { }, qs, json, form }) {
  return new Promise(send)

  function send (resolve, reject) {
    if (!url) {
      reject(new Error("Imagine request without URL, can you? I can't."))
      return
    }

    const instance = new XMLHttpRequest()

    instance.withCredentials = true

    instance.onreadystatechange = () => {
      if (instance.readyState !== 4) {
        return
      }
      unsubscribe()
      if (instance.status === 0) {
        reject(new Error('No response received from server, probably network error.'))
      } else {
        resolve({
          request: {
            method,
            url,
            headers,
            qs,
            json,
            form,
          },
          statusCode: instance.status,
          body: getResponseBody(instance),
        })
      }
    }

    instance.open(method, qs ? `${url}?${querystring.stringify(qs)}` : url)
    instance.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    Object.entries(headers).map(pair => instance.setRequestHeader(...pair))

    if (json) {
      instance.setRequestHeader('content-type', 'application/json')
      instance.send(JSON.stringify(json))
    } else if (form) {
      instance.send(form)
    } else {
      instance.send()
    }

    function unsubscribe () {
      instance.onreadystatechange = null
    }
  }
}

function getResponseBody (instance) {
  if (instance.responseText == null) {
    return instance.responseText
  }
  const contentType = instance.getResponseHeader('content-type')
  return contentType && contentType.includes('json')
    ? JSON.parse(instance.responseText)
    : instance.responseText
}
