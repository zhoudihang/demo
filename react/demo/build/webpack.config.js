const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


const ASSET_PATH = process.env.ASSET_PATH||'/';

module.exports = {
  entry:'./src/index.js',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ASSET_PATH
  },
  module:{
    rules:[
       {
          test:/\.(jsx|js)$/,
          loader:'babel-loader'
       },
       {
         test:/\.css$/,
         use:[
            'style-loader',
            'css-loader'
         ]
       },
       {
          test:/\.less$/,
          use:[
            "style-loader",
            "css-loader",
            "less-loader"
          ]
       },
       {
          test:/\.(png|svg|jpg|gif)$/,
          use:['file-loader']
       },
       {
          test:/\.(html)$/,
          use:{
            loader:'html-loader',
            options:{
              attrs:[':data-src']
            }
          }
       },
       {
          test:/\.(woff|woff2|eot|ttf|otf)$/,
          use:['file-loader']
       },
       {
          test:/\.(csv|tsv)$/,
          use:['csv-loader']
       },
       {
          test:/\.xml$/,
          use:['xml-loader']
       }
    ]
  },
  plugins:[
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
    })
    // new CopyWebpackPlugin([{
    //   from:path.resolve(__dirname,'../index.html'),
    //   to:path.resolve(__dirname,'dist/'),
    //   force:true
    // }]),
    // new HtmlWebpackPlugin()
  ]
}