/* eslint-env mocha */

const buhoi = require('../src')

before(() => buhoi.start(buhoi.config.simple({
  featuresPath: `${__dirname}/app/features`,
  publicPath: `${__dirname}/app/public`,
  webpackConfigPath: `${__dirname}/app/pages/webpack.config.js`,
  isAuthorized: (session, feature, procedure) =>
    feature !== 'secrets' || session && session.startsWith('dodo'),
})))

after(() => buhoi.stop())
