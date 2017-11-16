/* eslint fp/no-mutation: 0, fp/no-this: 0 */
/* eslint better/explicit-return: 0 */

const { readdir, lstat } = require('fs')
const promisify = require('util.promisify')
const Gen = require('yeoman-generator')
const path = require('path')

const readdirP = promisify(readdir)
const lstatP = promisify(lstat)

const isDirectory = (source) => lstatP(source).then((readSource) => readSource.isDirectory())

module.exports = class extends Gen {

  initializing() {
    return this.composeWith('generator-feathers')
  }

  install() {
    const packagePath = path.resolve('./')

    return this
      .prompt([{
        type: 'confirm',
        name: 'electron',
        message: 'Would you like to use Electron?',
      }])
      .then(({ electron }) => {
        let directories = [] // eslint-disable-line fp/no-let
        return !electron
          ? Promise.resolve('skip Electron installation')
          : readdirP(packagePath)
            .then((dirs) => {
              directories = dirs
              return Promise.all(dirs.map((each) => isDirectory(each)))
            })
            .then((actualDirs) => this
              .prompt({
                type: 'list',
                name: 'directory',
                message: 'Where should we install Electron?',
                choices: directories // eslint-disable-line fp/no-mutating-methods
                  .filter((each, i) => actualDirs[i])
                  .filter((each) => !each.match(/test|config|node_modules|^\./ig))
                  .sort((a, b) => a.charCodeAt() < b.charCodeAt()),
              }) // list available directories
              .then(({ directory }) => Promise.all([
                this.fs.copy(
                  this.templatePath('./src/connect.js'),
                  this.destinationPath(`${directory}/connect.js`)
                ),
                this.fs.copy(
                  this.templatePath('./src/electron.js'),
                  this.destinationPath(`${directory}/electron.js`)
                ),
                this.fs.copy(
                  this.templatePath('./src/utils'),
                  this.destinationPath(`${directory}/utils`)
                ),
                this.fs.copy(
                  this.templatePath('./index.js'),
                  this.destinationPath('index.js')
                ),
                this.fs.copyTpl(
                  this.templatePath('./.electron-builder.ejs'),
                  this.destinationPath('.electron-builder.json'),
                  {
                    // TODO: Should pass basic values for electron-builder from argv
                    packageName: 'PACKAGE_NAME',
                    author: 'AUTHOR'
                  }
                ),
              ])) // copy electron assets to specified dir
              .then(() => {
                const pathToPackageJSON = this.destinationPath('package.json')
                return Promise
                  .resolve(this.fs.readJSON(pathToPackageJSON))
                  .then((packageJSON) => {
                    const scripts = Object.assign({}, packageJSON.scripts || {}, {
                      'test': 'npm run check:lint && npm run check:mocha',
                      'start': 'electron .',
                      'check:lint': 'eslint src/. test/.',
                      'check:mocha': 'cross-env BABEL_DISABLE_CACHE=1 NODE_PATH=./src node ./node_modules/mocha/bin/mocha --compilers js:babel-core/register test/ --recursive',
                      'build': 'cross-env NODE_ENV=production concurrently "npm run build:webpack"',
                      'build:webpack': 'cross-env BABEL_ENV=webpack node ./node_modules/webpack/bin/webpack --config webpack.default.config.js --profile --colors',
                      'build:webpack:verbose': 'npm run build:webpack -- --progress',
                      'prebuild:platform': 'node ./node_modules/rimraf/bin ./build/Release',
                      'build:platform': 'node ./node_modules/electron-builder/out/cli/cli --config .electron-builder.json',
                      'build:platform:all': 'npm run build:platform -- -l',
                      'build:platform:silent': 'npm run build:platform -- --publish never',
                      'package': 'npm run build && build:platform:silent',
                      'package:all': 'npm run build && npm run build:platform:all',
                      'rebuild': 'npm run build:platform -- install-app-deps'
                    })
                    Reflect.deleteProperty(scripts, 'eslint') // eslint-disable-line fp/no-unused-expression
                    Reflect.deleteProperty(scripts, 'mocha') // eslint-disable-line fp/no-unused-expression

                    const newPackageJSON = Object.assign({}, packageJSON, { scripts }, { main: '/' })

                    return this.fs.writeJSON(pathToPackageJSON, newPackageJSON)
                  }) // inject Electron-specific scripts
              }) // change package.json
              .then(() => {
                const pathToIndex = this.destinationPath('src/index.js')
                return Promise
                  .resolve(this.fs.read(pathToIndex))
                  .then((indexjs) => {
                    const pathToIndexTemplate = this.templatePath('./src/index.js')
                    return Promise.resolve(this.fs.read(pathToIndexTemplate))
                      .then((newIndexjs) => {
                        const content = `/** ${indexjs.replace(/\/\*/, '//').replace(/\*\//, '')} */ \
                        ${newIndexjs}`
                        return this.fs.write(pathToIndex, content)
                      })
                  }) // inject Electron-specific scripts
              }) // change package.json
              .then(() => {
                return Promise.all([
                  this.npmInstall([
                    'babel-register',
                    'debug',
                    'electron',
                    'electron-builder',
                    'eslint',
                    'mocha',
                    'rimraf',
                    'webpack',
                  ], { 'save-dev': true }),
                  this.npmInstall([
                    'concurrently',
                    'cross-env',
                    'electron-debug',
                  ], { 'save': true }),
                ])
              }) // install electron dependencies
            )
      })
  }
}
