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
    navigationBarTitleText: '熙熙小窝',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fffaf5'
  },
  tabBar: {
    color: '#c4c4c4',
    selectedColor: '#f97316',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'images/tab_home.png', selectedIconPath: 'images/tab_home_active.png' },
      { pagePath: 'pages/album/index', text: '相册', iconPath: 'images/tab_album.png', selectedIconPath: 'images/tab_album_active.png' },
      { pagePath: 'pages/anniversary/index', text: '纪念日', iconPath: 'images/tab_anniversary.png', selectedIconPath: 'images/tab_anniversary_active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'images/tab_profile.png', selectedIconPath: 'images/tab_profile_active.png' }
    ]
  },
  sitemapLocation: 'sitemap.json',
  permission: {}
})
