const Koa = require('koa');
const koa = new Koa();
const Router = require('koa-router');
const router = new Router();
// const IO = require( 'koa-socket' );
// const io = new IO();
const http = require('http');
const path = require('path');
var cors = require('koa-cors');
// 错误美化解析
const onerror = require('koa-onerror');
// 模板解析
const koaNunjucks = require('koa-nunjucks-2');
const static = require('koa-static');
// 前台
const web = require('./router/web.js');
// 后台
const admin = require('./router/admin.js');
// 接口
const api = require('./router/api.js');
// 自定义错误页面
const error = require('./router/error.js');

// 跨域KOA-CORS
const koaOptions = {
    origin: true,
    credentials: true
};
koa.use(cors(koaOptions));

// 修改保存代码刷新浏览器
// const bs = require("browser-sync").create();
// bs.init({
//     proxy: "http://localhost:3000",
//     open: false
// });

// bs.watch(__dirname + '/admin/*.html').on('change', bs.reload);
// bs.watch(__dirname + '/web/*.html').on('change', bs.reload);
// bs.watch(__dirname + '/router/*.js').on('change', bs.reload);


// 模板解析
koa
  .use(koaNunjucks({
        ext: 'html',
        path: path.join(__dirname),
        nunjucksConfig: {
          trimBlocks: true
        }
  }));
// 根据路径路由监听
// 前台
koa
  .use(web.routes())
  .use(web.allowedMethods());
// 后台
koa
  .use(admin.routes())
  .use(admin.allowedMethods());
// 接口
koa
  .use(api.routes())
  .use(api.allowedMethods());

// 静态文件配置
koa
  .use(static(__dirname + '/public'));

//根据koa自定义错误处理 
// koa
//   .use((ctx,next) => {
//        error(ctx, next)
//   })
// 错误信息显示在页面
onerror(koa);


// koa.listen(3000);
const server = http.createServer(koa.callback()).listen(3000);
console.log('http://localhost:3000/');

var io = require('socket.io')(server);
var chat = io.of('/chat');
  chat.on('connection', function (socket) {
      socket.emit('msg', { hello: 'chat world' });
      socket.on('my other event', function (data) {
        console.log(data);
        // socket.broadcast.to('some room').emit('some event',{msg:'some event'});
        // news.emit('some event',{msg:'some event'});
      });
  });

var news = io.of('/news');
    news.on('connection', function (socket) {
      socket.emit('msg', { hello: 'news world' });
      socket.on('my other event', function (data) {
          console.log(data);
          // socket.broadcast.to('some room').emit('some event',{msg:'some event'});
          socket.emit('some event',{msg:'some event'});
          socket.broadcast.emit('some event',{msg:'some event'});
      });

  });

var about = io.of('/about');
    about.on('connection', function (socket) {
      socket.emit('msg', { hello: 'about world' });
      socket.on('my other event', function (data) {
          // console.log(news.sockets);
          for(var i=0;i<news.sockets.length;i++){
console.log(news.sockets[i].emit);
               news.sockets[i].emit('some event',{msg:'some event to news'});
          }
          // console.log(data);
          // socket.broadcast.to('some room').emit('some event',{msg:'some event'});
          // news.adapter.emit('some event',{msg:'some event to news'});
      });
    });

about.on('my other event', function (data) {
     console.log(news);
    // console.log(data);
    // socket.broadcast.to('some room').emit('some event',{msg:'some event'});
    news.adapter.emit('some event',{msg:'some event to news'});
});

// const io = require('socket.io')(server);

// const HomeSpace = io.of('/home');
// const AboutSpace = io.of('/about');


// HomeSpace.on('connection', function(socket) {
//   socket.emit('news', { hello: 'HomeSpace' });
//   console.log('it works.');
//   socket.on('event', function(socket) {
//     console.log('it on HomeSpace.');
//   });
// });

// AboutSpace.on('connection', function(socket) {
//   socket.emit('news', { hello: 'AboutSpace' });
//   socket.on('event', function(socket) {
//     console.log('it on AboutSpace.');
//   });
// });
