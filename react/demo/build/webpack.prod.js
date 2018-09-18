const merge = require('webpack-merge');
const webpackConfig = require('./webpack.config.js');
const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(webpackConfig,{
  plugins:[
     new uglifyjsWebpackPlugin()
  ]
})

