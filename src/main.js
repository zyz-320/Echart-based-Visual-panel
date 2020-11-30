import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局样式文件
import './assets/css/global.less'
// 引入字体文件
import './assets/font/iconfont.css'
// 对服务端进行 WebSocket 的连接
import SocketService from '@/utils/socket_service'
SocketService.Instance.connect()
// 将 SocketService.Instance 挂载到 vue 的原型对象上，
// 这样在每个组件中都可以通过 this.$socket 的方式访问到同一个 SocketService 的实例对象
Vue.prototype.$socket = SocketService.Instance

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
