'use strict'
var http=require('http');
var path = require('path');
var express=require('express');
var ejs = require('ejs');
const proxy = require('http-proxy-middleware');
var app=express();


// app.use(express.static(path.join(__dirname, 'test')));
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
app.set('view', __dirname);
app.engine('.html', ejs.__express);//转成支持.html 文件
app.set('view engine', 'html');
//设置静态资源
app.use(express.static(path.join(__dirname, '../test')));

// error handler
app.use(function (err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // console.log(res.locals.message);
    res.render('error',{errorMsg:err});
});

// 接口代理
app.use('/*/*',proxy({
    target: "http://114.115.137.212",
    changeOrigin: true
}));

app.use('(/*.html||/)',function (req, res, next) {
    var usePath = __dirname + '/../test/view/';
    if(req.baseUrl==''){
          usePath = usePath + 'index.html';
    }else{
          usePath = usePath + req.baseUrl;
    }
    res.sendFile(path.resolve(usePath));
});


var server = http.createServer(app);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(80);
// 对于所有文件返回index.html
// app.get('*', (req, res) => {
//      console.log("path.resolve(__dirname, '../test/view/index.html')----------->"+path.resolve(__dirname, '../test/view/index.html'));
//      res.render(path.resolve(__dirname, '../test/view/index.html'));
// });
// server.listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');
console.log('open server => 127.0.0.1:80');