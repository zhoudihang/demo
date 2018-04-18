<template>
  <div class="NewList">
    <ul>
        <li v-for="item in items" :key="item.name">
         {{ item.name }}
        </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'NewList',
  props: ['items'],
  data () {
    return {
      newmsg: 'this is newmsg'
    }
  },
  methods: {
    button: function () {
      console.log('NewList')
    }
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
