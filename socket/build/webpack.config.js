const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
   entry:{
        vendor: ["jquery", "react-dom" ,"react" ,"socket.io-client"],
        app: "./src/index.js"
     },
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
      // 提取公共文件
      // new webpack.optimize.CommonsChunkPlugin({
      //      name: "vendor",
      //      chunks: ["index", "pageB"]
      //      minChunks: Infinity
      // })
  ],
  optimization: {
       splitChunks: {
         name: 'common'
       }
  }
   
}