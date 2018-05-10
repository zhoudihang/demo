const Koa = require('koa');
const koa = new Koa();
const Router = require('koa-router');
const router = new Router();
const path = require('path');

router.get('/', (ctx, next) => {
    console.log(ctx.status);
    ctx.body = {body:123}
    // ctx.render('web/index', {double: 'rainbow'});
})
router.get('/app', (ctx, next) => {
    console.log(ctx.status);
    ctx.body = 'ctx'
})

module.exports = router;

