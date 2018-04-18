<template>
  <div id="index">
    <img src="../../assets/logo.png">
    this is index
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'Index'
}
</script>

<style>
#index {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
