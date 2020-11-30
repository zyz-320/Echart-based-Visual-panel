<!-- 
针对于 /hotpage 这条路径而显示出来的
在这个组件中通过子组件注册的方式，要显示出 Hot.vue 这个组件
-->
<template>
  <div class="com-page">
    <hot></hot>
  </div>
</template>

<script>
import Hot from '@/components/Hot.vue'
export default {
 name: 'HotPage',
  data() {
    return {
      
    }
  },
  components: {
    hot: Hot,
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less">

</style>
