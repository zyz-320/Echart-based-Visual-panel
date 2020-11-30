<!-- 
针对于 /rankpage 这条路径而显示出来的
在这个组件中通过子组件注册的方式，要显示出 Rank.vue 这个组件
-->
<template>
  <div class="com-page">
    <rank></rank>
  </div>
</template>

<script>
import Rank from '@/components/Rank.vue'
export default {
 name: 'RankPage',
  data() {
    return {
      
    }
  },
  components: {
    rank: Rank,
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less">

</style>
