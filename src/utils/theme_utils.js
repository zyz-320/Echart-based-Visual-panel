const theme = {
  chalk: {
    // ScreenPage 中的背景颜色
    backgroundColor: '#161522',
    // ScreenPage、Hot 和 Trend 中的文字颜色
    titleColor: '#ffffff',
    // 左上角logo的图标路径
    logoSrc: 'logo_dark.png',
    // 切换主题按钮的图片路径
    themeSrc: 'qiehuan_dark.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_dark.png',
    // Trend 组件中的下拉框的背景颜色
    selectColor: '#222733',
    // Stock 组件库存部分的扇形圆环的颜色
    stockColor: '#333843',
  },
  vintage: {
    // ScreenPage 中的背景颜色
    backgroundColor: '#eeeeee',
    // ScreenPage、Hot 和 Trend 中的文字颜色
    titleColor: '#000000',
    // 左上角logo的图标路径
    logoSrc: 'logo_light2.png',
    // 切换主题按钮的图片路径
    themeSrc: 'qiehuan_light.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_light.png',
    // Trend 组件中的下拉框的背景颜色
    selectColor: '#ffffff',
    // Stock 组件库存部分的扇形圆环的颜色
    stockColor: '#eadeea',
  }
}

export function getThemeValue (themeName) {
  return theme[themeName]
}
