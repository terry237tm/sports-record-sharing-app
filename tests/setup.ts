/**
 * Jest 测试环境设置
 * 在所有测试文件执行前运行
 */

import '@testing-library/jest-dom'

// 模拟 Taro API
jest.mock('@tarojs/taro', () => ({
  // 导航相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  
  // 系统信息
  getSystemInfo: jest.fn(() => Promise.resolve({
    platform: 'ios',
    system: 'iOS 14.0',
    version: '8.0.0',
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 812,
    statusBarHeight: 44,
    safeArea: {
      left: 0,
      right: 375,
      top: 44,
      bottom: 778
    }
  })),
  
  getSystemInfoSync: jest.fn(() => ({
    platform: 'ios',
    system: 'iOS 14.0',
    version: '8.0.0',
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 812,
    statusBarHeight: 44,
    safeArea: {
      left: 0,
      right: 375,
      top: 44,
      bottom: 778
    }
  })),
  
  // 存储相关
  setStorage: jest.fn(() => Promise.resolve()),
  getStorage: jest.fn(() => Promise.resolve({ data: null })),
  removeStorage: jest.fn(() => Promise.resolve()),
  clearStorage: jest.fn(() => Promise.resolve()),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(() => null),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  
  // 网络请求
  request: jest.fn(() => Promise.resolve({ data: {}, statusCode: 200 })),
  downloadFile: jest.fn(() => Promise.resolve({ tempFilePath: '/tmp/test.jpg' })),
  uploadFile: jest.fn(() => Promise.resolve({ data: '{}', statusCode: 200 })),
  
  // 用户交互
  showToast: jest.fn(() => Promise.resolve()),
  showLoading: jest.fn(() => Promise.resolve()),
  hideLoading: jest.fn(() => Promise.resolve()),
  showModal: jest.fn(() => Promise.resolve({ confirm: true, cancel: false })),
  showActionSheet: jest.fn(() => Promise.resolve({ tapIndex: 0 })),
  
  // 媒体相关
  chooseImage: jest.fn(() => Promise.resolve({
    tempFilePaths: ['/tmp/test1.jpg', '/tmp/test2.jpg'],
    tempFiles: [
      { path: '/tmp/test1.jpg', size: 1024 },
      { path: '/tmp/test2.jpg', size: 2048 }
    ]
  })),
  previewImage: jest.fn(() => Promise.resolve()),
  saveImageToPhotosAlbum: jest.fn(() => Promise.resolve()),
  
  // 位置相关
  getLocation: jest.fn(() => Promise.resolve({
    latitude: 39.9042,
    longitude: 116.4074,
    speed: 0,
    accuracy: 65,
    altitude: 0,
    verticalAccuracy: 0,
    horizontalAccuracy: 65
  })),
  chooseLocation: jest.fn(() => Promise.resolve({
    latitude: 39.9042,
    longitude: 116.4074,
    name: '天安门广场',
    address: '北京市东城区'
  })),
  
  // 设备相关
  getNetworkType: jest.fn(() => Promise.resolve({ networkType: 'wifi' })),
  onNetworkStatusChange: jest.fn(),
  offNetworkStatusChange: jest.fn(),
  
  // 画布相关
  createCanvasContext: jest.fn(() => ({
    draw: jest.fn(),
    fillText: jest.fn(),
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    setFillStyle: jest.fn(),
    setStrokeStyle: jest.fn(),
    setFontSize: jest.fn(),
    setGlobalAlpha: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 }))
  })),
  canvasToTempFilePath: jest.fn(() => Promise.resolve({ tempFilePath: '/tmp/canvas.png' })),
  
  // 云开发相关
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn(() => Promise.resolve({ result: {} })),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ data: {} })),
          set: jest.fn(() => Promise.resolve()),
          update: jest.fn(() => Promise.resolve()),
          remove: jest.fn(() => Promise.resolve())
        })),
        get: jest.fn(() => Promise.resolve({ data: [] })),
        add: jest.fn(() => Promise.resolve({ _id: 'test-id' })),
        update: jest.fn(() => Promise.resolve()),
        remove: jest.fn(() => Promise.resolve()),
        count: jest.fn(() => Promise.resolve({ total: 0 })),
        orderBy: jest.fn(() => ({})),
        limit: jest.fn(() => ({})),
        skip: jest.fn(() => ({})),
        where: jest.fn(() => ({})),
        field: jest.fn(() => ({}))
      })),
      serverDate: jest.fn(() => new Date())
    })),
    uploadFile: jest.fn(() => Promise.resolve({
      fileID: 'cloud://test.jpg',
      statusCode: 200
    })),
    downloadFile: jest.fn(() => Promise.resolve({
      tempFilePath: '/tmp/cloud.jpg',
      statusCode: 200
    })),
    deleteFile: jest.fn(() => Promise.resolve({
      fileList: [{ fileID: 'cloud://test.jpg', code: 'SUCCESS' }]
    }))
  },
  
  // 环境变量
  ENV: {
    USER_DATA_PATH: '/usr'
  },
  
  // 常量
  canIUse: jest.fn(() => true)
}))

