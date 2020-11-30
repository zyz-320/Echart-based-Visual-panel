<!-- 
商家销量统计的横向柱状图
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
export default {
 name: 'Seller',
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 一共有多少页
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
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, 'chalk')
      // 初始化图标控制项
      const initOption = {
        title: {
          text: '▎ 商家销售统计',
          left: 20,
          top: 20,
        },
        grid: { // 设置坐标轴相对于画布的位置
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true, // 坐标轴的相对位置是否包含类目轴文字以及数值轴的数字(距离是包含坐标轴上的文字的)
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 设置鼠标移入后的条目背景
            type: 'line',
            z: 0, // 设置层级
            lineStyle: {
              color: '#2d3443',
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: { // 显示数据
              show: true,
              position: 'right',
              color: 'white',
            },
            itemStyle: { // 控制每个条目的样式
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { // 百分之0状态下的颜色值
                  offset: 0,
                  color: '#5052ee',
                },
                { // 百分之百状态下的颜色值
                  offset: 1,
                  color: '#ab6ee5',
                }
              ])   // 设置渐变色
            }
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
      // http://127.0.0.1:8888/api/seller
      let {data: ret} = await this.$http.get('seller')
      this.allData = ret
      // 对数据进行从大到小排序
      this.allData.sort((a, b) => {
        return b.value - a.value
      })
      // 每5个元素显示一页
      this.totalPage = Math.ceil(this.allData.length / 5)
      // 更新数据（相当于在promise的then方法中被调用）
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      // 被展示的5条数据
      const start = (this.currentPage - 1) * 5
      const end = start + 5
      const showData = this.allData.slice(start, end)
      // 从allData数据中分离出类目轴数据
      const sellerName = showData.map((item) => {
        return item.name
      })
      // 从allData数据中分离出数值数据
      const sellerValue = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerName,
        },
        series: [
          {
            data: sellerValue,
          },
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 开启刷新列表的定时器(在获取数据之后调用这个方法)
    startInterval() {
      // 保险操作，事先清除定时器，避免定时器重叠
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter() {
      // console.log(this.$refs.seller_ref.offsetWidth)
      // 设置标题大小
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: { // 设置鼠标移入后的条目背景
            lineStyle: {
              width: titleFontSize,
            }
          }
        },
        series: [
          {
            barWidth:titleFontSize, // 修改柱子的宽度
            itemStyle: { // 控制每个条目的样式
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0], // 设置圆角
            }
          },
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped lang="less">

</style>
