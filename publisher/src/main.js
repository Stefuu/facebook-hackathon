import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'
import Publish from './components/publish.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueRouter)
Vue.use(BootstrapVue)

const routes = [
  { path: '/', component: Publish }
]

const router = new VueRouter({ 
	routes 
})

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
