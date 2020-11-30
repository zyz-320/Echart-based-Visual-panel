<!-- 
热销商品占比的饼图
-->
<template>
  <div class="com-container">
    <div class="com-chart"
         ref="hot_ref"></div>
    <span class="iconfont arr arr-left"
          @click="toLeft"
          :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr arr-right"
          @click="toRight"
          :style="comStyle">&#xe6ed;</span>
    <span class="cate-title"
          :style="comStyle">{{ cateTitle }}</span>
  </div>
</template>

<script>
// 引入 Vuex 中的 mapState 函数，特可以将 state 中的属性映射到 当前组件的计算属性中，
// 然后就可以在当前组件中直接通过 this. 的方式来使用该属性
import { mapState } from 'vuex'
// 导入 getThemeValue 用于配置主题对应的样式
import { getThemeValue } from '@/utils/theme_utils'
export default {
  name: 'Hot',
  data () {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      currentIndex: 0, // 当前所展示出的一级分类的索引值
      titleFontSize: 0, // 标题字体大小
    }
  },
  computed: {
    // 需要显示的每个一级分类的名称
    cateTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    // 箭头和以及分类名称的字体大小样式
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    // 将 state 中的值映射为计算属性，参数数组中的值表示的是需要映射出来的 state 中的属性
    ...mapState(['theme'])
  },
  created () {
    // 在组建创建完成之后，注册得到图表数据之后的回调函数
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted () {
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在的需求
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hotproduct',
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
    // 销毁 注册了的得到图表数据之后的回调函数
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    // 创建 echarts 实例对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
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
    getData (ret) {
      // http://127.0.0.1:8888/api/hotproduct
      // let {data: ret} = await this.$http.get('hotproduct')
      this.allData = ret
      // console.log(this.allData)
      this.updateChart()
    },
    // 更新图表
    updateChart () {
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
    screenAdapter () {
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
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5, // 设置饼图的半径，控制饼图大小对屏幕大小自适应
            center: ['50%', '60%'], // 控制饼图的圆心点的位置
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 向左的箭头的点击事件处理函数
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    // 向右的箭头的点击事件处理函数
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    },
  },
  watch: {
    theme () {
      // console.log('发生了主题切换')
      // 1，销毁当前图表
      this.chartInstance.dispose()
      // 2，重新以最新的主题名称初始化图表对象
      this.initChart()
      // 3，以最新的屏幕尺寸进行屏幕适配
      this.screenAdapter()
      // 4，更新图表数据
      this.updateChart()

    }
  },
}
</script>

<style scoped lang="less">
.arr {
  position: absolute;
  color: white;
  cursor: pointer;
  top: 60%;
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
  bottom: 10%;
  color: white;
}
</style>
