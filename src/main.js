import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局样式文件
import './assets/css/global.less'
// 引入字体文件
import './assets/font/iconfont.css'

// 配置请求基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将 axios挂载到vue的原型对象上
// 别的组件中通过 this.$http 得到 axios
Vue.prototype.$http = axios

// 将全局的echarts对象挂载到Vue的原型对象上
// 别的组件中 this.$echarts
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
