<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <ul>
      <li>
        <router-link :to="'new'">new</router-link>
      </li>
      <li>
        <router-link :to="'NewList'">NewList</router-link>
      </li>
    </ul>
  </div>
</template>
<script>
import Vajax from '../../../config/ajax'
import RequestPath from '../../../config/request.path'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to index helloworld'
    }
  },
  mounted: function () {
    console.log(RequestPath)
    Vajax({
      url: '/index/getArtList',
      data: {
        curr: 1,
        limit: 10
      },
      sCallback: function (data) {
        console.log(data)
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
