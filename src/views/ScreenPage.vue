<template>
  <div class="screen-container"
       :style="containerStyle">
    <header class="screen-header">
      <div>
        <img :src="headerSrc"
             alt="" />
      </div>
      <span class="logo">
        <img :src="logoSrc"
             alt="" />
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc"
             class="qiehuan"
             @click="handleThemeChange" />
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top"
             :class="[fullScreenStatus.trend ? 'fullscreen' : '']">
          <!-- 销量趋势图表 -->
          <Trend ref="trend"></Trend>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('trend')">
            <span :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom"
             :class="[fullScreenStatus.seller ? 'fullscreen' : '']">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('seller')">
            <span :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top"
             :class="[fullScreenStatus.map ? 'fullscreen' : '']">
          <!-- 商家分布图表 -->
          <Map ref="map"></Map>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('map')">
            <span :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom"
             :class="[fullScreenStatus.rank ? 'fullscreen' : '']">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('rank')">
            <span :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top"
             :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
          <!-- 热销商品占比图表 -->
          <Hot ref="hot"></Hot>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('hot')">
            <span :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="right-bottom"
             :class="[fullScreenStatus.stock ? 'fullscreen' : '']">
          <!-- 库存销量分析图表 -->
          <Stock ref="stock"></Stock>
          <!-- 全屏按钮 -->
          <div class="resize"
               @click="changeSize('stock')">
            <span :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import Trend from '@/components/Trend.vue'
import Hot from '@/components/Hot.vue'
import Seller from '@/components/Seller.vue'
import Map from '@/components/Map.vue'
import Stock from '@/components/Stock.vue'
import Rank from '@/components/Rank.vue'
// 引入 Vuex 中的 mapState 函数，特可以将 state 中的属性映射到 当前组件的计算属性中，
// 然后就可以在当前组件中直接通过 this. 的方式来使用该属性
import { mapState } from 'vuex'
// 导入 getThemeValue 用于配置主题对应的样式
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data () {
    return {
      // 存储图表是否全屏的状态数据
      fullScreenStatus: {
        trend: false,
        map: false,
        hot: false,
        seller: false,
        rank: false,
        stock: false
      }
    }
  },
  created () {
    // 在 callBackMapping 中，注册全屏操作的回调函数
    this.$socket.registerCallBack('fullScreen', this.recvData)
    this.$socket.registerCallBack('themeChange', this.recvThemeChange)
  },
  destroyed () {
    // 注册函数的取消
    this.$socket.unRegisterCallBack('fullScreen')
    this.$socket.unRegisterCallBack('themeChange')
  },
  computed: {
    // 左上角图标的图片路径
    logoSrc () {
      return '/static/img/' + getThemeValue(this.theme).logoSrc
    },
    // 标题边框的图片路径
    headerSrc () {
      return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
    },
    // 切换主题图标的图片路径
    themeSrc () {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    // 页面的背景颜色，及字体颜色
    containerStyle () {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor,
      }
    },
    // 将 state 中的值映射为计算属性，参数数组中的值表示的是需要映射出来的 state 中的属性
    ...mapState(['theme'])
  },
  components: {
    Trend,
    Hot,
    Seller,
    Map,
    Stock,
    Rank,
  },
  methods: {
    // 监听图表的全屏/缩小操作事件
    changeSize (chartName) {
      // 1，改变 fullScreenStatus 中的对应数据
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
      // 2，调用这个图表组件中的 screenAdapter 方法进行屏幕大小的适配
      // 直接像下面这样写还是不会产生全屏的效果，因为上面的数据发生改变之后，组件页面开始重绘，
      // 但是还没有重绘完成就调用了 screenAdapter 方法，因此图表来不及对全屏进行自适应
      // this.$refs[chartName].screenAdapter()
      // 应该使用 $nextTick ，传递一个回调函数作为参数
      /* this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      }) */

      // 实现多端联动效果，将数据发送给服务器
      const targetValue = !this.fullScreenStatus[chartName]
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: chartName,
        value: targetValue,
      })
    },
    // 全屏操作的回调函数，用于注册在 callBackMapping 中
    recvData (data) {
      // 取出：是哪一个图标需要切换
      const chartName = data.chartName
      // 取出：需要切换成什么状态
      const targetValue = data.value
      // 1，改变 fullScreenStatus 中的对应数据
      this.fullScreenStatus[chartName] = targetValue
      // 2，调用这个图表组件中的 screenAdapter 方法进行屏幕大小的适配
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })
    },
    // 切换主题事件的处理函数
    handleThemeChange () {
      // 调用 Vuex 中的 mutation 中的方法来修改 theme 数据
      // this.$store.commit('changeTheme')
      // 传递数据给服务端
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: this.theme, // 因为只有两个主题相互切换，所以这里 value 也可以不传递值
      })
    },
    // 主体切换的回调函数，用于注册在 callBackMapping 中
    recvThemeChange () {
      this.$store.commit('changeTheme')
    },
  },
}
</script>
<style lang="less" scoped>
// 全屏图表的样式
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}
.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
}
// 红色边框
// section > div {
//   border: 1px solid skyblue;
// }
</style>
