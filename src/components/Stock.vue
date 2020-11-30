<!-- 
库存销量分析的环形饼图
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
export default {
 name: 'Stock',
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      currentIndex: 0, // 控制显示的是哪五个商品
      timerId: null, // 定时器的Id
    }
  },
  computed: {},
  created() {
    // 注册获取到 stock 数据之后的回调函数
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted() {
    // this.getData()
    // 向服务端发送数据
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    this.initChart()
    window.addEventListener('resize', this.screenAdapter)
    // 刚进入页面的时候就先进行一下图表相对于屏幕的自适应
    this.screenAdapter()
  },
  destroyed () {
    // 图表销毁的时候解除事件监听，防止内存泄露
    window.removeEventListener('resize', this.screenAdapter)
    // 取消定时器
    clearInterval(this.timerId)
    // 清除注册过的回调函数
    this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    // 创建 echarts 实例对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, 'chalk')
      // 初始化图标控制项
      const initOption = {
        title: {
          text: '▎ 库存和销量分析',
          left: 20,
          top: 20,
        },
      }
      this.chartInstance.setOption(initOption)
      // 监听鼠标进入图表的事件，取消掉定时器
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      // 监听鼠标离开图表的事件，重新添加定时器
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    getData(ret) {
      // http://127.0.0.1:8888/api/stockproduct
      // let {data: ret} = await this.$http.get('stock')
      this.allData = ret
      // console.log(this.allData)
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      // 每个圆环的销量扇形圆环部分的渐变颜色值
      const colorArr = [
        ['#0ba82c', '#4ff778'],
        ['#e8b11c', '#e5dd45'],
        ['#e55445', '#e8821c'],
        ['#ab6ee5', '#5052ee'],
        ['#2e72bf', '#23e5e5'],
      ]
      // 每个饼图中心的点的坐标
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%'],
      ]
      // 处理数据
      let start = this.currentIndex * 5
      let end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          radius: [110, 100], // 通过设置 [外圆半径， 内圆半径] 来显示圆环
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          labelLine: {
            show: false, // 隐藏标签指示线
          },
          label: {
            position: 'center', // 将标签显示在圆环中心，只显示一个标签，所以不要给库存设置 name 属性
            color: colorArr[index][0], // 标签的颜色
          },
          center: centerArr[index],
          data: [
            {
              name: item.name + '\n' + item.sales,
              value: item.sales,
              itemStyle: { // 设置每个扇形圆环的颜色
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { // 百分之0状态下的颜色值
                    offset: 0,
                    color: colorArr[index][0],
                  },
                  { // 百分之百状态下的颜色值
                    offset: 1,
                    color: colorArr[index][1],
                  }
                ]), 
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843', // 设置每个扇形圆环的颜色
              }
            },
          ]
        }
      })
      const dataOption = {
        series: seriesArr,
      }
      this.chartInstance.setOption(dataOption)
      // 开启图表的定时切换
      this.startInterval()
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter() {
      // 设置标题大小
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      // 设置圆环的内外半径
      const innerRadius = titleFontSize * 2
      const outterRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            // 由于图表组件调用 initChart（未配置series） 后就马上调用了 sreenAdapter 此时 updateChart（配置了series） 还没有被调用，
            // 因此每个图表的 type 还没被指明，这样导致了报错
            type: 'pie', 
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie', 
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie', 
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie', 
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: 'pie', 
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 定时切换显示的商品种类
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart() // 更新页面的显示
      }, 5000)
    }
  }
}
</script>

<style scoped lang="less">

</style>
