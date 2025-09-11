/**
 * 运动记录表单验证工具函数
 * 提供数据验证规则、错误消息和格式化功能
 */

import { 
  SportRecordFormData, 
  SportType, 
  LocationInfo,
  SportDataValidationRules,
  CreateSportRecordParams,
  ImageUploadConfig
} from '../types/sport'

// 验证错误消息
export const ValidationMessages = {
  // 必填项错误
  REQUIRED: '此字段为必填项',
  // 数值范围错误
  DURATION_RANGE: '运动时长应在1-1440分钟之间',
  DISTANCE_RANGE: '运动距离应在0.1-200公里之间',
  CALORIES_RANGE: '消耗卡路里应在10-5000之间',
  HEART_RATE_RANGE: '心率应在40-220之间',
  STEPS_RANGE: '步数应在1-100000之间',
  // 格式错误
  INVALID_NUMBER: '请输入有效的数字',
  INVALID_POSITIVE_NUMBER: '请输入大于0的数字',
  // 描述错误
  DESCRIPTION_MAX_LENGTH: '运动描述最多500字',
  // 图片错误
  IMAGE_MAX_COUNT: '最多只能上传9张图片',
  IMAGE_MAX_SIZE: '图片大小不能超过2MB',
  IMAGE_INVALID_TYPE: '只能上传JPG、JPEG、PNG格式的图片',
  // 通用错误
  INVALID_DATA: '数据格式不正确',
  NETWORK_ERROR: '网络连接失败，请检查网络设置'
} as const

// 字段显示名称
export const FieldLabels = {
  sportType: '运动类型',
  duration: '运动时长',
  distance: '运动距离',
  calories: '消耗卡路里',
  heartRate: '心率',
  steps: '步数',
  description: '运动描述',
  images: '运动图片'
} as const

// 验证单个字段
export function validateSportForm(
  field: keyof SportRecordFormData,
  value: any,
  formData?: SportRecordFormData
): string {
  switch (field) {
    case 'sportType':
      return validateSportType(value)
    case 'duration':
      return validateDuration(value)
    case 'distance':
      return validateDistance(value)
    case 'calories':
      return validateCalories(value)
    case 'heartRate':
      return validateHeartRate(value)
    case 'steps':
      return validateSteps(value)
    case 'description':
      return validateDescription(value)
    case 'images':
      return validateImages(value)
    case 'location':
      return validateLocation(value)
    default:
      return ''
  }
}

// 验证运动类型
function validateSportType(value: any): string {
  if (!value || !Object.values(SportType).includes(value)) {
    return ValidationMessages.REQUIRED
  }
  return ''
}

// 验证运动时长
function validateDuration(value: any): string {
  if (!value || value === '') {
    return ValidationMessages.REQUIRED
  }
  
  const duration = parseFloat(value)
  if (isNaN(duration)) {
    return ValidationMessages.INVALID_NUMBER
  }
  
  const { min, max } = SportDataValidationRules.duration
  if (duration < min || duration > max) {
    return ValidationMessages.DURATION_RANGE
  }
  
  return ''
}

// 验证运动距离
function validateDistance(value: any): string {
  if (!value || value === '') {
    return '' // 距离是可选的
  }
  
  const distance = parseFloat(value)
  if (isNaN(distance)) {
    return ValidationMessages.INVALID_NUMBER
  }
  
  if (distance <= 0) {
    return ValidationMessages.INVALID_POSITIVE_NUMBER
  }
  
  const { min, max } = SportDataValidationRules.distance
  if (distance < min || distance > max) {
    return ValidationMessages.DISTANCE_RANGE
  }
  
  return ''
}

// 验证卡路里
function validateCalories(value: any): string {
  if (!value || value === '') {
    return ValidationMessages.REQUIRED
  }
  
  const calories = parseInt(value)
  if (isNaN(calories)) {
    return ValidationMessages.INVALID_NUMBER
  }
  
  const { min, max } = SportDataValidationRules.calories
  if (calories < min || calories > max) {
    return ValidationMessages.CALORIES_RANGE
  }
  
  return ''
}

// 验证心率
function validateHeartRate(value: any): string {
  if (!value || value === '') {
    return '' // 心率是可选的
  }
  
  const heartRate = parseInt(value)
  if (isNaN(heartRate)) {
    return ValidationMessages.INVALID_NUMBER
  }
  
  const { min, max } = SportDataValidationRules.heartRate
  if (heartRate < min || heartRate > max) {
    return ValidationMessages.HEART_RATE_RANGE
  }
  
  return ''
}

// 验证步数
function validateSteps(value: any): string {
  if (!value || value === '') {
    return '' // 步数是可选的
  }
  
  const steps = parseInt(value)
  if (isNaN(steps)) {
    return ValidationMessages.INVALID_NUMBER
  }
  
  if (steps <= 0) {
    return ValidationMessages.INVALID_POSITIVE_NUMBER
  }
  
  const { min, max } = SportDataValidationRules.steps
  if (steps < min || steps > max) {
    return ValidationMessages.STEPS_RANGE
  }
  
  return ''
}

