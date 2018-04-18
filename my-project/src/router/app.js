import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/module/app/HelloWorld'
import New from '@/module/app/New'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/new',
      name: 'New',
      component: New
    }
  ]
})
