export default class SocketService {
  /* 
    单例:单例模式也称为单体模式，规定一个类只有一个实例，并且提供可全局访问点
   */
  static instance = null
  static get Instance() { // getter 方法在调用的时候是不需要加上小括号的
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance  // 只要通过 SocketService 访问 instance ，返回的都是同一个 instance
  }

  // 和服务器连接的 socket 对象
  ws = null
  // 用于存储从服务器得到的不同的数据对应要使用的回调函数
  callBackMapping = {}
  // 标识是否连接成功
  isConnect = false
  // 尝试重新发送数据的次数
  sendRetryCount = 0
  // 尝试重新连接服务器的次数
  connectRetryCount = 0

  // 定义连接服务器的方法(这个方法需要在 main.js 文件中调用)
  connect() {
    // 判断当前浏览器是否支持 websocket
    if (!window.WebSocket) {
      return console.log('您的浏览器器不支持 WebSocket ！')
    }
    // 连接服务器
    this.ws = new WebSocket('ws://localhost:9998')
    // 监听连接成功的事件
    this.ws.onopen = () => {
      console.log('连接服务端成功了')
      this.isConnect = true
      // 重置重新连接的次数
      this.connectRetryCount = 0
    }
    // 监听连接失败的事件（1、连接服务器失败的情况   2、连接成功之后，服务器关闭的情况）
    this.ws.onclose =() => {
      console.log('连接服务端失败')
      this.isConnect = false
      // 设置断开重新连接的机制
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.connectRetryCount)
    }
    // 监听 从服务端发送数据过来的事件
    this.ws.onmessage = msg =>{
      console.log('从服务端获取到了数据')
      // 真正从服务端发送过来的数据是在 msg 的 data 字段中，是字符串格式的数据
      // console.log(msg.data)
      const recvData = JSON.parse(msg.data)
      const action = recvData.action
      const socketType = recvData.socketType
      // 判断对应于 socketType 的回调函数是否存在
      if (this.callBackMapping[socketType]) {
        if (action === 'getData') { // 是获取图表数据的操作
          const realData = JSON.parse(recvData.data)
          // 调用对应的回调函数
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') { // 全屏操作
          const value = JSON.parse(recvData.value)
          // 调用对应的回调函数
          this.callBackMapping[socketType].call(this, value)
        } else if (action === 'themeChange') { // 主体切换操作
          const value = JSON.parse(recvData.value)
          // 调用对应的回调函数
          this.callBackMapping[socketType].call(this, value)
        }
      }
    }
  }

  // registerCallBack、unRegisterCallBack、send 这三个方法都是在组件中进行调用的

  // 注册对不同数据所使用的的回调函数是什么
  // 第一个参数： 对应的数据类型    第二个参数： 该数据类型对应的回调函数
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }
  // 取消某一个被注册的回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }
  // 发送数据的方法   参数是一个对象
  send(data) {
    // 直接发送数据的话很可能发送不出去，readyState 为 1 时表示连接成功可以通信了
    console.log(this.ws.readyState)
    // if (this.ws.readyState === 1) {
    //   this.ws.send(JSON.stringify(data))
    // }
    
    // 判断此时此刻有没有连接成功
    if (this.isConnect) { // 连接成功了
      this.sendRetryCount = 0 // 重置尝试重新发送数据的次数
      this.ws.send(JSON.stringify(data))
    } else { // 连接尚未成功的情况    等待一段时间后重新尝试发送请求
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 500)
    }
  }
}