/**
 * CloudBase 服务测试
 * 测试云函数调用和文件上传功能
 */

import { cloudbaseService } from '../cloudbase'

// Mock 全局对象
global.fetch = jest.fn()
global.document = {
  createElement: jest.fn(),
  head: {
    appendChild: jest.fn()
  }
} as any

// Mock window对象
const mockWindow = {
  cloudbase: {
    init: jest.fn(),
    callFunction: jest.fn(),
    uploadFile: jest.fn()
  }
}

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
})

describe('CloudbaseService', () => {
  let mockApp: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // 创建模拟的CloudBase应用实例
    mockApp = {
      callFunction: jest.fn(),
      uploadFile: jest.fn()
    }
    
    // Mock cloudbase.init
    mockWindow.cloudbase.init.mockReturnValue(mockApp)
  })

  describe('callFunction', () => {
    it('应该成功调用云函数', async () => {
      const mockResponse = {
        result: {
          code: 0,
          data: { message: '成功' },
          message: '操作成功'
        }
      }
      mockApp.callFunction.mockResolvedValue(mockResponse)

      const result = await cloudbaseService.callFunction('testFunction', { test: 'data' })

      expect(result).toEqual({
        success: true,
        data: { message: '成功' },
        message: '操作成功'
      })
      expect(mockApp.callFunction).toHaveBeenCalledWith({
        name: 'testFunction',
        data: { test: 'data' }
      })
    })

    it('应该处理云函数返回错误', async () => {
      const mockResponse = {
        result: {
          code: -1,
          message: '函数执行错误'
        }
      }
      mockApp.callFunction.mockResolvedValue(mockResponse)

      const result = await cloudbaseService.callFunction('testFunction', {})

      expect(result).toEqual({
        success: false,
        message: '函数执行错误',
        data: null
      })
    })

    it('应该处理云函数调用异常', async () => {
      mockApp.callFunction.mockRejectedValue(new Error('网络错误'))

      const result = await cloudbaseService.callFunction('testFunction', {})

      expect(result).toEqual({
        success: false,
        message: '网络错误',
        data: null
      })
    })

    it('应该使用模拟数据当SDK不可用时', async () => {
      // Mock SDK不可用
      Object.defineProperty(global, 'window', { value: undefined, writable: true })

      const result = await cloudbaseService.callFunction('loginUser', {})

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('userInfo')
      expect(result.data.userInfo).toHaveProperty('openid')
    })
  })

  describe('uploadFile', () => {
    it('应该成功上传文件', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const mockUploadResponse = {
        fileID: 'cloud://test-env/test/path/file.jpg'
      }
      mockApp.uploadFile.mockResolvedValue(mockUploadResponse)

      const result = await cloudbaseService.uploadFile(mockFile, 'test/path/file.jpg')

      expect(result).toEqual({
        success: true,
        data: {
          fileID: 'cloud://test-env/test/path/file.jpg',
          fileUrl: 'cloud://test-env/test/path/file.jpg'
        },
        message: '上传成功'
      })
      expect(mockApp.uploadFile).toHaveBeenCalledWith({
        cloudPath: 'test/path/file.jpg',
        filePath: mockFile
      })
    })

    it('应该处理上传失败', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      mockApp.uploadFile.mockResolvedValue({}) // 没有fileID

      const result = await cloudbaseService.uploadFile(mockFile, 'test/path/file.jpg')

      expect(result).toEqual({
        success: false,
        message: '上传失败',
        data: null
      })
    })

    it('应该处理上传异常', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      mockApp.uploadFile.mockRejectedValue(new Error('上传网络错误'))

      const result = await cloudbaseService.uploadFile(mockFile, 'test/path/file.jpg')

      expect(result).toEqual({
        success: false,
        message: '上传网络错误',
        data: null
      })
    })

    it('应该使用模拟上传数据当SDK不可用时', async () => {
      // Mock SDK不可用
      Object.defineProperty(global, 'window', { value: undefined, writable: true })

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await cloudbaseService.uploadFile(mockFile, 'test/path/file.jpg')

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('fileID')
      expect(result.data).toHaveProperty('fileUrl')
      expect(result.message).toContain('模拟上传成功')
    })

    it('应该在开发环境使用模拟数据当上传失败', async () => {
      // Mock开发环境
      process.env.NODE_ENV = 'development'
      
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      mockApp.uploadFile.mockRejectedValue(new Error('上传失败'))

      const result = await cloudbaseService.uploadFile(mockFile, 'test/path/file.jpg')

      expect(result.success).toBe(true)
      expect(result.message).toContain('模拟上传成功')
      
      // 恢复环境
      process.env.NODE_ENV = 'test'
    })
  })

  describe('createSportRecord 模拟数据', () => {
    it('应该返回正确的模拟运动记录数据', async () => {
      // Mock SDK不可用以触发模拟数据
      Object.defineProperty(global, 'window', { value: undefined, writable: true })

      const result = await cloudbaseService.callFunction('createSportRecord', {
        sportType: 'running',
        data: { duration: 30, calories: 200 },
        images: ['image1.jpg'],
        description: 'Test run',
        location: { name: 'Test Park' }
      })

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        _id: expect.stringContaining('mock_sport_record_'),
        sportType: 'running',
        data: { duration: 30, calories: 200 },
        images: ['image1.jpg'],
        description: 'Test run',
        location: { name: 'Test Park' }
      })
      expect(result.message).toBe('运动记录创建成功')
    })
  })

  describe('getSportRecords 模拟数据', () => {
    it('应该返回正确的模拟运动记录列表数据', async () => {
      // Mock SDK不可用以触发模拟数据
      Object.defineProperty(global, 'window', { value: undefined, writable: true })

      const result = await cloudbaseService.callFunction('getSportRecords', {
        page: 1,
        pageSize: 10
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        list: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: false
      })
      expect(result.message).toBe('获取运动记录列表成功')
    })
  })

  describe('工具函数', () => {
    describe('isCloudBaseReady', () => {
      it('应该正确检测CloudBase SDK是否就绪', () => {
        const { isCloudBaseReady } = require('../cloudbase')
        
        // SDK可用
        Object.defineProperty(global, 'window', { value: mockWindow, writable: true })
        expect(isCloudBaseReady()).toBe(true)

        // SDK不可用
        Object.defineProperty(global, 'window', { value: {}, writable: true })
        expect(isCloudBaseReady()).toBe(false)
      })
    })

    describe('getEnvironmentInfo', () => {
      it('应该正确获取环境信息', () => {
        const { getEnvironmentInfo } = require('../cloudbase')
        
        // Mock微信小程序环境
        process.env.TARO_ENV = 'weapp'
        expect(getEnvironmentInfo()).toBe('微信小程序环境')

        // MockH5环境
        process.env.TARO_ENV = 'h5'
        expect(getEnvironmentInfo()).toBe('H5 网页环境')

        // Mock其他环境
        process.env.TARO_ENV = 'other'
        expect(getEnvironmentInfo()).toBe('未知环境')
      })
    })

    describe('getCloudBaseConfig', () => {
      it('应该正确获取CloudBase配置', () => {
        const { getCloudBaseConfig } = require('../cloudbase')
        
        Object.defineProperty(global, 'window', { value: mockWindow, writable: true })
        const config = getCloudBaseConfig()

        expect(config).toHaveProperty('env')
        expect(config).toHaveProperty('region')
        expect(config).toHaveProperty('helloUrl')
        expect(config).toHaveProperty('isReady')
        expect(config.isReady).toBe(true)
      })
    })
  })
})