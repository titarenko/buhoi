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

export function get (procedure, ...args) {
  return request({
    method: 'GET',
    url: `/rpc/${procedure}`,
    qs: { args },
  }).then(handleResponseStatusCode)
}

export function post (procedure, ...args) {
  return request({
    method: 'POST',
    url: `/rpc/${procedure}`,
    json: args,
  }).then(handleResponseStatusCode)
}

function handleResponseStatusCode (response) {
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
      return response
  }
}

function request ({ method = 'GET', url, headers = { }, qs, json }) {
  return new Promise(send)

  function send (resolve, reject) {
    if (!url) {
      reject(new Error("Imagine request without URL, can you? I can't."))
      return
    }

    const instance = new XMLHttpRequest()

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
