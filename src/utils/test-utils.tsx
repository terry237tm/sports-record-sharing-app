/**
 * 组件测试工具函数
 * 提供React Testing Library的自定义渲染器和测试辅助函数
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/store'
import type { AppStore, RootState } from '@/store'

/**
 * 创建测试用的Redux store
 */
export function createTestStore(preloadedState?: Partial<RootState>): AppStore {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}

/**
 * 自定义渲染函数，自动包装Redux Provider
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult & { store: AppStore } {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

/**
 * 等待异步操作完成的工具函数
 */
export async function waitForAsyncOperations(timeout = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  await new Promise(resolve => setImmediate(resolve))
}

/**
 * 模拟Taro组件的props
 */
export function mockTaroComponentProps<T extends Record<string, any>>(
  componentName: string,
  defaultProps: T
): T {
  return {
    ...defaultProps,
    className: `mock-${componentName}`,
    style: {},
    onClick: jest.fn(),
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
    onTouchMove: jest.fn()
  }
}

/**
 * 创建模拟的Taro页面实例
 */
export function createMockPageInstance() {
  return {
    route: 'pages/test/index',
    options: {},
    data: {},
    setData: jest.fn(),
    onLoad: jest.fn(),
    onShow: jest.fn(),
    onHide: jest.fn(),
    onUnload: jest.fn(),
    onPullDownRefresh: jest.fn(),
    onReachBottom: jest.fn()
  }
}

/**
 * 模拟用户交互事件
 */
export function createMockUserEvent() {
  return {
    click: (element: HTMLElement) => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      element.dispatchEvent(clickEvent)
    },
    
    input: (element: HTMLInputElement, value: string) => {
      const inputEvent = new Event('input', { bubbles: true })
      element.value = value
      element.dispatchEvent(inputEvent)
    },
    
    submit: (element: HTMLFormElement) => {
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      })
      element.dispatchEvent(submitEvent)
    }
  }
}

/**
 * 模拟媒体设备
 */
export function mockMediaDevices() {
  const mockGetUserMedia = jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn()
    }]
  })

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: mockGetUserMedia,
      enumerateDevices: jest.fn().mockResolvedValue([
        { kind: 'videoinput', label: '摄像头1', deviceId: 'camera1' },
        { kind: 'audioinput', label: '麦克风1', deviceId: 'mic1' }
      ])
    },
    writable: true,
    configurable: true
  })

  return mockGetUserMedia
}

/**
 * 模拟地理位置
 */
export function mockGeolocation() {
  const mockGetCurrentPosition = jest.fn((success, error, options) => {
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

  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: mockGetCurrentPosition,
      watchPosition: jest.fn(() => 1),
      clearWatch: jest.fn()
    },
    writable: true,
    configurable: true
  })

  return mockGetCurrentPosition
}

/**
 * 模拟文件上传
 */
export function mockFileUpload(file: File) {
  return Promise.resolve({
    url: `https://example.com/uploaded/${file.name}`,
    filename: file.name,
    size: file.size,
    type: file.type
  })
}

/**
 * 创建测试文件
 */
export function createTestFile(name = 'test.jpg', type = 'image/jpeg', size = 1024): File {
  const blob = new Blob([new ArrayBuffer(size)], { type })
  return new File([blob], name, { type })
}

/**
 * 等待指定的毫秒数
 */
export function wait(ms = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待下一个事件循环
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve))
}

/**
 * 模拟异步API调用
 */
export function mockAsyncApi<T>(data: T, delay = 100): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * 生成唯一的测试ID
 */
export function generateTestId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 模拟错误响应
 */
export function createMockError(message = '测试错误', code = 'TEST_ERROR'): Error {
  const error = new Error(message)
  ;(error as any).code = code
  return error
}

/**
 * 测试断言工具
 */
export const testAssertions = {
  /**
   * 断言元素存在且可见
   */
  toBeVisible(element: HTMLElement | null): void {
    expect(element).toBeInTheDocument()
    expect(element).toBeVisible()
  },

  /**
   * 断言元素包含特定文本
   */
  toContainText(element: HTMLElement | null, text: string): void {
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent(text)
  },

  /**
   * 断言元素具有特定类名
   */
  toHaveClass(element: HTMLElement | null, className: string): void {
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass(className)
  },

  /**
   * 断言函数被调用
   */
  toBeCalled(mockFn: jest.Mock, times = 1): void {
    expect(mockFn).toHaveBeenCalledTimes(times)
  },

  /**
   * 断言函数被调用并返回特定值
   */
  toBeCalledWith(mockFn: jest.Mock, ...args: any[]): void {
    expect(mockFn).toHaveBeenCalledWith(...args)
  }
}

/**
 * 重新导出所有React Testing Library的工具函数
 */
export * from '@testing-library/react'

/**
 * 默认导出自定义渲染函数
 */
export { renderWithProviders as render }