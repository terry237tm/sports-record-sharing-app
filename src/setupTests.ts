/**
 * React组件测试环境设置
 * 为React组件测试提供额外的配置和工具
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// 配置 Testing Library
configure({
  testIdAttribute: 'data-testid', // 默认的测试ID属性
  computedStyleSupportsPseudoElements: true,
  throwSuggestions: true, // 提供有用的查询建议
})

// 扩展Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toBeHidden(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveClass(className: string): R
      toHaveStyle(style: Record<string, any>): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
      toHaveFocus(): R
    }
  }
}

// 模拟React组件常用的全局对象
Object.defineProperty(window, 'getComputedStyle', {
  value: (element: Element) => ({
    getPropertyValue: (prop: string) => {
      const styles: Record<string, string> = {
        'display': 'block',
        'visibility': 'visible',
        'opacity': '1',
        'position': 'static',
        'transform': 'none',
        'transition': 'none',
        'animation': 'none',
      }
      return styles[prop] || ''
    }
  })
})

// 模拟IntersectionObserver - 用于懒加载等场景
class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  elements: Element[] = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    this.elements.push(element)
    // 立即触发回调，模拟元素可见
    this.callback([{
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRect: element.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now()
    }], this as any)
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter(el => el !== element)
  }

  disconnect() {
    this.elements = []
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

global.IntersectionObserver = MockIntersectionObserver as any

// 模拟ResizeObserver - 用于响应式组件
class MockResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    // 立即触发回调，提供默认尺寸
    this.callback([{
      target,
      contentRect: {
        x: 0,
        y: 0,
        width: 375,
        height: 667,
        top: 0,
        right: 375,
        bottom: 667,
        left: 0,
        toJSON: () => ({})
      },
      borderBoxSize: [{ inlineSize: 375, blockSize: 667 }],
      contentBoxSize: [{ inlineSize: 375, blockSize: 667 }],
      devicePixelContentBoxSize: [{ inlineSize: 375, blockSize: 667 }]
    }], this as any)
  }

  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as any

// 模拟matchMedia - 用于响应式测试
global.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

// 模拟滚动行为
global.scrollTo = jest.fn()
global.scrollBy = jest.fn()

// 模拟requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as any
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// 模拟Web Animations API
global.Animation = class MockAnimation {
  play() { return this }
  pause() { return this }
  cancel() { return this }
  finish() { return this }
  reverse() { return this }
  addEventListener() { return this }
  removeEventListener() { return this }
  dispatchEvent() { return true }
  
  currentTime = 0
  playState = 'finished' as AnimationPlayState
  effect = null
  id = ''
  onfinish = null
  oncancel = null
  pending = false
  ready = Promise.resolve(this)
  finished = Promise.resolve(this)
} as any

// 扩展Element原型 - 添加常用方法
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
  configurable: true,
})

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: () => ({
    width: 375,
    height: 667,
    top: 0,
    left: 0,
    right: 375,
    bottom: 667,
    x: 0,
    y: 0,
    toJSON: () => ({})
  }),
  writable: true,
  configurable: true,
})

// 模拟文件API
global.File = class MockFile {
  name: string
  size: number
  type: string
  lastModified: number

  constructor(bits: any[], name: string, options?: FilePropertyBag) {
    this.name = name
    this.size = bits.reduce((size, bit) => size + (bit?.length || 0), 0)
    this.type = options?.type || ''
    this.lastModified = options?.lastModified || Date.now()
  }

  slice() {
    return this
  }

  stream() {
    return new ReadableStream()
  }

  text() {
    return Promise.resolve('')
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0))
  }
} as any

global.FileList = class MockFileList {
  length = 0
  item = jest.fn()
  
  [index: number]: File
} as any

// 模拟拖拽事件
global.DataTransfer = class MockDataTransfer {
  dropEffect = 'none'
  effectAllowed = 'all'
  files = new FileList()
  items: DataTransferItem[] = []
  types: string[] = []
  
  clearData() {}
  getData() { return '' }
  setData() {}
  setDragImage() {}
} as any

global.DataTransferItem = class MockDataTransferItem {
  kind = 'string' as DataTransferItemKind
  type = ''
  
  getAsFile() { return null }
  getAsString(callback?: FunctionStringCallback) {
    if (callback) callback('')
  }
  webkitGetAsEntry() { return null }
} as any

// 自定义查询工具函数
global.queryByRole = (role: string, options?: any) => {
  return document.querySelector(`[role="${role}"]`)
}

global.queryAllByRole = (role: string, options?: any) => {
  return document.querySelectorAll(`[role="${role}"]`)
}

// 模拟localStorage事件
const originalLocalStorage = window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    ...originalLocalStorage,
    setItem: jest.fn((key: string, value: string) => {
      // 触发存储事件
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: value,
        oldValue: originalLocalStorage.getItem(key),
        storageArea: window.localStorage
      }))
    }),
    getItem: jest.fn(),
    removeItem: jest.fn((key: string) => {
      // 触发存储事件
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: null,
        oldValue: originalLocalStorage.getItem(key),
        storageArea: window.localStorage
      }))
    }),
    clear: jest.fn(),
  },
  writable: true,
})

// 错误边界模拟
global.ErrorBoundary = class MockErrorBoundary {
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('捕获到错误:', error, errorInfo)
  }
  
  render() {
    return null
  }
}

// 控制台错误过滤 - 减少测试中的噪音
const originalError = console.error
console.error = (...args: any[]) => {
  // 过滤掉常见的React警告
  const errorMessagesToIgnore = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: componentWillMount has been renamed',
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillUpdate has been renamed',
  ]
  
  const shouldIgnore = errorMessagesToIgnore.some(msg => 
    args.some(arg => typeof arg === 'string' && arg.includes(msg))
  )
  
  if (!shouldIgnore) {
    originalError.apply(console, args)
  }
}

// 全局测试工具函数
global.waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  const timeout = options?.timeout || 1000
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      callback()
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  // 最后一次尝试，如果失败则抛出错误
  callback()
}

global.flushPromises = () => new Promise(resolve => setImmediate(resolve))

console.log('📦 React组件测试环境已初始化')