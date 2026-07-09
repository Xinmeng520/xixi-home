export default defineAppConfig({
  pages: [
    'src/pages/login/index',
    'src/pages/home/index',
    'src/pages/compose/index',
    'src/pages/anniversary/index',
    'src/pages/album/index',
    'src/pages/profile/index'
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
      { pagePath: 'src/pages/home/index', text: '\u9996\u9875' },
      { pagePath: 'src/pages/album/index', text: '\u76f8\u518c' },
      { pagePath: 'src/pages/anniversary/index', text: '\u7eaa\u5ff5\u65e5' },
      { pagePath: 'src/pages/profile/index', text: '\u6211\u7684' }
    ]
  },
  sitemapLocation: 'sitemap.json',
  permission: {}
})
