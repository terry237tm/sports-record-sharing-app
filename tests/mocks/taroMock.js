/**
 * Taro API Mock
 * 模拟Taro框架的各种API，用于测试
 */

import { createMockLocation, createMockSystemInfo, createMockUserInfo } from './dataFactory'

/**
 * 模拟Taro的导航API
 */
export const mockNavigationAPI = {
  navigateTo: jest.fn((options) => Promise.resolve({ errMsg: 'navigateTo:ok' })),
  redirectTo: jest.fn((options) => Promise.resolve({ errMsg: 'redirectTo:ok' })),
  switchTab: jest.fn((options) => Promise.resolve({ errMsg: 'switchTab:ok' })),
  navigateBack: jest.fn((options) => Promise.resolve({ errMsg: 'navigateBack:ok' })),
  reLaunch: jest.fn((options) => Promise.resolve({ errMsg: 'reLaunch:ok' }))
}

/**
 * 模拟Taro的存储API
 */
export const mockStorageAPI = {
  setStorage: jest.fn((options) => Promise.resolve({ errMsg: 'setStorage:ok' })),
  getStorage: jest.fn((options) => {
    const mockData = {
      userInfo: createMockUserInfo(),
      token: 'mock-token-' + Date.now(),
      settings: { theme: 'light', language: 'zh-CN' }
    }
    
    return Promise.resolve({
      data: mockData[options.key] || null,
      errMsg: 'getStorage:ok'
    })
  }),
  removeStorage: jest.fn((options) => Promise.resolve({ errMsg: 'removeStorage:ok' })),
  clearStorage: jest.fn(() => Promise.resolve({ errMsg: 'clearStorage:ok' })),
  
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn((key) => {
    const mockData = {
      userInfo: createMockUserInfo(),
      token: 'mock-token-' + Date.now(),
      settings: { theme: 'light', language: 'zh-CN' }
    }
    return mockData[key] || null
  }),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn()
}

/**
 * 模拟Taro的网络请求API
 */
export const mockRequestAPI = {
  request: jest.fn((options) => {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponses = {
          '/api/sport-records': {
            records: [],
            total: 0,
            hasMore: false
          },
          '/api/user/profile': createMockUserInfo(),
          '/api/upload': {
            url: 'https://example.com/uploaded-file.jpg',
            fileId: 'cloud://test-file-id'
          }
        }
        
        const response = mockResponses[options.url] || { data: {}, message: 'success' }
        
        resolve({
          data: response,
          statusCode: 200,
          header: { 'content-type': 'application/json' },
          errMsg: 'request:ok'
        })
      }, Math.random() * 1000 + 100) // 100-1100ms延迟
    })
  }),
  
  downloadFile: jest.fn((options) => Promise.resolve({
    tempFilePath: '/tmp/downloaded-file.jpg',
    statusCode: 200,
    errMsg: 'downloadFile:ok'
  })),
  
  uploadFile: jest.fn((options) => Promise.resolve({
    data: JSON.stringify({ url: 'https://example.com/uploaded-file.jpg' }),
    statusCode: 200,
    errMsg: 'uploadFile:ok'
  }))
}

/**
 * 模拟Taro的用户交互API
 */
export const mockInteractionAPI = {
  showToast: jest.fn((options) => Promise.resolve({ errMsg: 'showToast:ok' })),
  showLoading: jest.fn((options) => Promise.resolve({ errMsg: 'showLoading:ok' })),
  hideLoading: jest.fn(() => Promise.resolve({ errMsg: 'hideLoading:ok' })),
  
  showModal: jest.fn((options) => Promise.resolve({
    confirm: true,
    cancel: false,
    errMsg: 'showModal:ok'
  })),
  
  showActionSheet: jest.fn((options) => Promise.resolve({
    tapIndex: 0,
    errMsg: 'showActionSheet:ok'
  }))
}

/**
 * 模拟Taro的媒体API
 */
