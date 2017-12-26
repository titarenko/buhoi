// const glob = require('glob')
//
// function getAreas (publicPath) {
//   const areas = glob.sync('**/index.js', { cwd: `${__dirname}/../areas` })
//   const router = express.Router()
//   areas.forEach(path => {
//     const area = path.replace('/index.js', '')
//     const instance = require(`areas/${area}`)
//     router.use(`/${area}`, historyFallback(publicPath), instance)
//   })
//   return router
// }

// public
// cache
