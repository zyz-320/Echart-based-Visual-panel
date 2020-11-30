<!-- 
商家分布模块（地图+散点图）
-->
<template>
  <div class="com-container"
       @dblclick="revertMap">
    <div class="com-chart"
         ref="map_ref"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils' // 根据省份的中文名查询省份拼音的工具
// 引入 Vuex 中的 mapState 函数，特可以将 state 中的属性映射到 当前组件的计算属性中，
// 然后就可以在当前组件中直接通过 this. 的方式来使用该属性
import { mapState } from 'vuex'
export default {
  name: 'Map',
  data () {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的所有的图表数据
      mapData: {}, // 所获取的省份地图的矢量数据
    }
  },
  components: {},
  created () {
    // 在组建创建完成之后，注册得到图表数据之后的回调函数
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted () {
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在的需求
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
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
    this.$socket.unRegisterCallBack('mapData')
  },
  computed: {},
  methods: {
    // 创建 echarts 实例对象
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量数据（数据不由后端服务器提供，而是在public文件夹下的static文件中）
      // 数据访问路径是： http://localhost:5000/static/map/china.json
      // 由于this.$http.get() 访问的根路径配置为 http://localhost:8888/，所以不能这样进行访问，在这里直接导入 axios ，用它进行数据读取
      const { data: ret } = await axios.get('http://localhost:5000/static/map/china.json')
      this.$echarts.registerMap('china', ret)
      // 初始化图标控制项
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20,
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2172bf', // 每个省份地图的颜色
            borderCplor: '#333', // 每个省份之间分界线的颜色
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical', // 设置图例的排布方向 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async (arg) => {
        // console.log(arg)
        const provinceInfo = getProvinceMapInfo(arg.name) // 返回值是一个 {key: 省份的中文拼音,path: 文件路径} 对象
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          // 获取这个地图的矢量数据
          const { data: ret } = await axios.get('http://localhost:5000' + provinceInfo.path)
          // 将获取到的数据保存在省份地图数据中
          this.mapData[provinceInfo.key] = ret
          // 注册这个省份地图
          this.$echarts.registerMap(provinceInfo.key, ret)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key,
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    // 获取服务器的数据
    getData (ret) { // 获取散点数据
      // http://127.0.0.1:8888/api/map
      // let { data: ret } = await this.$http.get('map')
      // console.log(ret)
      this.allData = ret
      // 更新数据（相当于在promise的then方法中被调用）
      this.updateChart()
    },
    // 更新图表
    updateChart () {
      // 处理数据
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name // 这里的值要与 series 中的 name 属性的值保持一致
      })
      const seriesArr = this.allData.map(item => {
        // return 的这个对象代表的是一个商家级别下的所有散点数据
        // 如果想要在地图中显示散点数据，就需要给散点图增加一个配置，coordinateSystem: geo，让它使用地图坐标
        return {
          type: 'effectScatter',
          rippleEffect: { // 配置涟漪动画
            scale: 5,
            brushType: 'stroke', // 将涟漪动画设置成空心效果（设置涟漪动画波纹效果）
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo', // 让散点使用地图坐标
        }
      })
      const dataOption = {
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕分辨率适配函数，当浏览器的屏幕大小发生变化的时候会调用的函数
    screenAdapter () {
      // console.log(this.$refs.map_ref.offsetWidth)
      // 设置标题大小
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      }
      this.chartInstance.setOption(adapterOption)
      // 调用图标的resize方法，使得图表随容器的大小进行自适应
      this.chartInstance.resize()
    },
    // 双击容器的事件处理函数，将省份地图恢复为中国地图
    revertMap () {
      const revertOption = {
        geo: {
          map: 'china',
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  },
  computed: {
    // 将 state 中的值映射为计算属性，参数数组中的值表示的是需要映射出来的 state 中的属性
    ...mapState(['theme'])
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
</style>
