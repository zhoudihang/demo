const Koa = require('koa');
const koa = new Koa();

const error = (ctx, next) => {
         const ctxStatusCode = parseInt(ctx.status);
         console.log('error');
         console.log(ctxStatusCode);
         switch(ctxStatusCode){
               case 404 :
                  ctx.body = '404-error'
               break;
               case 500 :
                  ctx.body = '500-error'
               break;
               default : 
                  next();
         }
}


module.exports = error;

