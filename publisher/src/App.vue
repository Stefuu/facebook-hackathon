<template>
  <div id="app">
    <router-view :key="$route.fullPath"/>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>
<style>
  body {
    margin: 5px;
  }
  h1 { 
      color: #111; 
      font-family: 'Helvetica Neue', 
      sans-serif; 
      font-weight: bold; 
      letter-spacing: -1px; 
      line-height: 1; 
    }


  h2 { color: #111; 
      font-family: 'Open Sans', 
      sans-serif; font-weight: 300; 
    }


  p { color: #685206; 
      font-family: 'Helvetica Neue', 
      sans-serif;  
    } 
</style>
