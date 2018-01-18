/* eslint-env browser */

const listeners = []

export function get (key, defaultValue) {
  try {
    const value = JSON.parse(localStorage[key])
    return value === undefined ? defaultValue : value
  } catch (error) {
    return defaultValue
  }
}

export function set (key, value) {
  localStorage[key] = JSON.stringify(value)
  listeners.forEach(l => l(key, value))
}

export function remove (key) {
  delete localStorage[key]
  listeners.forEach(l => l(key, undefined))
}

export function on (name, handler) {
  if (name !== 'change') {
    return
  }
  listeners.push(handler)
}

export function off (name, handler) {
  if (name !== 'change') {
    return
  }
  listeners.splice(listeners.indexOf(handler), 1)
}
