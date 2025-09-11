/**
 * 测试工具函数
 * 提供常用的测试辅助函数和工具
 */

/**
 * 等待指定时间
 * @param {number} ms - 等待时间（毫秒）
 * @returns {Promise<void>}
 */
export const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 等待下一个事件循环
 * @returns {Promise<void>}
 */
export const nextTick = () => new Promise(resolve => process.nextTick(resolve))

/**
 * 等待所有Promise完成
 * @returns {Promise<void>}
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve))

/**
 * 模拟用户输入延迟
 * @param {number} ms - 延迟时间
 * @returns {Promise<void>}
 */
export const userTypingDelay = (ms = 50) => wait(ms)

/**
 * 模拟网络请求延迟
 * @param {number} ms - 延迟时间
 * @returns {Promise<void>}
 */
export const networkDelay = (ms = 200) => wait(ms)

/**
 * 创建模拟事件
 * @param {string} type - 事件类型
 * @param {Object} options - 事件选项
 * @returns {Event}
 */
export const createMockEvent = (type, options = {}) => {
  return new Event(type, {
    bubbles: true,
    cancelable: true,
    ...options
  })
}

/**
 * 创建模拟鼠标事件
 * @param {string} type - 事件类型
 * @param {Object} options - 事件选项
 * @returns {MouseEvent}
 */
export const createMockMouseEvent = (type, options = {}) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
    ...options
  })
}

/**
 * 创建模拟键盘事件
 * @param {string} type - 事件类型
 * @param {Object} options - 事件选项
 * @returns {KeyboardEvent}
 */
export const createMockKeyboardEvent = (type, options = {}) => {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    key: '',
    code: '',
    keyCode: 0,
    ...options
  })
}

/**
 * 创建模拟触摸事件
 * @param {string} type - 事件类型
 * @param {Object} options - 事件选项
 * @returns {TouchEvent}
 */
export const createMockTouchEvent = (type, options = {}) => {
  const touch = new Touch({
    identifier: Date.now(),
    target: document.body,
    clientX: 0,
    clientY: 0,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5,
    ...options
  })
  
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [touch],
    targetTouches: [touch],
    changedTouches: [touch],
    ...options
  })
}

/**
 * 创建模拟文件
 * @param {Object} options - 文件选项
 * @returns {File}
 */
