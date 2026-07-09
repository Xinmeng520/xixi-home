export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/compose/index',
    'pages/anniversary/index',
    'pages/album/index',
    'pages/profile/index',
    'pages/edit-post/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '\u7199\u7199\u5c0f\u7a9d',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fffaf5'
  },
  tabBar: {
    color: '#c4c4c4',
    selectedColor: '#f97316',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '\u9996\u9875' },
      { pagePath: 'pages/album/index', text: '\u76f8\u518c' },
      { pagePath: 'pages/anniversary/index', text: '\u7eaa\u5ff5\u65e5' },
      { pagePath: 'pages/profile/index', text: '\u6211\u7684' }
    ]
  },
  sitemapLocation: 'sitemap.json',
  permission: {}
})