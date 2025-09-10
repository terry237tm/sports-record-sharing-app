/**
 * 数据验证工具类
 * 提供常用的数据验证和格式化功能
 */

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard: string): boolean {
  // 18位身份证号码的正则表达式
  const idCardRegex18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  // 15位身份证号码的正则表达式
  const idCardRegex15 = /^[1-9]\d{7}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/
  
  return idCardRegex18.test(idCard) || idCardRegex15.test(idCard)
}

/**
 * 验证URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证日期
 */
export function validateDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 验证数字范围
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false
  }

  if (min !== undefined && value < min) {
    return false
  }

  if (max !== undefined && value > max) {
    return false
  }

  return true
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  minLength?: number,
  maxLength?: number
): boolean {
  if (typeof value !== 'string') {
    return false
  }

  const length = value.length

  if (minLength !== undefined && length < minLength) {
    return false
  }

  if (maxLength !== undefined && length > maxLength) {
    return false
  }

  return true
}

/**
 * 验证数组
 */
export function validateArray(
  value: any[],
  minLength?: number,
  maxLength?: number
): boolean {
  if (!Array.isArray(value)) {
    return false
  }

  const length = value.length

  if (minLength !== undefined && length < minLength) {
    return false
  }

  if (maxLength !== undefined && length > maxLength) {
    return false
  }

  return true
}

/**
 * 验证枚举值
 */
export function validateEnum<T extends string>(
  value: any,
  enumObject: Record<string, T>
): boolean {
  return Object.values(enumObject).includes(value)
}

/**
 * 验证对象结构
 */
export function validateObject(
  obj: any,
  requiredFields?: string[]
): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  if (requiredFields) {
    return requiredFields.every(field => field in obj)
  }

  return true
}

/**
 * 验证坐标
 */
export function validateCoordinate(
  latitude: number,
  longitude: number
): boolean {
  return (
    validateNumberRange(latitude, -90, 90) &&
    validateNumberRange(longitude, -180, 180)
  )
}

/**
 * 验证运动数据
 */
export function validateSportData(data: {
  duration?: number
  distance?: number
  calories?: number
  steps?: number
}): { valid: boolean; error?: string } {
  if (data.duration !== undefined) {
    if (!validateNumberRange(data.duration, 1)) {
      return { valid: false, error: '运动时长必须大于0' }
    }
  }

  if (data.distance !== undefined) {
    if (!validateNumberRange(data.distance, 0)) {
      return { valid: false, error: '运动距离不能为负数' }
    }
  }

  if (data.calories !== undefined) {
    if (!validateNumberRange(data.calories, 0)) {
      return { valid: false, error: '消耗卡路里不能为负数' }
    }
  }

  if (data.steps !== undefined) {
    if (!validateNumberRange(data.steps, 0)) {
      return { valid: false, error: '步数不能为负数' }
    }
  }

  return { valid: true }
}

/**
 * 验证用户数据
 */
export function validateUserData(data: {
  nickName?: string
  phone?: string
  email?: string
  height?: number
  weight?: number
  birthday?: Date
}): { valid: boolean; error?: string } {
  if (data.nickName !== undefined) {
    if (!validateStringLength(data.nickName, 1, 50)) {
      return { valid: false, error: '昵称长度必须在1-50个字符之间' }
    }
  }

  if (data.phone !== undefined && data.phone !== '') {
    if (!validatePhone(data.phone)) {
      return { valid: false, error: '手机号格式不正确' }
    }
  }

  if (data.email !== undefined && data.email !== '') {
    if (!validateEmail(data.email)) {
      return { valid: false, error: '邮箱格式不正确' }
    }
  }

  if (data.height !== undefined) {
    if (!validateNumberRange(data.height, 50, 250)) {
      return { valid: false, error: '身高必须在50-250cm之间' }
    }
  }

  if (data.weight !== undefined) {
    if (!validateNumberRange(data.weight, 20, 300)) {
      return { valid: false, error: '体重必须在20-300kg之间' }
    }
  }

  if (data.birthday !== undefined) {
    if (!validateDate(data.birthday)) {
      return { valid: false, error: '生日日期格式不正确' }
    }

    const age = calculateAge(data.birthday)
    if (age < 0 || age > 150) {
      return { valid: false, error: '生日日期不合理' }
    }
  }

  return { valid: true }
}

/**
 * 计算年龄
 */
export function calculateAge(birthday: Date): number {
  const today = new Date()
  const birthDate = new Date(birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
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
 * 格式化时长
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return '0分钟'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  if (hours > 0) {
    return remainingMinutes > 0
      ? `${hours}小时${remainingMinutes}分钟`
      : `${hours}小时`
  }

  return `${remainingMinutes}分钟`
}

/**
 * 格式化距离
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 0.01) {
    return '0公里'
  }

  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}米`
  }

  return `${kilometers.toFixed(2)}公里`
}

/**
 * 格式化卡路里
 */
export function formatCalories(calories: number): string {
  if (calories < 1000) {
    return `${Math.round(calories)}卡`
  }

  return `${(calories / 1000).toFixed(1)}千卡`
}

/**
 * 格式化配速
 */
export function formatPace(minutesPerKm: number): string {
  const minutes = Math.floor(minutesPerKm)
  const seconds = Math.round((minutesPerKm - minutes) * 60)

  return `${minutes}'${seconds.toString().padStart(2, '0')}"`
}

/**
 * 验证文件类型
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

/**
 * 验证文件大小
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
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
 * 生成唯一ID
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}${timestamp}${random}`
}

/**
 * 数据脱敏
 */
export function maskSensitiveData(data: string, start: number = 3, end: number = 4): string {
  if (data.length <= start + end) {
    return data
  }

  const startStr = data.substring(0, start)
  const endStr = data.substring(data.length - end)
  const maskStr = '*'.repeat(data.length - start - end)

  return `${startStr}${maskStr}${endStr}`
}

export default {
  validatePhone,
  validateEmail,
  validateIdCard,
  validateUrl,
  validateDate,
  validateNumberRange,
  validateStringLength,
  validateArray,
  validateEnum,
  validateObject,
  validateCoordinate,
  validateSportData,
  validateUserData,
  calculateAge,
  formatDate,
  formatDuration,
  formatDistance,
  formatCalories,
  formatPace,
  validateFileType,
  validateFileSize,
  generateRandomString,
  generateUniqueId,
  maskSensitiveData
}