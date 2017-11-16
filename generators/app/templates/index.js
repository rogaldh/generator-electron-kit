/* eslint-disable fp/no-unused-expression, fp/no-mutation */

const { resolve } = require('path')
const debug = require('debug')('electron-kit:index')

const initPaths = require('./src/utils/module-init-paths')

debug('Initialize package paths')
initPaths({ NODE_CONFIG_DIR: resolve(__dirname, './config') })
// define path to Feathersjs's config path

module.exports = require('./src/electron')
