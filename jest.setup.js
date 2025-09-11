/**
 * Jest 基础环境设置
 * 在所有测试文件执行前运行
 * 主要用于设置全局变量和基础配置
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.TARO_ENV = 'h5'

// 设置时区
process.env.TZ = 'Asia/Shanghai'

// 控制台输出配置
if (process.env.CI) {
  // 在CI环境中减少控制台输出
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: console.warn,
    error: console.error,
  }
}

// 模拟全局对象
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// 模拟 IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// 模拟 ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// 模拟 matchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

// 模拟 window.location
delete window.location
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  replace: jest.fn(),
  assign: jest.fn(),
}

// 模拟 window.history
global.history = {
  length: 1,
  state: null,
  pushState: jest.fn(),
  replaceState: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  go: jest.fn(),
}

// 设置全局错误处理器
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', promise, '原因:', reason)
})

// 模拟 Performance API
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
}

// 模拟 Crypto API
global.crypto = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  },
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },
}

// 模拟 WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 0
    this.CONNECTING = 0
    this.OPEN = 1
    this.CLOSING = 2
    this.CLOSED = 3
  }
  
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true
  }
}

// 模拟 Worker
global.Worker = class MockWorker {
  constructor() {
    this.postMessage = jest.fn()
    this.terminate = jest.fn()
    this.addEventListener = jest.fn()
    this.removeEventListener = jest.fn()
  }
}

// 设置测试工具函数
global.flushPromises = () => new Promise(resolve => setImmediate(resolve))

global.tick = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))

global.nextTick = () => new Promise(resolve => process.nextTick(resolve))

// 模拟滚动行为
global.scrollTo = jest.fn()
global.scrollBy = jest.fn()

// 设置测试模式标志
global.__TEST__ = true
global.__DEV__ = false
global.__PROD__ = false

// 输出测试环境信息
console.log(`
🧪 Jest 测试环境已初始化
📦 环境: ${process.env.NODE_ENV}
🎯 Taro环境: ${process.env.TARO_ENV}
🕐 时区: ${process.env.TZ}
`)