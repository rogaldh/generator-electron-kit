
const debug = require('debug')('electron-kit:index')

const app = require('./app')
const shouldConnect = require('./connect')

require('./utils/caught-uncaught') // eslint-disable-line

shouldConnect(app) // eslint-disable-line
  .then((connect) => connect(app))
  .catch(debug)
