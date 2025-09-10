export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/sports/index',
    'pages/sports/detail',
    'pages/share/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '运动记录分享',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/sports/index',
        text: '运动',
        iconPath: 'assets/icons/sport.png',
        selectedIconPath: 'assets/icons/sport-active.png'
      },
      {
        pagePath: 'pages/share/index',
        text: '分享',
        iconPath: 'assets/icons/share.png',
        selectedIconPath: 'assets/icons/share-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
})