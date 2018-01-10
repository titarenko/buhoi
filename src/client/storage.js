/* eslint-env browser */

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
}

export function remove (key) {
  delete localStorage[key]
}
