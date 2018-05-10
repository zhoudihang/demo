const Koa = require('koa');
const koa = new Koa();
const Router = require('koa-router');
const router = new Router({
  prefix: '/admin'
});
const path = require('path');

router.get('/', (ctx, next) => {
	
    ctx.render('admin/index')
})
router.get('/abc', (ctx, next) => {
    ctx.body = 'admin abc'
})

module.exports = router;

