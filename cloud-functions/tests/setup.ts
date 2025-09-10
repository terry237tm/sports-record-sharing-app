// 测试环境设置
process.env.NODE_ENV = 'test'
process.env.DEBUG = 'false'

// 全局测试配置
global.console = {
  ...console,
  // 在测试中抑制console.log输出，但保留错误输出
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: jest.fn(),
  debug: jest.fn()
}

// 模拟云开发环境
jest.mock('@cloudbase/node-sdk', () => ({
  init: jest.fn(() => ({
    auth: jest.fn(() => ({
      getUserInfo: jest.fn(() => ({
        openId: 'test-openid',
        appId: 'test-appid'
      }))
    })),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn()
        })),
        add: jest.fn(),
        get: jest.fn(),
        where: jest.fn(() => ({
          get: jest.fn(),
          count: jest.fn(),
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn())),
            skip: jest.fn(() => ({
              limit: jest.fn(() => ({
                get: jest.fn()
              }))
            }))
          }))
        }))
      }))
    })),
    storage: jest.fn(() => ({
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getTempFileURL: jest.fn()
    }))
  })),
  SYMBOL_CURRENT_ENV: 'current-env'
}))

// 全局测试工具函数
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/',
    headers: {},
    body: {},
    query: {},
    params: {},
    ...overrides
  }),

  createMockResponse: () => {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    res.setHeader = jest.fn()
    res.getHeader = jest.fn()
    return res
  },

  createMockNextFunction: () => jest.fn()
}

// 扩展全局类型
declare global {
  var testUtils: {
    createMockRequest: (overrides?: any) => any
    createMockResponse: () => any
    createMockNextFunction: () => jest.Mock
  }
}