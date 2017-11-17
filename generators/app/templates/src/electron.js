/* eslint no-underscore-dangle:0, fp/no-unused-expression: 1 */

const debug = require('debug')('electron-kit:client')
const electron = require('electron')
const { resolve } = require('path')

const app = require('./app')
const initPaths = require('./utils/module-init-paths')
const selectDisplay = require('./utils/display-select')
const shouldConnect = require('./connect')

require('./utils/caught-uncaught')
require('electron-debug')({ showDevTools: false, enabled: true })
initPaths({ NODE_CONFIG_DIR: resolve(__dirname, '../config') })

const { app: client } = electron

const unfullscreen = (win) => { // eslint-disable-line
  // const { setFullScreen, unmaximize } = win
  // setFullScreen(false)
  // unmaximize()
  return true
}

const onReady = ({ BrowserWindow, screen }, server) => {
  // eslint-disable-next-line better/no-new
  const win = new BrowserWindow(Object.assign({}, selectDisplay(screen), {
    'web-preferences': { plugins: true },
    // icon: resolve('./src/app/images/logo.png'),
    backgroundColor: '#fff',
    frame: false,
    kiosk: true,
    show: false,
    titleBarStyle: 'hidden',
  }))

  win.loadURL(`http://${shouldConnect.getLocation(server)}`)
  win.setFullScreen(true)

  win.on('ready-to-show', () => {
    win.show()
    win.focusOnWebView()
    return debug('Application is ready')
  })

  win.once('leave-full-screen', () => {
    unfullscreen(win)
    return debug('Leave fullscreen')
  })

  win.on('closed', () => {
    // win.close()
    return debug('Attempt to close the app')
  })

  win.on('session-end', () => {
    win.destroy()
    return debug('Session is over. Halt if possible')
  })

  win.on('crashed', () => {
    win.reload()
    return debug('Session is over. Halt if possible')
  })

  return true
}

client.on('ready', () => {
  return shouldConnect(app)
    .then((connect) => connect(app))
    .then((server) => onReady(electron, server))
})

client.on('browser-window-created', () => {
  return debug('BrowserWindow was created. Do stuff at background...')
})

client.on('window-all-closed', () => {
  debug('All windows were closed')
  return client.quit()
})
