'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

let electronProcess = null
let manualRestart = false
let hotMiddleware

function logStats (proc, data) {
    let log = ''

    log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
    log += '\n\n'

    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach(line => {
            log += '  ' + line + '\n'
        })
    } else {
        log += `  ${data}\n`
    }

    log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

    console.log(log)
}

function startRenderer () {
    return new Promise((resolve, reject) => {
        rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)

        const compiler = webpack(rendererConfig)
        hotMiddleware = webpackHotMiddleware(compiler, {
            log: false,
            heartbeat: 2500
        })

        compiler.plugin('compilation', compilation => {
            compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
                hotMiddleware.publish({ action: 'reload' })
                cb()
            })
        })

        compiler.plugin('done', stats => {
            logStats('Renderer', stats)
        })

        const server = new WebpackDevServer(
            compiler,
            {
                contentBase: path.join(__dirname, '../'),
                quiet: true,
                before (app, ctx) {
                    app.use(hotMiddleware)
                    ctx.middleware.waitUntilValid(() => {
                        resolve()
                    })
                }
            }
        )

        server.listen(9080)
    })
}

function startMain () {
    return new Promise((resolve, reject) => {
        mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)

        const compiler = webpack(mainConfig)

        compiler.plugin('watch-run', (compilation, done) => {
            logStats('Main', chalk.white.bold('compiling...'))
            hotMiddleware.publish({ action: 'compiling' })
            done()
        })

        compiler.watch({}, (err, stats) => {
            if (err) {
                console.log(err)
                return
            }

            logStats('Main', stats)

            if (electronProcess && electronProcess.kill) {
                manualRestart = true
                process.kill(electronProcess.pid)
                electronProcess = null
                startElectron()

                setTimeout(() => {
                    manualRestart = false
                }, 5000)
            }

            resolve()
        })
    })
}

function startElectron () {
    electronProcess = spawn(electron, ['--inspect=5858', '.'])

    electronProcess.stdout.on('data', data => {
        electronLog(data, 'blue')
    })
    electronProcess.stderr.on('data', data => {
        // electronLog(data, 'red')
        console.log(chalk.red(data.toString()))
    })

    electronProcess.on('close', () => {
        if (!manualRestart) process.exit()
    })
}

function electronLog (data) {
    // noinspection RegExpRedundantEscape
    const pattern = /(@renderer|@main)?(\s+)?\[(\w+)\]\s+([^:]+):(.+)/
    const _match = data.toString().match(pattern)

    if(_match === null && _match !== null) {
        if(/[0-9A-z]+/.test(data.toString()))
            console.log(data.toString())

        return
    }

    let m
    let caller = ''
    let level = ''
    let msg = ''
    let postFormat = ''

    m = pattern.exec(data.toString())

    if(m === null || m === undefined) {
        console.log(data.toString())
        return
    }

    m.forEach((match, groupIndex) => {
        //console.log(`Found match, group ${groupIndex}: ${match}`)
        if(match !== null && match !== undefined) {
            if (groupIndex === 1) {

                if (match.length > 0) {
                    caller = match.includes('@main') ? chalk.magenta('@main     ') : chalk.yellow('@renderer ')
                } else {
                    caller = ''
                }
            } else if (groupIndex === 3) {
                if (match.toString().includes('debug')) {
                    level = ' ' + m[3]
                    msg = m[5]
                } else if (match.toString().includes('verbose')) {
                    level = chalk.white(m[3])
                    msg = chalk.white(m[5])
                } else if (match.toString().includes('info')) {
                    level = chalk.blue(' ' + m[3] + '  ')
                    msg = chalk.blue(m[5])
                } else if (match.toString().includes('warn')) {
                    level = chalk.yellow(' ' + m[3] + ' ')
                    msg = chalk.yellow(m[5])
                } else if (match.toString().includes('error')) {
                    level = chalk.red(' ' + m[3] + ' ')
                    msg = chalk.red(m[5])
                }
            }
        }
    })

    console.log(
        caller +
        '[' + level + ']' + ' ' +
        _match[4] + ': ' +
        msg
    )
}

function greeting() {
    console.log(chalk.blue('  getting ready...') + '\n')
}

function init () {
    greeting()

    Promise.all([startRenderer(), startMain()])
        .then(() => {
            startElectron()
        })
        .catch(err => {
            console.error(err)
        })
}

init()
