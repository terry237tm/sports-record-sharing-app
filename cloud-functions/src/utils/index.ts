import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { JwtPayload } from '../types'
import config from '../config'

/**
 * JWT 工具函数
 */
export class JwtUtil {
  /**
   * 生成 JWT token
   */
  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any
    })
  }

  /**
   * 验证 JWT token
   */
  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret) as JwtPayload
  }

  /**
   * 从 token 中提取载荷
   */
  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null
  }
}

/**
 * 加密工具函数
 */
export class CryptoUtil {
  /**
   * 密码加密
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds)
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 生成验证码
   */
  static generateVerificationCode(length: number = 6): string {
    const numbers = '0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }
    return result
  }
}

/**
 * 日期工具函数
 */
export class DateUtil {
  /**
   * 格式化日期
   */
  static formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
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
   * 获取今天的开始时间
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    return start
  }

  /**
   * 获取今天的结束时间
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return end
  }

  /**
   * 获取一周的开始时间（周一）
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // 调整为周一
    start.setDate(diff)
    return DateUtil.getStartOfDay(start)
  }

  /**
   * 获取一月的开始时间
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    const start = new Date(date)
    start.setDate(1)
    return DateUtil.getStartOfDay(start)
  }
}

/**
 * 验证工具函数
 */
export class ValidationUtil {
  /**
   * 验证手机号
   */
  static isValidPhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone)
  }

  /**
   * 验证邮箱
   */
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * 验证身份证
   */
  static isValidIdCard(idCard: string): boolean {
    return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)
  }

  /**
   * 验证运动类型
   */
  static isValidSportsType(type: string): boolean {
    const validTypes = [
      'running', 'cycling', 'swimming', 'walking', 'fitness',
      'basketball', 'football', 'tennis', 'badminton', 'yoga',
      'pilates', 'dancing', 'climbing', 'skiing', 'other'
    ]
    return validTypes.includes(type)
  }

  /**
   * 验证文件类型
   */
  static isValidFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension ? allowedTypes.includes(extension) : false
  }

  /**
   * 验证文件大小
   */
  static isValidFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize
  }
}

/**
 * 响应工具函数
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(data: T, message: string = '操作成功'): any {
    return {
      success: true,
      code: 200,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 错误响应
   */
  static error(message: string, code: number = 500, details?: any): any {
    return {
      success: false,
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    }
  }

  /**
   * 分页响应
   */
  static paginate<T>(items: T[], total: number, page: number, pageSize: number): any {
    const totalPages = Math.ceil(total / pageSize)
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 分页工具函数
 */
export class PaginationUtil {
  /**
   * 计算分页参数
   */
  static calculatePagination(page: number = 1, pageSize: number = 20): { skip: number; limit: number } {
    const validPage = Math.max(1, page)
    const validPageSize = Math.min(Math.max(1, pageSize), 100) // 最大100条
    const skip = (validPage - 1) * validPageSize
    
    return { skip, limit: validPageSize }
  }

  /**
   * 验证分页参数
   */
  static validatePagination(page: number, pageSize: number): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (page < 1) {
      errors.push('页码必须大于等于1')
    }
    
    if (pageSize < 1 || pageSize > 100) {
      errors.push('每页条数必须在1-100之间')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * 日志工具函数
 */
export class Logger {
  private static formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`
  }

  static info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('info', message, ...args))
  }

  static error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('error', message, ...args))
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('warn', message, ...args))
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env['DEBUG'] === 'true') {
      console.debug(this.formatMessage('debug', message, ...args))
    }
  }
}