// 模拟 Taro UI
jest.mock('taro-ui', () => ({
  AtButton: 'AtButton',
  AtInput: 'AtInput',
  AtForm: 'AtForm',
  AtList: 'AtList',
  AtListItem: 'AtListItem',
  AtCard: 'AtCard',
  AtAvatar: 'AtAvatar',
  AtTag: 'AtTag',
  AtGrid: 'AtGrid',
  AtIcon: 'AtIcon',
  AtTabs: 'AtTabs',
  AtTabsPane: 'AtTabsPane',
  AtModal: 'AtModal',
  AtModalHeader: 'AtModalHeader',
  AtModalContent: 'AtModalContent',
  AtModalAction: 'AtModalAction',
  AtActionSheet: 'AtActionSheet',
  AtActionSheetItem: 'AtActionSheetItem',
  AtToast: 'AtToast',
  AtProgress: 'AtProgress',
  AtSlider: 'AtSlider',
  AtSwitch: 'AtSwitch',
  AtRadio: 'AtRadio',
  AtCheckbox: 'AtCheckbox',
  AtRate: 'AtRate',
  AtInputNumber: 'AtInputNumber',
  AtTextarea: 'AtTextarea',
  AtImagePicker: 'AtImagePicker',
  AtSearchBar: 'AtSearchBar',
  AtDivider: 'AtDivider',
  AtCurtain: 'AtCurtain',
  AtNoticebar: 'AtNoticebar',
  AtTimeline: 'AtTimeline',
  AtSwipeAction: 'AtSwipeAction',
  AtFloatLayout: 'AtFloatLayout',
  AtAccordion: 'AtAccordion',
  AtDrawer: 'AtDrawer'
}))

// 模拟微信小程序 API
Object.defineProperty(global, 'wx', {
  value: {
    ...jest.requireMock('@tarojs/taro'),
    getUserInfo: jest.fn(() => Promise.resolve({
      userInfo: {
        nickName: '测试用户',
        avatarUrl: '/assets/images/default-avatar.png',
        gender: 1,
        city: '北京',
        province: '北京',
        country: '中国',
        language: 'zh_CN'
      }
    })),
    login: jest.fn(() => Promise.resolve({ code: 'test-code' })),
    checkSession: jest.fn(() => Promise.resolve()),
    getSetting: jest.fn(() => Promise.resolve({
      authSetting: {
        'scope.userInfo': true,
        'scope.userLocation': true,
        'scope.writePhotosAlbum': true
      }
    })),
    authorize: jest.fn(() => Promise.resolve()),
    openSetting: jest.fn(() => Promise.resolve())
  },
  writable: true
})

// 模拟地理位置
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: {
      getCurrentPosition: jest.fn((success, error) => {
        success({
          coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 65,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: null,
            speed: 0
          },
          timestamp: Date.now()
        })
      })
    }
  },
  writable: true
})

// 模拟 Canvas
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class MockHTMLCanvasElement {
    getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Array(4) })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn()
    }))
    toDataURL = jest.fn(() => 'data:image/png;base64,mock-data-url')
  },
  writable: true
})

// 模拟 FileReader
Object.defineProperty(global, 'FileReader', {
  value: class MockFileReader {
    readAsDataURL = jest.fn(function(file: File) {
      setTimeout(() => {
        this.result = 'data:image/jpeg;base64,mock-base64-data'
        this.onloadend && this.onloadend({ target: this } as any)
      }, 100)
    })
    result = null
    onloadend = null
  },
  writable: true
})

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
})

// 设置测试超时
jest.setTimeout(10000)

// 全局测试工具函数
global.testUtils = {
  // 创建模拟的运动记录
  createMockSportRecord: (overrides = {}) => ({
    _id: 'test-record-id',
    openid: 'test-openid',
    sportType: 'running',
    data: {
      duration: 30,
      distance: 5.2,
      calories: 300,
      heartRate: 120,
      steps: 5200
    },
    images: ['/tmp/test1.jpg', '/tmp/test2.jpg'],
    description: '今天跑步感觉很棒！',
    location: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市东城区天安门广场',
      city: '北京市',
      district: '东城区'
    },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    isDeleted: false,
    ...overrides
  }),
  
  // 创建模拟的用户信息
  createMockUserInfo: (overrides = {}) => ({
    openid: 'test-openid',
    nickname: '测试用户',
    avatar: '/assets/images/default-avatar.png',
    gender: 1,
    city: '北京市',
    province: '北京市',
    country: '中国',
    language: 'zh_CN',
    ...overrides
  }),
  
  // 创建模拟的分享数据
  createMockShareImageData: (overrides = {}) => ({
    userInfo: {
      avatar: '/assets/images/default-avatar.png',
      nickname: '测试用户'
    },
    sportRecord: {
      sportType: '跑步',
      sportTypeIcon: '🏃‍♂️',
      data: {
        duration: 30,
        distance: 5.2,
        calories: 300
      },
      description: '今天跑步感觉很棒！',
      location: '北京市东城区天安门广场',
      createdAt: '2024-01-01 10:00'
    },
    images: ['/tmp/test1.jpg'],
    ...overrides
  }),
  
  // 等待异步操作
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 模拟文件上传
  mockFileUpload: (file: File) => Promise.resolve({
    url: 'https://example.com/uploaded-file.jpg',
    filename: file.name,
    size: file.size,
    type: file.type
  }),
  
  // 模拟地理位置
  mockLocation: () => ({
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市东城区天安门广场',
    city: '北京市',
    district: '东城区'
  })
}

// 扩展全局类型
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockSportRecord: (overrides?: any) => any
        createMockUserInfo: (overrides?: any) => any
        createMockShareImageData: (overrides?: any) => any
        wait: (ms?: number) => Promise<void>
        mockFileUpload: (file: File) => Promise<any>
        mockLocation: () => any
      }
      wx: any
      HTMLCanvasElement: any
      FileReader: any
      localStorage: any
      sessionStorage: any
    }
  }
}

export {} // 确保这是一个模块文件