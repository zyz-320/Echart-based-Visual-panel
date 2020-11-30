<!-- 
针对于 /sellerpage 这条路径而显示出来的
在这个组件中通过子组件注册的方式，要显示出Seller.vue这个组件
-->
<template>
  <div class="com-page">
    <seller></seller>
  </div>
</template>

<script>
import Seller from '@/components/Seller.vue'
export default {
 name: 'SellerPage',
  data() {
    return {
      
    }
  },
  components: {
    seller: Seller,
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less">

</style>
