module.exports = { handler }

function handler () {
  throw new Error('sync error from task')
}