export const mockMediaAPI = {
  chooseImage: jest.fn((options) => Promise.resolve({
    tempFilePaths: ['/tmp/test1.jpg', '/tmp/test2.jpg'],
    tempFiles: [
      { path: '/tmp/test1.jpg', size: 1024 },
      { path: '/tmp/test2.jpg', size: 2048 }
    ],
    errMsg: 'chooseImage:ok'
  })),
  
  previewImage: jest.fn((options) => Promise.resolve({ errMsg: 'previewImage:ok' })),
  
  saveImageToPhotosAlbum: jest.fn((options) => Promise.resolve({
    errMsg: 'saveImageToPhotosAlbum:ok'
  }))
}

/**
 * 模拟Taro的位置API
 */
export const mockLocationAPI = {
  getLocation: jest.fn((options) => Promise.resolve({
    ...createMockLocation(),
    speed: 0,
    accuracy: 65,
    verticalAccuracy: 0,
    horizontalAccuracy: 65,
    errMsg: 'getLocation:ok'
  })),
  
  chooseLocation: jest.fn((options) => Promise.resolve({
    ...createMockLocation(),
    name: '天安门广场',
    address: '北京市东城区',
    errMsg: 'chooseLocation:ok'
  }))
}

/**
 * 模拟Taro的系统信息API
 */
export const mockSystemAPI = {
  getSystemInfo: jest.fn(() => Promise.resolve({
    ...createMockSystemInfo(),
    language: 'zh_CN',
    version: '8.0.0',
    platform: 'ios',
    SDKVersion: '2.19.0',
    benchmarkLevel: 1,
    albumAuthorized: true,
    cameraAuthorized: true,
    locationAuthorized: true,
    microphoneAuthorized: true,
    notificationAuthorized: true,
    notificationAlertAuthorized: true,
    notificationBadgeAuthorized: true,
    notificationSoundAuthorized: true,
    phoneCalendarAuthorized: true,
    safeArea: {
      left: 0,
      right: 375,
      top: 44,
      bottom: 778
    },
    errMsg: 'getSystemInfo:ok'
  })),
  
  getSystemInfoSync: jest.fn(() => ({
    ...createMockSystemInfo(),
    language: 'zh_CN',
    version: '8.0.0',
    platform: 'ios',
    SDKVersion: '2.19.0',
    benchmarkLevel: 1,
    safeArea: {
      left: 0,
      right: 375,
      top: 44,
      bottom: 778
    }
  }))
}

/**
 * 模拟Taro的Canvas API
 */
export const mockCanvasAPI = {
  createCanvasContext: jest.fn((canvasId) => ({
    draw: jest.fn((reserve, callback) => {
      if (typeof callback === 'function') callback()
    }),
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
  
  canvasToTempFilePath: jest.fn((options) => Promise.resolve({
    tempFilePath: '/tmp/canvas.png',
    errMsg: 'canvasToTempFilePath:ok'
  }))
}

/**
 * 模拟Taro的云开发API
 */
export const mockCloudAPI = {
  init: jest.fn((config) => {
    console.log('云开发初始化:', config)
  }),
  
  callFunction: jest.fn((options) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults = {
          'getSportRecords': {
            records: [],
            total: 0
          },
          'createSportRecord': {
            _id: 'mock-record-id',
            createdAt: new Date().toISOString()
          },
          'updateSportRecord': {
            updated: 1
          },
          'deleteSportRecord': {
            deleted: 1
          }
        }
        
        const result = mockResults[options.name] || { success: true }
        
        resolve({
          result,
          errMsg: 'cloud.callFunction:ok'
        })
      }, 300)
    })
  }),
  
  database: jest.fn(() => ({
    collection: jest.fn((name) => ({
      doc: jest.fn((id) => ({
        get: jest.fn(() => Promise.resolve({
          data: { _id: id, name: 'test' }
        })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        remove: jest.fn(() => Promise.resolve())
      })),
      get: jest.fn(() => Promise.resolve({
        data: []
      })),
      add: jest.fn(() => Promise.resolve({
        _id: 'mock-id'
      })),
      update: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      count: jest.fn(() => Promise.resolve({
        total: 0
      })),
      orderBy: jest.fn(() => ({})),
      limit: jest.fn(() => ({})),
      skip: jest.fn(() => ({})),
      where: jest.fn(() => ({})),
      field: jest.fn(() => ({}))
    })),
    serverDate: jest.fn(() => new Date())
  })),
  
  uploadFile: jest.fn((options) => Promise.resolve({
    fileID: 'cloud://test-file-id.jpg',
    statusCode: 200,
    errMsg: 'cloud.uploadFile:ok'
  })),
  
  downloadFile: jest.fn((options) => Promise.resolve({
    tempFilePath: '/tmp/downloaded-cloud-file.jpg',
    statusCode: 200,
    errMsg: 'cloud.downloadFile:ok'
  })),
  
  deleteFile: jest.fn((options) => Promise.resolve({
    fileList: options.fileList.map(file => ({
      ...file,
      code: 'SUCCESS'
    })),
    errMsg: 'cloud.deleteFile:ok'
  }))
}

