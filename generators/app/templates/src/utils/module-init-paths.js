/* eslint fp/no-mutation: 0, fp/no-nil:0, fp/no-unused-expression: 0, fp/no-mutating-assign: 0,
better/explicit-return: 0 */

const debug = require('debug')('electron-kit:init-paths')

const stringify = (strings, ...vars) => strings // eslint-disable-line fp/no-rest-parameters
  .map((each, i) => [each].concat(JSON.stringify(vars[i])))
  .reduce((acc, next) => `${acc}${next.join('')}`, '')

module.exports = (vars = {}) => {
  Object.keys(vars).map((key) => {
    Object.assign(process.env, { [key]: vars[key] })
  })
  debug(stringify`\`process.env\` params were set: ${vars}`)
  require('module').Module._initPaths()
}
