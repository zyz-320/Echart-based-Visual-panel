<!-- 
销量趋势的折线图
-->
<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎ ' + showTitle }}</span>
      <span class="iconfont icon-title" @click="showChoice = !showChoice" :style="comStyle">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">{{ item.text }}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
 name: 'Trend',
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      showChoice: false, // 是否显示标题可选项
      choiceType: 'map', // 显示的数据标题
      titleFontSize: 0, // 标题字体的大小
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
    // 图表销毁的时候解除事件监听，防止内存泄露
    window.removeEventListener('resize', this.screenAdapter)
  },
  computed: {
    // 标题下拉框的内容(要过滤掉当前显示的可选条目)
    selectTypes () {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    // 当前呈现的标题
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 设置给标题的样式
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    // 设置下拉框文字的左外边距的样式
    marginStyle () {
      return {
        marginLeft: this.titleFontSize * 0.9 + 'px'
      }
    }
  },
  methods: {
    // 创建 echarts 实例对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, 'chalk')
      // 初始化图标控制项
      const initOption = {
        grid: { // 坐标轴设置
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '2%',
          containLabel: true,
        },
        tooltip: { // 工具提示
          trigger: 'axis',
        },
        legend: {   // 图例位置
          top: '16%',
          left: 20,
          icon: 'circle', // 圆形图例
        },
        xAxis: {
          type: 'category',
          boundaryGap: false, // 紧挨边缘设置
        },
        yAxis: {
          type: 'value',
        },
        series: []
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取服务器的数据
    async getData() {
      // http://127.0.0.1:8888/api/trend
      let { data: ret } = await this.$http.get('trend')
      console.log(ret)
      this.allData = ret
      // 更新数据（相当于在promise的then方法中被调用）
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 处理数据
      // 类目轴数据
      const timeArr = this.allData.common.month
      // 数量轴数据 series下的数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name, // 与 图例数据 中的 数据 保持一致
          type: 'line',
          data: item.data,
          // 设置堆叠图效果
          stack: this.choiceType,
          // 区域填充
          areaStyle: {
            // 设置填充区域的颜色渐变
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index],
              },
              {
                offset: 1,
                color: colorArr2[index],
              }
            ])
          }, 
        }
      })
      // 图例的数据
      const legendArr = valueArr.map((item) => {
        return item.name // 与series中的name属性保持一致
      })
      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter() {
      // console.log(this.$refs.trend_ref.offsetWidth)
      // 设置标题大小
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6

      const adapterOption = {
        legend: { // 控制图例的大小
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize, // 图例的宽高
          itemGap: this.titleFontSize, // 间隙大小
          textStyle: { // 图例文字的大小
            fontSize: this.titleFontSize / 2,
          },
        },
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 下拉框标题选择的点击事件处理函数
    handleSelect (currentType) {
      this.choiceType =  currentType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style scoped lang="less">
  .title {
    position: absolute;
    left: 20px;
    top: 20px;
    color: white;
    z-index: 10;
    .icon-title {
      margin-left: 10px;
      cursor: pointer; 
      user-select: none; // 设置用户不能选中元素中的文本
    }
    .select-con {
      cursor: pointer; 
      background-color: #222733;
    }
  }
</style>
