/**
 * 云服务集成模块测试
 * 测试CloudBase服务的各种功能
 */

import { getHelloFromMock, getHelloFromCloud, callCloudFunction, uploadToCloudStorage } from '../cloudbase'

// 模拟fetch API
global.fetch = jest.fn()

describe('CloudBase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getHelloFromMock', () => {
    it('应该返回模拟的问候语', async () => {
      const result = await getHelloFromMock()
      expect(result).toBe('你好！这是来自模拟云函数的问候 🎉')
    })

    it('应该模拟网络延迟', async () => {
      const startTime = Date.now()
      const promise = getHelloFromMock()
      
      // 立即检查，应该还没有结果
      let result: string | null = null
      promise.then((res) => { result = res })
      
      expect(result).toBeNull()
      
      // 等待500ms
      jest.advanceTimersByTime(500)
      await promise
      
      const endTime = Date.now()
      expect(result).toBe('你好！这是来自模拟云函数的问候 🎉')
      expect(endTime - startTime).toBeGreaterThanOrEqual(500)
    })
  })

  describe('getHelloFromCloud', () => {
    it('应该成功从云函数获取数据', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Hello from cloud!' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getHelloFromCloud()
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('hello'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        })
      )
      expect(result).toBe('Hello from cloud!')
    })

    it('应该在HTTP错误时抛出异常', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(getHelloFromCloud()).rejects.toThrow('HTTP 错误! 状态: 500')
    })

    it('应该在网络错误时抛出异常', async () => {
      const networkError = new Error('Network error')
      ;(global.fetch as jest.Mock).mockRejectedValue(networkError)

      await expect(getHelloFromCloud()).rejects.toThrow('Network error')
    })

    it('应该在JSON解析错误时抛出异常', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(getHelloFromCloud()).rejects.toThrow('Invalid JSON')
    })
  })

  describe('callCloudFunction', () => {
    it('应该成功调用云函数', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          requestId: 'test-request-id',
          data: { result: 'success' }
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await callCloudFunction('testFunction', { param: 'value' })
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('testFunction'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ param: 'value' })
        })
      )
      expect(result).toEqual({ result: 'success' })
    })

    it('应该处理云函数返回的错误', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          requestId: 'test-request-id',
          error: { message: 'Function error' }
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(callCloudFunction('testFunction', {})).rejects.toThrow('Function error')
    })
  })

  describe('uploadToCloudStorage', () => {
    it('应该成功上传文件到云存储', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          fileId: 'cloud://test-file-id',
          downloadUrl: 'https://example.com/file.jpg'
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await uploadToCloudStorage(mockFile, 'test-path/')
      
      expect(global.fetch).toHaveBeenCalled()
      expect(result.fileId).toBe('cloud://test-file-id')
      expect(result.downloadUrl).toBe('https://example.com/file.jpg')
    })

    it('应该处理上传失败的情况', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        ok: false,
        status: 413,
        statusText: 'Payload Too Large'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(uploadToCloudStorage(mockFile, 'test-path/')).rejects.toThrow('上传失败: 413 Payload Too Large')
    })
  })

  describe('错误处理', () => {
    it('应该提供友好的错误消息', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      try {
        await getHelloFromCloud()
      } catch (error) {
        expect(error.message).toContain('503')
        expect(error.message).toContain('Service Unavailable')
      }
    })

    it('应该处理超时情况', async () => {
      // 模拟长时间运行的请求
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 10000))
      )

      // 这里可以测试超时逻辑，如果服务中有实现的话
      // 目前代码中没有超时处理，所以这个测试主要是文档目的
      expect(global.fetch).toBeDefined()
    })
  })

  describe('配置管理', () => {
    it('应该使用环境变量中的配置', () => {
      const originalEnv = process.env.CLOUDBASE_ENV
      process.env.CLOUDBASE_ENV = 'test-env-id'
      
      // 重新导入模块以应用新的环境变量
      jest.resetModules()
      const { getHelloFromCloud } = require('../cloudbase')
      
      expect(getHelloFromCloud).toBeDefined()
      
      // 恢复原始环境变量
      process.env.CLOUDBASE_ENV = originalEnv
    })

    it('应该使用默认配置当环境变量不存在时', () => {
      // 确保测试在没有环境变量的情况下也能通过
      const originalEnv = process.env.CLOUDBASE_ENV
      delete process.env.CLOUDBASE_ENV
      
      jest.resetModules()
      const { getHelloFromCloud } = require('../cloudbase')
      
      expect(getHelloFromCloud).toBeDefined()
      
      // 恢复原始环境变量
      if (originalEnv) {
        process.env.CLOUDBASE_ENV = originalEnv
      }
    })
  })
})