<!-- 
热销商品占比的饼图
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cate-title" :style="comStyle">{{ cateTitle }}</span>
  </div>
</template>

<script>
export default {
 name: 'Hot',
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      currentIndex: 0, // 当前所展示出的一级分类的索引值
      titleFontSize: 0, // 标题字体大小
    }
  },
  computed: {
    // 需要显示的每个一级分类的名称
    cateTitle() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    // 箭头和以及分类名称的字体大小样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    }
  },
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
    // 图表销毁的时候解除事件监听，防止内存泄露
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 创建 echarts 实例对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, 'chalk')
      // 初始化图标控制项
      const initOption = {
        title: {
          text: '▎ 热销商品的占比',
          left: 20,
          top: 20,
        },
        legend: {
          top: '15%',
          icon: 'circle', // 控制图例的形状
        },
        tooltip: {
          show: true, 
          formatter: (arg) => { 
            // 这里 arg 中的 data 属性就是设置给 series 的 data 中的数据（包含name和value两个属性的对象）。
            // 由于工具提示中想要使用该二级分类下的三级分类的数据，但是原 series 的 data 中并没有设置三级分类的数据
            // 为了能够在这里使用上三级分类的数据，我们要先去 series 的 data 中添加上一个 children属性存放三级分类的数据
            // console.log(arg)
            const thirdCategory = arg.data.children
            // arg.value 是二级分类的总数量，用于计算三级分类占比
            let tips = `<h3>${arg.name}(${arg.percent}%)</h3>`
            thirdCategory.forEach(item => {
              tips += `${item.name}： ${parseInt(item.value / arg.value * 100)}%<br/>`
            })
            return tips
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false,
            },
            emphasis: { // 扇形处于高亮状态下的样式
              label: {
                show: true, // 显示标签
              },
              labelLine: {
                show: false, // 隐藏标签指示线
              },
            }
          },
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取服务器的数据
    async getData() {
      // http://127.0.0.1:8888/api/hotproduct
      let {data: ret} = await this.$http.get('hotproduct')
      this.allData = ret
      // console.log(this.allData)
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      const legendArr = this.allData[this.currentIndex].children.map((item) => {
        return item.name
      })
      const valueArr = this.allData[this.currentIndex].children.map((item) => {
        // 为了能够在 tooltip 中使用上三级分类的数据，我们要先去 series 的 data 中添加上一个 children 属性存放三级分类的数据
        return {
          name: item.name, // 二级分类的名称
          value: item.value,
          children: item.children, // 三级分类的数据，为了给 tooltip 中使用
        }
      })
      const dataOption = {
        legend: {
          data: legendArr,
        },
        series: [
          {
            data: valueArr,
          },
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter() {
      // console.log(this.$refs.hot_ref.offsetWidth)
      // 设置标题大小
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5, // 设置饼图的半径，控制饼图大小对屏幕大小自适应
            center: ['50%', '50%'], // 控制饼图的圆心点的位置
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 向左的箭头的点击事件处理函数
    toLeft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    // 向右的箭头的点击事件处理函数
    toRight() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    },
  }
}
</script>

<style scoped lang="less">
.arr {
  position: absolute;
  color: white;
  cursor: pointer;
  top: 50%;
  transform: translateY(-50%);
  user-select: none; // 禁止文本选中
}
.arr-left {
  left: 10%;
}
.arr-right {
  right: 10%;
}
.cate-title {
  position: absolute;
  left: 78%;
  bottom: 15%;
  color: white;
}
</style>
