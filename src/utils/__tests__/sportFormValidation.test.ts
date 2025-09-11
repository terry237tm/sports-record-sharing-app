/**
 * sportFormValidation 工具函数测试
 */

import {
  validateSportForm,
  validateSportFormData,
  formatFormData,
  getFirstError,
  getAllErrors,
  createRealtimeValidator,
  handleNetworkError,
  sanitizeFormData,
  ValidationMessages,
  FieldLabels
} from '../sportFormValidation'
import { SportType, SportRecordFormData } from '../../types/sport'

describe('sportFormValidation', () => {
  describe('validateSportForm', () => {
    test('应该验证运动类型', () => {
      expect(validateSportForm('sportType', SportType.RUNNING)).toBe('')
      expect(validateSportForm('sportType', '')).toBe(ValidationMessages.REQUIRED)
      expect(validateSportForm('sportType', 'invalid')).toBe(ValidationMessages.REQUIRED)
      expect(validateSportForm('sportType', null)).toBe(ValidationMessages.REQUIRED)
    })

    test('应该验证运动时长', () => {
      expect(validateSportForm('duration', '30')).toBe('')
      expect(validateSportForm('duration', '0')).toBe(ValidationMessages.DURATION_RANGE)
      expect(validateSportForm('duration', '1441')).toBe(ValidationMessages.DURATION_RANGE)
      expect(validateSportForm('duration', '')).toBe(ValidationMessages.REQUIRED)
      expect(validateSportForm('duration', 'invalid')).toBe(ValidationMessages.INVALID_NUMBER)
    })

    test('应该验证运动距离', () => {
      expect(validateSportForm('distance', '5.5')).toBe('')
      expect(validateSportForm('distance', '')).toBe('') // 可选字段
      expect(validateSportForm('distance', '0')).toBe(ValidationMessages.INVALID_POSITIVE_NUMBER)
      expect(validateSportForm('distance', '201')).toBe(ValidationMessages.DISTANCE_RANGE)
      expect(validateSportForm('distance', 'invalid')).toBe(ValidationMessages.INVALID_NUMBER)
    })

    test('应该验证卡路里', () => {
      expect(validateSportForm('calories', '300')).toBe('')
      expect(validateSportForm('calories', '9')).toBe(ValidationMessages.CALORIES_RANGE)
      expect(validateSportForm('calories', '5001')).toBe(ValidationMessages.CALORIES_RANGE)
      expect(validateSportForm('calories', '')).toBe(ValidationMessages.REQUIRED)
      expect(validateSportForm('calories', 'invalid')).toBe(ValidationMessages.INVALID_NUMBER)
    })

    test('应该验证心率', () => {
      expect(validateSportForm('heartRate', '120')).toBe('')
      expect(validateSportForm('heartRate', '')).toBe('') // 可选字段
      expect(validateSportForm('heartRate', '39')).toBe(ValidationMessages.HEART_RATE_RANGE)
      expect(validateSportForm('heartRate', '221')).toBe(ValidationMessages.HEART_RATE_RANGE)
      expect(validateSportForm('heartRate', 'invalid')).toBe(ValidationMessages.INVALID_NUMBER)
    })

    test('应该验证步数', () => {
      expect(validateSportForm('steps', '5000')).toBe('')
      expect(validateSportForm('steps', '')).toBe('') // 可选字段
      expect(validateSportForm('steps', '0')).toBe(ValidationMessages.INVALID_POSITIVE_NUMBER)
      expect(validateSportForm('steps', '100001')).toBe(ValidationMessages.STEPS_RANGE)
      expect(validateSportForm('steps', 'invalid')).toBe(ValidationMessages.INVALID_NUMBER)
    })

    test('应该验证描述', () => {
      expect(validateSportForm('description', '今天跑了5公里')).toBe('')
      expect(validateSportForm('description', '')).toBe('') // 可选字段
      
      const longDescription = 'a'.repeat(501)
      expect(validateSportForm('description', longDescription)).toBe(ValidationMessages.DESCRIPTION_MAX_LENGTH)
      
      expect(validateSportForm('description', 123)).toBe(ValidationMessages.INVALID_DATA)
    })

    test('应该验证图片', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      expect(validateSportForm('images', [mockFile])).toBe('')
      expect(validateSportForm('images', [])).toBe('')
      
      // 测试图片数量限制
      const manyFiles = Array(10).fill(mockFile)
      expect(validateSportForm('images', manyFiles)).toBe(ValidationMessages.IMAGE_MAX_COUNT)
      
      // 测试文件大小限制
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      expect(validateSportForm('images', [largeFile])).toBe(ValidationMessages.IMAGE_MAX_SIZE)
      
      // 测试文件类型
      const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      expect(validateSportForm('images', [invalidFile])).toBe(ValidationMessages.IMAGE_INVALID_TYPE)
      
      expect(validateSportForm('images', 'not array')).toBe(ValidationMessages.INVALID_DATA)
    })

    test('应该验证位置信息', () => {
      const validLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区'
      }
      expect(validateSportForm('location', validLocation)).toBe('')
      expect(validateSportForm('location', '')).toBe('') // 可选字段
      expect(validateSportForm('location', null)).toBe('') // 可选字段
      
      // 测试无效的经纬度
      const invalidLat = { ...validLocation, latitude: 91 }
      expect(validateSportForm('location', invalidLat)).toBe('纬度必须在-90到90之间')
      
      const invalidLng = { ...validLocation, longitude: 181 }
      expect(validateSportForm('location', invalidLng)).toBe('经度必须在-180到180之间')
      
      // 测试缺少地址
      const noAddress = { latitude: 39.9042, longitude: 116.4074 }
      expect(validateSportForm('location', noAddress)).toBe('地址信息不能为空')
      
      expect(validateSportForm('location', 'not object')).toBe(ValidationMessages.INVALID_DATA)
    })
  })

  describe('validateSportFormData', () => {
    test('应该验证整个表单数据', () => {
      const validFormData: SportRecordFormData = {
        sportType: SportType.RUNNING,
        duration: '30',
        distance: '5.5',
        calories: '300',
        heartRate: '120',
        steps: '5000',
        description: '今天跑了5公里',
        images: [],
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市朝阳区'
        }
      }

      const result = validateSportFormData(validFormData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    test('应该返回所有验证错误', () => {
      const invalidFormData: SportRecordFormData = {
        sportType: '' as SportType,
        duration: '',
        distance: 'invalid',
        calories: '',
        heartRate: 'invalid',
        steps: 'invalid',
        description: 'a'.repeat(501),
        images: Array(10).fill(new File(['test'], 'test.jpg', { type: 'image/jpeg' })),
        location: {
          latitude: 91,
          longitude: 181,
          address: ''
        }
      }

      const result = validateSportFormData(invalidFormData)
      expect(result.isValid).toBe(false)
      expect(result.errors.sportType).toBeDefined()
      expect(result.errors.duration).toBeDefined()
      expect(result.errors.distance).toBeDefined()
      expect(result.errors.calories).toBeDefined()
      expect(result.errors.heartRate).toBeDefined()
      expect(result.errors.steps).toBeDefined()
      expect(result.errors.description).toBeDefined()
      expect(result.errors.images).toBeDefined()
      expect(result.errors.location).toBeDefined()
    })
  })

  describe('formatFormData', () => {
    test('应该正确格式化表单数据', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.RUNNING,
        duration: '30',
        distance: '5.5',
        calories: '300',
        heartRate: '120',
        steps: '5000',
        description: '今天跑了5公里',
        images: [],
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市朝阳区'
        }
      }

      const result = formatFormData(formData)
      
      expect(result.sportType).toBe(SportType.RUNNING)
      expect(result.data.duration).toBe(30)
      expect(result.data.distance).toBe(5.5)
      expect(result.data.calories).toBe(300)
      expect(result.data.heartRate).toBe(120)
      expect(result.data.steps).toBe(5000)
      expect(result.description).toBe('今天跑了5公里')
      expect(result.location).toEqual(formData.location)
      expect(result.images).toEqual([]) // 图片需要在提交前处理
    })

    test('应该处理空值和可选字段', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.CYCLING,
        duration: '45',
        distance: '',
        calories: '400',
        heartRate: '',
        steps: '',
        description: '',
        images: [],
        location: undefined
      }

      const result = formatFormData(formData)
      
      expect(result.data.duration).toBe(45)
      expect(result.data.distance).toBeUndefined()
      expect(result.data.calories).toBe(400)
      expect(result.data.heartRate).toBeUndefined()
      expect(result.data.steps).toBeUndefined()
      expect(result.description).toBe('')
      expect(result.location).toBeUndefined()
    })

    test('应该处理无效数字', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.FITNESS,
        duration: 'invalid',
        distance: 'invalid',
        calories: 'invalid',
        heartRate: 'invalid',
        steps: 'invalid',
        description: '健身训练',
        images: [],
        location: undefined
      }

      const result = formatFormData(formData)
      
      expect(result.data.duration).toBe(0)
      expect(result.data.distance).toBeUndefined()
      expect(result.data.calories).toBe(0)
      expect(result.data.heartRate).toBeUndefined()
      expect(result.data.steps).toBeUndefined()
    })
  })

  describe('getFirstError', () => {
    test('应该返回第一个错误消息', () => {
      const errors = {
        duration: '运动时长应在1-1440分钟之间',
        calories: '消耗卡路里应在10-5000之间'
      }

      const result = getFirstError(errors)
      expect(result).toBe('运动时长: 运动时长应在1-1440分钟之间')
    })

    test('应该处理空错误对象', () => {
      const result = getFirstError({})
      expect(result).toBe('')
    })

    test('应该处理未知字段', () => {
      const errors = {
        unknownField: '错误消息'
      }

      const result = getFirstError(errors)
      expect(result).toBe('错误消息')
    })
  })

  describe('getAllErrors', () => {
    test('应该返回所有错误消息', () => {
      const errors = {
        duration: '运动时长应在1-1440分钟之间',
        calories: '消耗卡路里应在10-5000之间',
        unknownField: '未知错误'
      }

      const result = getAllErrors(errors)
      expect(result).toHaveLength(3)
      expect(result).toContain('运动时长: 运动时长应在1-1440分钟之间')
      expect(result).toContain('消耗卡路里: 消耗卡路里应在10-5000之间')
      expect(result).toContain('未知错误')
    })

    test('应该处理空错误对象', () => {
      const result = getAllErrors({})
      expect(result).toEqual([])
    })
  })

  describe('createRealtimeValidator', () => {
    test('应该创建实时验证器', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.RUNNING,
        duration: '30',
        distance: '5.5',
        calories: '300',
        heartRate: '120',
        steps: '5000',
        description: '今天跑了5公里',
        images: [],
        location: undefined
      }

      const validator = createRealtimeValidator(formData)
      
      expect(validator.validate('duration')).toBe('')
      expect(validator.validate('calories')).toBe('')
      
      const allResult = validator.validateAll()
      expect(allResult.isValid).toBe(true)
      expect(allResult.errors).toEqual({})
    })
  })

  describe('handleNetworkError', () => {
    test('应该处理服务器错误', () => {
      const error400 = {
        response: { status: 400, data: { message: '参数错误' } }
      }
      expect(handleNetworkError(error400)).toBe('参数错误')

      const error401 = {
        response: { status: 401, data: {} }
      }
      expect(handleNetworkError(error401)).toBe('用户未登录或登录已过期')

      const error403 = {
        response: { status: 403, data: {} }
      }
      expect(handleNetworkError(error403)).toBe('没有权限执行此操作')

      const error404 = {
        response: { status: 404, data: {} }
      }
      expect(handleNetworkError(error404)).toBe('请求的资源不存在')

      const error500 = {
        response: { status: 500, data: {} }
      }
      expect(handleNetworkError(error500)).toBe('服务器内部错误')

      const errorUnknown = {
        response: { status: 503, data: {} }
      }
      expect(handleNetworkError(errorUnknown)).toBe('服务器错误 (503)')
    })

    test('应该处理网络请求错误', () => {
      const networkError = {
        request: {}
      }
      expect(handleNetworkError(networkError)).toBe(ValidationMessages.NETWORK_ERROR)
    })

    test('应该处理请求配置错误', () => {
      const configError = {
        message: '配置错误'
      }
      expect(handleNetworkError(configError)).toBe('请求配置错误')
    })
  })

  describe('sanitizeFormData', () => {
    test('应该清理表单数据', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.RUNNING,
        duration: '  30  ',
        distance: '  5.5  ',
        calories: '  300  ',
        heartRate: '  120  ',
        steps: '  5000  ',
        description: '  今天跑了5公里  ',
        images: [],
        location: undefined
      }

      const result = sanitizeFormData(formData)
      
      expect(result.duration).toBe('30')
      expect(result.distance).toBe('5.5')
      expect(result.calories).toBe('300')
      expect(result.heartRate).toBe('120')
      expect(result.steps).toBe('5000')
      expect(result.description).toBe('今天跑了5公里')
    })

    test('应该处理空值', () => {
      const formData: SportRecordFormData = {
        sportType: SportType.RUNNING,
        duration: null as any,
        distance: undefined as any,
        calories: '',
        heartRate: null as any,
        steps: undefined as any,
        description: '',
        images: [],
        location: undefined
      }

      const result = sanitizeFormData(formData)
      
      expect(result.duration).toBe('')
      expect(result.distance).toBe('')
      expect(result.calories).toBe('')
      expect(result.heartRate).toBe('')
      expect(result.steps).toBe('')
      expect(result.description).toBe('')
    })
  })

  describe('FieldLabels', () => {
    test('应该包含所有字段标签', () => {
      expect(FieldLabels.sportType).toBe('运动类型')
      expect(FieldLabels.duration).toBe('运动时长')
      expect(FieldLabels.distance).toBe('运动距离')
      expect(FieldLabels.calories).toBe('消耗卡路里')
      expect(FieldLabels.heartRate).toBe('心率')
      expect(FieldLabels.steps).toBe('步数')
      expect(FieldLabels.description).toBe('运动描述')
      expect(FieldLabels.images).toBe('运动图片')
    })
  })

  describe('ValidationMessages', () => {
    test('应该包含所有验证消息', () => {
      expect(ValidationMessages.REQUIRED).toBe('此字段为必填项')
      expect(ValidationMessages.DURATION_RANGE).toBe('运动时长应在1-1440分钟之间')
      expect(ValidationMessages.DISTANCE_RANGE).toBe('运动距离应在0.1-200公里之间')
      expect(ValidationMessages.CALORIES_RANGE).toBe('消耗卡路里应在10-5000之间')
      expect(ValidationMessages.HEART_RATE_RANGE).toBe('心率应在40-220之间')
      expect(ValidationMessages.STEPS_RANGE).toBe('步数应在1-100000之间')
      expect(ValidationMessages.DESCRIPTION_MAX_LENGTH).toBe('运动描述最多500字')
      expect(ValidationMessages.IMAGE_MAX_COUNT).toBe('最多只能上传9张图片')
      expect(ValidationMessages.IMAGE_MAX_SIZE).toBe('图片大小不能超过2MB')
      expect(ValidationMessages.IMAGE_INVALID_TYPE).toBe('只能上传JPG、JPEG、PNG格式的图片')
    })
  })
})