/**
 * 云函数工具函数
 */

import { AppError, ValidationError } from '../types'
import { ERROR_CODES, ERROR_MESSAGES } from '../constants'

/**
 * 创建应用错误
 */
export function createAppError(
  code: number,
  message?: string,
  statusCode: number = 500,
  details?: any
): AppError {
  const error = new Error(message || ERROR_MESSAGES[code] || '未知错误') as AppError
  error.code = String(code)
  error.statusCode = statusCode
  error.details = details
  return error
}

/**
 * 创建成功响应
 */
export function createSuccessResponse(data?: any, message?: string) {
  return {
    code: ERROR_CODES.SUCCESS,
    message: message || ERROR_MESSAGES[ERROR_CODES.SUCCESS],
    data
  }
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: AppError | Error | string, code?: number) {
  if (typeof error === 'string') {
    return {
      code: code || ERROR_CODES.UNKNOWN_ERROR,
      message: error,
      error: error
    }
  }

  if ('code' in error) {
    return {
      code: Number(error.code) || ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      error: error.message,
      details: error.details
    }
  }

  return {
    code: code || ERROR_CODES.UNKNOWN_ERROR,
    message: error.message,
    error: error.message
  }
}

/**
 * 验证参数
 */
export function validateParams(params: any, rules: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [field, rule] of Object.entries(rules)) {
    const value = params[field]

    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} 是必填项`,
        value
      })
      continue
    }

    // 如果非必填且值为空，跳过其他验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // 类型验证
    if (rule.type && typeof value !== rule.type) {
      errors.push({
        field,
        message: `${field} 必须是 ${rule.type} 类型`,
        value
      })
      continue
    }

    // 最小值验证
    if (rule.min !== undefined && value < rule.min) {
      errors.push({
        field,
        message: `${field} 必须大于等于 ${rule.min}`,
        value
      })
      continue
    }

    // 最大值验证
    if (rule.max !== undefined && value > rule.max) {
      errors.push({
        field,
        message: `${field} 必须小于等于 ${rule.max}`,
        value
      })
      continue
    }

    // 长度验证
    if (rule.length && value.length !== rule.length) {
      errors.push({
        field,
        message: `${field} 长度必须是 ${rule.length}`,
        value
      })
      continue
    }

    // 最小长度验证
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({
        field,
        message: `${field} 长度必须大于等于 ${rule.minLength}`,
        value
      })
      continue
    }

    // 最大长度验证
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({
        field,
        message: `${field} 长度必须小于等于 ${rule.maxLength}`,
        value
      })
      continue
    }

    // 正则表达式验证
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        field,
        message: rule.patternMessage || `${field} 格式不正确`,
        value
      })
      continue
    }

    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, params)
      if (result !== true) {
        errors.push({
          field,
          message: typeof result === 'string' ? result : `${field} 验证失败`,
          value
        })
      }
    }
  }

  return errors
}

/**
 * 验证运动记录参数
 */
export function validateSportRecordParams(params: any): ValidationError[] {
  const rules = {
    sportType: {
      required: true,
      type: 'string'
    },
    data: {
      required: true,
      type: 'object'
    },
    'data.duration': {
      required: true,
      type: 'number',
      min: 1,
      max: 1440
    },
    'data.distance': {
      required: false,
      type: 'number',
      min: 0.1,
      max: 200
    },
    'data.calories': {
      required: true,
      type: 'number',
      min: 10,
      max: 5000
    },
    'data.heartRate': {
      required: false,
      type: 'number',
      min: 40,
      max: 220
    },
    'data.steps': {
      required: false,
      type: 'number',
      min: 1,
      max: 100000
    },
    images: {
      required: false,
      type: 'array',
      maxLength: 9
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    location: {
      required: false,
      type: 'object'
    }
  }

  return validateParams(params, rules)
}

/**
 * 验证查询参数
 */
export function validateQueryParams(params: any): ValidationError[] {
  const rules = {
    page: {
      required: false,
      type: 'number',
      min: 1
    },
    pageSize: {
      required: false,
      type: 'number',
      min: 1,
      max: 100
    },
    sportType: {
      required: false,
      type: 'string'
    },
    startDate: {
      required: false,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      patternMessage: '开始日期格式必须是 YYYY-MM-DD'
    },
    endDate: {
      required: false,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      patternMessage: '结束日期格式必须是 YYYY-MM-DD'
    },
    keyword: {
      required: false,
      type: 'string',
      maxLength: 100
    },
    sortBy: {
      required: false,
      type: 'string',
      validator: (value: string) => {
        const allowed = ['createdAt', 'duration', 'distance', 'calories']
        return allowed.includes(value) || '排序字段必须是: createdAt, duration, distance, calories'
      }
    },
    sortOrder: {
      required: false,
      type: 'string',
      validator: (value: string) => {
        const allowed = ['asc', 'desc']
        return allowed.includes(value) || '排序顺序必须是: asc, desc'
      }
    }
  }

  return validateParams(params, rules)
}

/**
 * 格式化错误消息
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  
  return errors.map(error => error.message).join('; ')
}

/**
 * 检查用户权限
 */
export function checkPermission(userOpenId: string, recordOpenId: string): boolean {
  return userOpenId === recordOpenId
}

/**
 * 计算分页偏移量
 */
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * 计算总页数
 */
export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize)
}

/**
 * 检查是否有更多数据
 */
export function hasMoreData(total: number, page: number, pageSize: number): boolean {
  return total > page * pageSize
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 计算相对时间
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 验证运动类型
 */
export function validateSportType(sportType: string): boolean {
  const validTypes = Object.values(SPORT_TYPES)
  return validTypes.includes(sportType)
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 安全地解析JSON
 */
export function safeParseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON解析失败:', error)
    return null
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 导出工具函数
export default {
  createAppError,
  createSuccessResponse,
  createErrorResponse,
  validateParams,
  validateSportRecordParams,
  validateQueryParams,
  formatValidationErrors,
  checkPermission,
  getPaginationOffset,
  getTotalPages,
  hasMoreData,
  formatDate,
  generateUniqueId,
  getRelativeTime,
  validateSportType,
  deepClone,
  safeParseJSON,
  generateRandomString,
  debounce,
  throttle
}