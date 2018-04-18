// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Index from './Index.vue'
import router from '../../router/index'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#index',
  router,
  components: { Index },
  template: '<Index/>'
})
