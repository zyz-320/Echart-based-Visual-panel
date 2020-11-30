<!-- 
针对于 /trendpage 这条路径而显示出来的
在这个组件中通过子组件注册的方式，要显示出Trend.vue这个组件
-->
<template>
  <div class="com-page">
    <trend></trend>
  </div>
</template>

<script>
import Trend from '@/components/Trend.vue'
export default {
 name: 'TrendPage',
  data() {
    return {
      
    }
  },
  components: {
    trend: Trend,
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less">

</style>
