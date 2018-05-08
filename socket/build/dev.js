// 开发环境
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const WebpackConfig = require('./webpack.config');

var common = {
   mode:"development",
   output: {
        filename: "[name].[hash].js"//打包后输出文件的文件名
   },
   devtool: 'eval-source-map',
   devServer: {
        contentBase: "./src",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
    },
   plugins: [
      new HtmlWebpackPlugin({template: './src/index.html'})
   ]
}
// webpack(merge(WebpackConfig , common));
module.exports = merge(WebpackConfig , common);