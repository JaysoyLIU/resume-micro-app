// src/app.config.ts
export default {
  pages: [
    'pages/home/index',      // 首页：简历列表
    'pages/profile/index',   // 个人中心
    'pages/template/index',  // 模板选择（从首页跳入）
    'pages/editor/index',    // 简历编辑（核心页）
    'pages/preview/index',   // 预览 + 导出
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#121212',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    custom: true,
    color: '#ffffff',
    selectedColor: '#D02020',
    backgroundColor: '#121212',
    list: [
      { pagePath: 'pages/home/index',    text: '我的简历' },
      { pagePath: 'pages/profile/index', text: '个人中心' },
    ],
  },
}
