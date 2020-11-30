<!-- 
地区销售排行表的纵向柱状图
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
export default {
 name: 'Rank',
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      startValue: 0, // 区域缩放的开始条目的索引值
      endValue: 9, //  区域缩放的结束条目的索引值（一共显示十条数据）
      timerId: null, // 定时器的ID
    }
  },
  components: {},
  created() {
    this.getData()
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.screenAdapter)
    // 刚进入页面的时候就先进行一下图表相对于屏幕的自适应
    this.screenAdapter()
  },
  destroyed () {
    // 在组件被销毁时，清除定时器
    clearInterval(this.timerId)
    // 图表销毁的时候解除事件监听，防止内存泄露
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 创建 echarts 实例对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, 'chalk')
      // 初始化图标控制项
      const initOption = {
        title: {
          text: '▎ 地区销售排行',
          left: 20,
          top: 20,
        },
        grid: { // 设置坐标轴相对于画布的位置
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true, // 坐标轴的相对位置是否包含类目轴文字以及数值轴的数字(距离是包含坐标轴上的文字的)
        },
        yAxis: {
          type: 'value'
        },
        xAxis: {
          type: 'category',
        },
        tooltip: {
          show: true,
        },
        series: [
          {
            type: 'bar',
            /* label: { // 显示数据
              show: true,
              position: 'top',
              color: 'white',
            }, */
          },
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    async getData() {
      // http://127.0.0.1:8888/api/rank
      let {data: ret} = await this.$http.get('rank')
      this.allData = ret
      // 将数据从大到小排序
      this.allData.sort((a, b) => {
        return b.value - a.value
      })
      // console.log(this.allData)
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      // 颜色渐变的数据
      const colorArr = [
        ['#0ba82c', '#4ff778'],
        ['#2e72bf', '#23e5e5'],
        ['#5052ee', '#ab6ee5'],
      ]
      const provinceArr = this.allData.map(item => { // 所有省份名称形成的数组
        return item.name
      })
      const valueArr = this.allData.map(item => { // 所有省份对应的销量金额
        return item.value
      })
      const dataOption = {
        xAxis: {
          data: provinceArr,
        },
        dataZoom: { // 区域缩放选择工具
          show: false, // 将选择组件隐藏起来
          startValue: this.startValue, // 区域缩放的开始条目的索引值
          endValue: this.endValue, //  区域缩放的结束条目的索引值（一共显示十条数据）
        },
        series: [
          {
            data: valueArr,
            itemStyle: { // 控制每个条目的样式
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              color: arg => {
                // arg 参数中包含每个省份销售金额
                // console.log(arg)
                let targetColorArr = null
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { // 百分之0状态下的颜色值
                    offset: 0,
                    color: targetColorArr[0],
                  },
                  { // 百分之百状态下的颜色值
                    offset: 1,
                    color: targetColorArr[1],
                  }
                ])   // 设置渐变色
              },
            },
          },
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter() {
      // console.log(this.$refs.rank_ref.offsetWidth)
      // 设置标题大小
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            barWidth:titleFontSize, // 修改柱子的宽度
            itemStyle: { // 控制每个条目的样式
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0], // 设置圆角
            }
          },
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 使用定时器改变 startValue endValue 的值，修改显示的数据
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style scoped lang="less">

</style>
