var path = require('path');

module.exports = {
     entry:'./index.js',
     output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
     },
     mode:'development',
     module: {
        rules: [
              // es6 转 es5
              {
                 test:/\.(js|jsx)$/,
                 exclude:/node_modules/,
                 loader:'babel-loader',
                 query:{
                      presets:['es2015','react']
                 }
               }
        ]
      }
}


