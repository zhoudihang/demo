const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
   mode:"production",
   devtool: 'eval-source-map',
   entry:'./src/index.js',
    output: {
        path: __dirname + "/dist",//打包后的文件存放的地方
        filename: "bundle.js"//打包后输出文件的文件名
    },
    devServer: {
        contentBase: "./src",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
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
    new UglifyJsPlugin(),
    new HtmlWebpackPlugin({template: __dirname+'/src/index.html'})
  ]
}