// 验证描述
function validateDescription(value: any): string {
  if (!value || value === '') {
    return '' // 描述是可选的
  }
  
  if (typeof value !== 'string') {
    return ValidationMessages.INVALID_DATA
  }
  
  if (value.length > SportDataValidationRules.description.max) {
    return ValidationMessages.DESCRIPTION_MAX_LENGTH
  }
  
  return ''
}

// 验证图片
function validateImages(value: any): string {
  if (!Array.isArray(value)) {
    return ValidationMessages.INVALID_DATA
  }
  
  if (value.length > ImageUploadConfig.maxCount) {
    return ValidationMessages.IMAGE_MAX_COUNT
  }
  
  // 验证每个文件
  for (const file of value) {
    if (file instanceof File) {
      if (file.size > ImageUploadConfig.maxSize) {
        return ValidationMessages.IMAGE_MAX_SIZE
      }
      
      if (!ImageUploadConfig.acceptTypes.includes(file.type)) {
        return ValidationMessages.IMAGE_INVALID_TYPE
      }
    }
  }
  
  return ''
}

// 验证位置信息
function validateLocation(value: any): string {
  if (!value) {
    return '' // 位置是可选的
  }
  
  if (typeof value !== 'object') {
    return ValidationMessages.INVALID_DATA
  }
  
  const location = value as LocationInfo
  
  // 验证经纬度
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return ValidationMessages.INVALID_DATA
  }
  
  if (location.latitude < -90 || location.latitude > 90) {
    return '纬度必须在-90到90之间'
  }
  
  if (location.longitude < -180 || location.longitude > 180) {
    return '经度必须在-180到180之间'
  }
  
  if (!location.address || typeof location.address !== 'string') {
    return '地址信息不能为空'
  }
  
  return ''
}

// 验证整个表单
export function validateSportFormData(formData: SportRecordFormData): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  let isValid = true

  // 验证所有字段
  const fields: (keyof SportRecordFormData)[] = [
    'sportType', 'duration', 'distance', 'calories', 
    'heartRate', 'steps', 'description', 'images', 'location'
  ]

  fields.forEach(field => {
    const error = validateSportForm(field, formData[field], formData)
    if (error) {
      errors[field] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

// 格式化表单数据用于提交
export function formatFormData(formData: SportRecordFormData): CreateSportRecordParams {
  return {
    sportType: formData.sportType,
    data: {
      duration: parseInt(formData.duration) || 0,
      distance: formData.distance ? (parseFloat(formData.distance) || undefined) : undefined,
      calories: parseInt(formData.calories) || 0,
      heartRate: formData.heartRate ? (parseInt(formData.heartRate) || undefined) : undefined,
      steps: formData.steps ? (parseInt(formData.steps) || undefined) : undefined
    },
    images: [], // 图片需要在提交前单独处理上传
    description: formData.description || '',
    location: formData.location
  }
}

// 获取第一个错误消息
export function getFirstError(errors: Record<string, string>): string {
  const errorKeys = Object.keys(errors)
  if (errorKeys.length > 0) {
    const firstError = errors[errorKeys[0]]
    const fieldLabel = FieldLabels[errorKeys[0] as keyof typeof FieldLabels]
    return fieldLabel ? `${fieldLabel}: ${firstError}` : firstError
  }
  return ''
}

// 获取所有错误消息
export function getAllErrors(errors: Record<string, string>): string[] {
  return Object.entries(errors).map(([field, error]) => {
    const fieldLabel = FieldLabels[field as keyof typeof FieldLabels]
    return fieldLabel ? `${fieldLabel}: ${error}` : error
  })
}

// 实时验证助手函数
export function createRealtimeValidator(formData: SportRecordFormData) {
  return {
    // 验证单个字段并返回错误消息
    validate: (field: keyof SportRecordFormData) => {
      return validateSportForm(field, formData[field], formData)
    },
    // 验证所有字段并返回错误对象
    validateAll: () => {
      return validateSportFormData(formData)
    }
  }
}

// 网络错误处理
export function handleNetworkError(error: any): string {
  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response
    switch (status) {
      case 400:
        return data.message || '请求参数错误'
      case 401:
        return '用户未登录或登录已过期'
      case 403:
        return '没有权限执行此操作'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器内部错误'
      default:
        return `服务器错误 (${status})`
    }
  } else if (error.request) {
    // 网络请求未收到响应
    return ValidationMessages.NETWORK_ERROR
  } else {
    // 请求配置错误
    return '请求配置错误'
  }
}

// 表单数据清理
export function sanitizeFormData(formData: SportRecordFormData): SportRecordFormData {
  return {
    ...formData,
    duration: formData.duration?.trim() || '',
    distance: formData.distance?.trim() || '',
    calories: formData.calories?.trim() || '',
    heartRate: formData.heartRate?.trim() || '',
    steps: formData.steps?.trim() || '',
    description: formData.description?.trim() || ''
  }
}

// 默认错误消息
export const DefaultErrorMessages = {
  SUBMIT_FAILED: '提交失败，请稍后重试',
  UPLOAD_FAILED: '图片上传失败，请重试',
  SAVE_FAILED: '保存失败，请检查网络连接',
  LOAD_FAILED: '数据加载失败，请刷新页面重试'
} as const