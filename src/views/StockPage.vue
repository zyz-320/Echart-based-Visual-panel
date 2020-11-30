<!-- 
针对于 /stockpage 这条路径而显示出来的
在这个组件中通过子组件注册的方式，要显示出 Stock.vue 这个组件
-->
<template>
  <div class="com-page">
    <stock></stock>
  </div>
</template>

<script>
import Stock from '@/components/Stock.vue'
export default {
 name: 'StockPage',
  data() {
    return {
      
    }
  },
  components: {
    stock: Stock,
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less">

</style>
