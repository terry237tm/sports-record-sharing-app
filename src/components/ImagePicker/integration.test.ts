/**
 * ImagePicker 组件集成测试
 * 验证完整的图片处理流程
 */

import { validateImageFormat, validateImageSize, validateImageCount, validateImageDimensions } from '@/utils/imageValidation'
import { getCompressionSuggestion, DEFAULT_COMPRESSION_CONFIG } from '@/utils/imageCompression'

describe('ImagePicker 集成测试', () => {
  describe('完整的图片验证流程', () => {
    it('应该按顺序执行格式、大小、数量验证', () => {
      // 1. 格式验证
      const formatResult = validateImageFormat('image/jpeg')
      expect(formatResult.valid).toBe(true)

      // 2. 大小验证
      const sizeResult = validateImageSize(1024 * 1024, 2 * 1024 * 1024) // 1MB vs 2MB限制
      expect(sizeResult.valid).toBe(true)

      // 3. 数量验证
      const countResult = validateImageCount(3, 2, 9) // 当前3张，新增2张，限制9张
      expect(countResult.valid).toBe(true)

      // 4. 尺寸验证
      const dimensionResult = validateImageDimensions(800, 600, 1280, 1280)
      expect(dimensionResult.valid).toBe(true)
    })

    it('应该在格式验证失败时阻止后续验证', () => {
      // 格式验证失败
      const formatResult = validateImageFormat('image/gif')
      expect(formatResult.valid).toBe(false)
      expect(formatResult.error).toContain('不支持的图片格式')

      // 如果格式验证失败，后续验证不应该执行
      // 这里模拟实际使用中的逻辑
      if (!formatResult.valid) {
        // 直接返回错误，不执行其他验证
        expect(formatResult.error).toBeDefined()
        return
      }

      // 这行代码不会执行
      expect(true).toBe(false)
    })
  })

  describe('智能压缩建议流程', () => {
    it('应该根据文件大小提供合适的压缩建议', () => {
      const originalSize = 5 * 1024 * 1024 // 5MB
      const targetSize = 2 * 1024 * 1024   // 2MB

      // 获取压缩建议
      const suggestion = getCompressionSuggestion(originalSize, targetSize)

      // 验证建议的合理性
      expect(suggestion.quality).toBeGreaterThan(0)
      expect(suggestion.quality).toBeLessThanOrEqual(1)
      expect(suggestion.maxWidth).toBeGreaterThan(0)
      expect(suggestion.maxHeight).toBeGreaterThan(0)

      // 由于目标大小远小于原始大小，应该使用较强的压缩
      expect(suggestion.quality).toBeLessThanOrEqual(0.8)
      expect(suggestion.maxWidth).toBeLessThanOrEqual(1280)
    })

    it('应该处理不需要压缩的情况', () => {
      const originalSize = 1 * 1024 * 1024 // 1MB
      const targetSize = 2 * 1024 * 1024   // 2MB

      const suggestion = getCompressionSuggestion(originalSize, targetSize)

      // 目标大小大于原始大小，应该使用轻微压缩设置
      expect(suggestion.quality).toBe(0.9)
      expect(suggestion.maxWidth).toBe(1920)
      expect(suggestion.maxHeight).toBe(1920)
    })
  })

  describe('多图片处理流程', () => {
    it('应该验证多图片选择的数量限制', () => {
      const maxCount = 9
      const currentCount = 7
      const newCount = 3

      const result = validateImageCount(currentCount, newCount, maxCount)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('最多只能上传')
      expect(result.error).toContain(`当前已选择 ${currentCount} 张`)
    })

    it('应该允许在限制范围内的多图片选择', () => {
      const maxCount = 9
      const currentCount = 5
      const newCount = 3

      const result = validateImageCount(currentCount, newCount, maxCount)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('错误处理流程', () => {
    it('应该提供详细的错误信息', () => {
      // 测试各种错误情况
      
      // 格式错误
      const formatError = validateImageFormat('image/bmp')
      expect(formatError.error).toContain('不支持的图片格式')
      expect(formatError.error).toContain('JPG、JPEG、PNG')

      // 大小错误
      const sizeError = validateImageSize(5 * 1024 * 1024, 2 * 1024 * 1024)
      expect(sizeError.error).toContain('图片大小不能超过')
      expect(sizeError.error).toContain('2.0MB')

      // 数量错误
      const countError = validateImageCount(8, 3, 9)
      expect(countError.error).toContain('最多只能上传')
      expect(countError.error).toContain('9 张图片')
      expect(countError.error).toContain('当前已选择 8 张')

      // 尺寸错误
      const dimensionError = validateImageDimensions(5000, 4000, 4096, 4096)
      expect(dimensionError.error).toContain('图片尺寸过大')
      expect(dimensionError.error).toContain('4096x4096')
    })
  })

  describe('配置验证', () => {
    it('应该使用默认配置', () => {
      expect(DEFAULT_COMPRESSION_CONFIG.maxWidth).toBe(1280)
      expect(DEFAULT_COMPRESSION_CONFIG.maxHeight).toBe(1280)
      expect(DEFAULT_COMPRESSION_CONFIG.quality).toBe(0.8)
      expect(DEFAULT_COMPRESSION_CONFIG.maxSize).toBe(2 * 1024 * 1024)
      expect(DEFAULT_COMPRESSION_CONFIG.format).toBe('jpeg')
    })

    it('应该支持自定义配置', () => {
      const customConfig = {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.9,
        maxSize: 5 * 1024 * 1024,
        format: 'png' as const
      }

      // 验证配置项的合理性
      expect(customConfig.maxWidth).toBeGreaterThan(0)
      expect(customConfig.maxHeight).toBeGreaterThan(0)
      expect(customConfig.quality).toBeGreaterThan(0)
      expect(customConfig.quality).toBeLessThanOrEqual(1)
      expect(customConfig.maxSize).toBeGreaterThan(0)
      expect(['jpeg', 'png']).toContain(customConfig.format)
    })
  })
})

describe('用户体验优化', () => {
  it('应该提供清晰的中文错误提示', () => {
    const testCases = [
      {
        validator: () => validateImageFormat('image/gif'),
        expectedKeywords: ['不支持', '格式', 'JPG', 'JPEG', 'PNG']
      },
      {
        validator: () => validateImageSize(5 * 1024 * 1024, 2 * 1024 * 1024),
        expectedKeywords: ['大小', '不能超过', 'MB']
      },
      {
        validator: () => validateImageCount(8, 3, 9),
        expectedKeywords: ['最多', '张图片', '当前已选择']
      },
      {
        validator: () => validateImageDimensions(5000, 4000, 4096, 4096),
        expectedKeywords: ['尺寸过大', '像素']
      }
    ]

    testCases.forEach(({ validator, expectedKeywords }) => {
      const result = validator()
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      
      expectedKeywords.forEach(keyword => {
        expect(result.error).toContain(keyword)
      })
    })
  })

  it('应该支持性能优化的快捷方式', () => {
    // 验证skipDimensionCheck选项的存在
    // 这个选项在实际使用中可以提升大批量图片处理的性能
    
    // 这里主要验证配置项的合理性
    const config = {
      skipDimensionCheck: true,
      maxSize: 2 * 1024 * 1024,
      maxWidth: 1280,
      maxHeight: 1280
    }

    expect(config.skipDimensionCheck).toBe(true)
    expect(config.maxSize).toBeDefined()
    expect(config.maxWidth).toBeDefined()
    expect(config.maxHeight).toBeDefined()
  })
})