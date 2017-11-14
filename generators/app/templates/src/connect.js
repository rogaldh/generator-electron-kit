const debug = require('debug')('electron-kit:connect')
// TODO: use package name as NS for debug

const launch = function launchServer(app) { // eslint-disable-line better/explicit-return
  const server = app.listen(app.get('port'), app.get('host'))

  return new Promise((fulfil, reject) => { //eslint-disable-line better/no-new
    server // eslint-disable-line fp/no-unused-expression
      .on('listening', () => { // eslint-disable-line better/explicit-return
        // eslint-disable-next-line fp/no-unused-expression
        debug(`Feathers application started on ${connect.getLocation(server, true)}`)
        return fulfil(server)
      })
      .on('error', reject)

    return true
  })
}

const connect = function (app) { // eslint-disable-line func-names, fp/no-mutation, no-unused-vars
  return Promise.resolve(launch)
}

connect.getLocation = (server, debug = false) => { // eslint-disable-line fp/no-mutation
  const { address, port } = server.address()
  return `${address}:${port}${!debug ? '' : `:${process.env.NODE_ENV || 'development'}`}`
}

module.exports = connect // eslint-disable-line fp/no-mutation
