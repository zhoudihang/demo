const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
   entry:"./src/index.js",
   module:{
       rules:[
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            },
            {
                test:/\.css$/,
                use:[{loader:'style-loader'},{loader:'css-loader'}]
            }
       ]
   },
  plugins: [
  
  ]
   
}