/**
 * 模拟微信小程序API
 */
export const mockWechatAPI = {
  getUserInfo: jest.fn(() => Promise.resolve({
    userInfo: createMockUserInfo(),
    rawData: '{}',
    signature: 'mock-signature',
    encryptedData: 'mock-encrypted-data',
    iv: 'mock-iv',
    errMsg: 'getUserInfo:ok'
  })),
  
  login: jest.fn(() => Promise.resolve({
    code: 'mock-login-code',
    errMsg: 'login:ok'
  })),
  
  checkSession: jest.fn(() => Promise.resolve({
    errMsg: 'checkSession:ok'
  })),
  
  getSetting: jest.fn(() => Promise.resolve({
    authSetting: {
      'scope.userInfo': true,
      'scope.userLocation': true,
      'scope.writePhotosAlbum': true,
      'scope.record': true,
      'scope.camera': true
    },
    errMsg: 'getSetting:ok'
  })),
  
  authorize: jest.fn(() => Promise.resolve({
    errMsg: 'authorize:ok'
  })),
  
  openSetting: jest.fn(() => Promise.resolve({
    authSetting: {
      'scope.userInfo': true,
      'scope.userLocation': true,
      'scope.writePhotosAlbum': true,
      'scope.record': true,
      'scope.camera': true
    },
    errMsg: 'openSetting:ok'
  }))
}

/**
 * 完整的Taro Mock对象
 */
export const mockTaro = {
  // 导航
  ...mockNavigationAPI,
  
  // 存储
  ...mockStorageAPI,
  
  // 网络请求
  ...mockRequestAPI,
  
  // 用户交互
  ...mockInteractionAPI,
  
  // 媒体
  ...mockMediaAPI,
  
  // 位置
  ...mockLocationAPI,
  
  // 系统信息
  ...mockSystemAPI,
  
  // Canvas
  ...mockCanvasAPI,
  
  // 云开发
  cloud: mockCloudAPI,
  
  // 微信小程序API
  ...mockWechatAPI,
  
  // 其他API
  getNetworkType: jest.fn(() => Promise.resolve({
    networkType: 'wifi',
    errMsg: 'getNetworkType:ok'
  })),
  
  onNetworkStatusChange: jest.fn(),
  offNetworkStatusChange: jest.fn(),
  
  // 环境变量
  ENV: {
    USER_DATA_PATH: '/usr'
  },
  
  // 工具函数
  canIUse: jest.fn(() => true)
}

/**
 * 设置Taro Mock
 * 在测试中调用此函数来模拟Taro API
 */
export const setupTaroMock = () => {
  jest.mock('@tarojs/taro', () => mockTaro)
  return mockTaro
}

/**
 * 重置所有Taro Mock
 */
export const resetTaroMock = () => {
  Object.values(mockTaro).forEach(value => {
    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(method => {
        if (typeof method?.mockReset === 'function') {
          method.mockReset()
        }
      })
    } else if (typeof value?.mockReset === 'function') {
      value.mockReset()
    }
  })
}

export default mockTaro
export {
  mockNavigationAPI,
  mockStorageAPI,
  mockRequestAPI,
  mockInteractionAPI,
  mockMediaAPI,
  mockLocationAPI,
  mockSystemAPI,
  mockCanvasAPI,
  mockCloudAPI,
  mockWechatAPI,
  setupTaroMock,
  resetTaroMock
}