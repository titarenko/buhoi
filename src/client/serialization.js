/* eslint-env browser */

export function serialize (what) {
  return encodeURIComponent(JSON.stringify(what))
}

export function deserialize (what) {
  return what && JSON.parse(decodeURIComponent(what))
}
