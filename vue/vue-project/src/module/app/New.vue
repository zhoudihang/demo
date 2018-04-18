
<template>
  <div class="New">
    <h1>{{ msg }}</h1>
    <button @click="button">loading items</button>
    <new-list :items="items"></new-list>
  </div>
</template>

<script>

import NewList from './NewList'
export default {
  name: 'New',
  data () {
    return {
      msg: 'Welcome to New',
      items: []
    }
  },
  components: {
    NewList
  },
  methods: {
    button: function () {
      console.log(NewList)
      console.log(NewList.data())
      this.items = [{'name': 'first'}, {'name': 'second'}, {'name': 'three'}]
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
