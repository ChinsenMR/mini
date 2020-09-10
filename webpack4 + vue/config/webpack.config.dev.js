const base = require('./webpack.config.base')
const merge = require('webpack-merge')
const webpack = require('webpack')
const createVueLoaderOptions = require('./vue-loader.config')

const isDevModel = process.env.NODE_ENV === 'development';

module.exports = merge(base, {
    devServer: {
        port: 8089,
        host: '127.0.0.1',
        open: true,
        hot: true,
        overlay: {
            erros: true
        }
    },
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                options: createVueLoaderOptions(isDevModel)
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
})