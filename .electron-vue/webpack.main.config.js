'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const Promise = require('bluebird')
const pathMap = require('./pathMap')

const BabiliWebpackPlugin = require('babili-webpack-plugin')

//bluebird config
// noinspection RedundantConditionalExpressionJS
const monitoring = process.env.NODE_ENV === 'development' ? true : false

Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true,
    monitoring: monitoring
})

let mainConfig = {
    entry: {
        main: path.join(__dirname, '../src/main/index.js')
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        alias: {
            '@modules': path.join(__dirname, '../src/modules'),
            '@helpers': path.join(__dirname, '../src/modules/helpers'),
            '@constants': path.join(__dirname, '../src/constants'),
            '@app': path.join(__dirname, '../src/app'),
            '@models': path.join(__dirname, '../src/models'),
            '@ipc': path.join(__dirname, '../src/modules/ipc'),
            '@src': path.join(__dirname, '../src'),
            '@views': path.join(__dirname, '../src/renderer/components'),
            '@viewmodels': path.join(__dirname, '../src/viewModels'),
            '@': path.join(__dirname, '../src/renderer'),
            'vue$': 'vue/dist/vue.esm.js',
        },
        extensions: ['.js', '.json', '.node']
    },
    target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    mainConfig.plugins.push(
        new webpack.DefinePlugin({
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    )

    mainConfig['devtool'] = 'eval-source-map'
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    mainConfig.plugins.push(
        new BabiliWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        })
    )
}

module.exports = mainConfig
