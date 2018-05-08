const Koa = require('koa');
const koa = new Koa();
const Router = require('koa-router');
const router = new Router({
    prefix: '/api'
});

const path = require('path');
router.get('/', (ctx, next) => {
    ctx.body  = {abc:'123456'}
})

router.get('/abc', (ctx, next) => {
    ctx.body = 'admin abc'
})

module.exports = router;

