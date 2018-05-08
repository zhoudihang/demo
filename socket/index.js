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
const bs = require("browser-sync").create();
bs.init({
    proxy: "http://localhost:3000",
    open: false
});

bs.watch(__dirname + '/admin/*.html').on('change', bs.reload);
bs.watch(__dirname + '/web/*.html').on('change', bs.reload);
bs.watch(__dirname + '/router/*.js').on('change', bs.reload);


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

const io = require('socket.io')(server);
io.on('connection', function(socket) {
  socket.emit('news', { hello: 'world' });
  console.log('it works.');
  socket.on('event', function(socket) {
    console.log('it on event.');
  });
});


// 进程： pm2 forever nodemon
// 缺点：
//    pm2 每次保持都弹出node.exe
//    forever window下--watch不知道为啥不执行
//    nodemon 不能退出命令行
// 开发环境进程选择nodemon
// 生产环境进程选择nodemon