export const createMockFile = (options = {}) => {
  const {
    name = 'test.txt',
    size = 1024,
    type = 'text/plain',
    content = 'test content'
  } = options
  
  const blob = new Blob([content], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

/**
 * 创建模拟图片文件
 * @param {Object} options - 图片选项
 * @returns {File}
 */
export const createMockImageFile = (options = {}) => {
  const {
    name = 'test.jpg',
    width = 100,
    height = 100,
    size = 1024,
    type = 'image/jpeg'
  } = options
  
  // 创建一个简单的图片数据URL
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(0, 0, width, height)
  
  const dataURL = canvas.toDataURL(type)
  const byteString = atob(dataURL.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  
  const blob = new Blob([ab], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

/**
 * 模拟地理位置
 * @param {Object} options - 位置选项
 * @returns {Object}
 */
export const createMockLocation = (options = {}) => {
  return {
    latitude: 39.9042,
    longitude: 116.4074,
    accuracy: 65,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: null,
    speed: 0,
    timestamp: Date.now(),
    ...options
  }
}

/**
 * 模拟系统信息
 * @param {Object} options - 系统信息选项
 * @returns {Object}
 */
export const createMockSystemInfo = (options = {}) => {
  return {
    brand: 'iPhone',
    model: 'iPhone 12',
    system: 'iOS 14.0',
    platform: 'ios',
    version: '8.0.0',
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 812,
    statusBarHeight: 44,
    language: 'zh_CN',
    ...options
  }
}

/**
 * 模拟用户信息
 * @param {Object} options - 用户信息选项
 * @returns {Object}
 */
export const createMockUserInfo = (options = {}) => {
  return {
    nickName: '测试用户',
    avatarUrl: '/assets/images/default-avatar.png',
    gender: 1,
    city: '北京市',
    province: '北京市',
    country: '中国',
    language: 'zh_CN',
    ...options
  }
}

/**
 * 模拟运动记录数据
 * @param {Object} options - 运动记录选项
 * @returns {Object}
 */
export const createMockSportRecord = (options = {}) => {
  return {
    _id: `test-record-${Date.now()}`,
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
    ...options
  }
}

/**
 * 模拟网络响应
 * @param {Object} options - 响应选项
 * @returns {Object}
 */
export const createMockResponse = (options = {}) => {
  const {
    data = {},
    statusCode = 200,
    header = {},
    cookies = [],
    errMsg = 'request:ok'
  } = options
  
  return {
    data,
    statusCode,
    header,
    cookies,
    errMsg
  }
}

/**
 * 模拟API错误响应
 * @param {Object} options - 错误选项
 * @returns {Error}
 */
export const createMockError = (options = {}) => {
  const {
    message = '请求失败',
    code = 'REQUEST_ERROR',
    status = 500
  } = options
  
  const error = new Error(message)
  error.code = code
  error.status = status
  return error
}

/**
 * 验证函数调用参数
 * @param {Function} mockFn - mock函数
 * @param {number} callIndex - 调用索引
 * @param {Array} expectedArgs - 期望的参数
 */
export const expectCalledWith = (mockFn, callIndex = 0, ...expectedArgs) => {
  expect(mockFn).toHaveBeenCalled()
  expect(mockFn.mock.calls[callIndex]).toEqual(expectedArgs)
}

/**
 * 验证函数调用次数
 * @param {Function} mockFn - mock函数
 * @param {number} expectedTimes - 期望的调用次数
 */
export const expectCalledTimes = (mockFn, expectedTimes) => {
  expect(mockFn).toHaveBeenCalledTimes(expectedTimes)
}

/**
 * 模拟异步函数
 * @param {any} returnValue - 返回值
 * @param {number} delay - 延迟时间
 * @returns {Function}
 */
export const createAsyncMock = (returnValue = null, delay = 100) => {
  return jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      setTimeout(() => resolve(returnValue), delay)
    })
  })
}

/**
 * 模拟同步函数
 * @param {any} returnValue - 返回值
 * @returns {Function}
 */
export const createSyncMock = (returnValue = null) => {
  return jest.fn().mockReturnValue(returnValue)
}

/**
 * 重置所有mock函数
 * @param {Object} mocks - mock对象
 */
export const resetAllMocks = (mocks) => {
  Object.values(mocks).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset()
    }
  })
}

/**
 * 清除所有mock函数
 * @param {Object} mocks - mock对象
 */
export const clearAllMocks = (mocks) => {
  Object.values(mocks).forEach(mock => {
    if (typeof mock.mockClear === 'function') {
      mock.mockClear()
    }
  })
}

/**
 * 恢复所有mock函数
 * @param {Object} mocks - mock对象
 */
export const restoreAllMocks = (mocks) => {
  Object.values(mocks).forEach(mock => {
    if (typeof mock.mockRestore === 'function') {
      mock.mockRestore()
    }
  })
}

/**
 * 测试工具函数导出
 */
export default {
  wait,
  nextTick,
  flushPromises,
  userTypingDelay,
  networkDelay,
  createMockEvent,
  createMockMouseEvent,
  createMockKeyboardEvent,
  createMockTouchEvent,
  createMockFile,
  createMockImageFile,
  createMockLocation,
  createMockSystemInfo,
  createMockUserInfo,
  createMockSportRecord,
  createMockResponse,
  createMockError,
  expectCalledWith,
  expectCalledTimes,
  createAsyncMock,
  createSyncMock,
  resetAllMocks,
  clearAllMocks,
  restoreAllMocks
}