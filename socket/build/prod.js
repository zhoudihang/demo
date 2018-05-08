// 生成环境
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackConfig = require('./webpack.config');

var common = {
   mode:"production",
   output: {
        path: __dirname + "/../dist",//打包后的文件存放的地方
        filename: "bundle.[hash].js"//打包后输出文件的文件名
   },
   plugins: [
      new UglifyJsPlugin(),
      new HtmlWebpackPlugin({template: './src/index.html'})
   ]
}

module.exports = merge(WebpackConfig , common);