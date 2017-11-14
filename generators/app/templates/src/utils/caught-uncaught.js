const debug = require('debug')('electron-kit:caught')

process.on('uncaughtException', (reason, p) => { // eslint-disable-line fp/no-unused-expression
  return debug('Uncaught Exception at: ', p, reason)
})

process.on('unhandledRejection', (reason, p) => { // eslint-disable-line fp/no-unused-expression
  return debug('Unhandled Rejection at: Promise ', p, reason)
})
