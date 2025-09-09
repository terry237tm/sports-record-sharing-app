/**
 * CloudBase 云开发工具函数
 */

import cloudbase from '@cloudbase/node-sdk'
import { AppError } from '../types'
import { ERROR_CODES, createAppError } from './index'

// 云开发实例
let app: cloudbase.app.App | null = null

/**
 * 初始化 CloudBase
 */
export function initCloudBase() {
  if (!app) {
    app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV,
      region: 'ap-beijing' // 根据实际情况调整
    })
  }
  return app
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!app) {
    initCloudBase()
  }
  return app!.database()
}

/**
 * 获取云函数实例
 */
export function getCloudFunction() {
  if (!app) {
    initCloudBase()
  }
  return app!.callFunction
}

/**
 * 获取存储实例
 */
export function getStorage() {
  if (!app) {
    initCloudBase()
  }
  return app!.storage
}

/**
 * 获取用户信息
 */
export async function getUserInfo(openid: string) {
  try {
    const db = getDatabase()
    const result = await db.collection('users').doc(openid).get()
    
    if (result.data && result.data.length > 0) {
      return result.data[0]
    }
    
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw createAppError(ERROR_CODES.DATABASE_ERROR, '获取用户信息失败')
  }
}

/**
 * 检查用户是否存在
 */
export async function checkUserExists(openid: string): Promise<boolean> {
  try {
    const userInfo = await getUserInfo(openid)
    return userInfo !== null
  } catch (error) {
    console.error('检查用户存在失败:', error)
    return false
  }
}

/**
 * 创建或更新用户
 */
export async function createOrUpdateUser(userData: any) {
  try {
    const db = getDatabase()
    const { openid, ...updateData } = userData
    
    const result = await db.collection('users').doc(openid).set({
      ...updateData,
      _openid: openid,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true })
    
    return result
  } catch (error) {
    console.error('创建或更新用户失败:', error)
    throw createAppError(ERROR_CODES.DATABASE_ERROR, '创建或更新用户失败')
  }
}

/**
 * 上传文件到云存储
 */
export async function uploadFile(
  cloudPath: string,
  fileContent: Buffer | string,
  options: any = {}
) {
  try {
    const storage = getStorage()
    const result = await storage.uploadFile({
      cloudPath,
      fileContent,
      ...options
    })
    
    return result
  } catch (error) {
    console.error('文件上传失败:', error)
    throw createAppError(ERROR_CODES.FILE_UPLOAD_FAILED, '文件上传失败')
  }
}

/**
 * 从云存储下载文件
 */
export async function downloadFile(fileID: string) {
  try {
    const storage = getStorage()
    const result = await storage.downloadFile({
      fileID
    })
    
    return result
  } catch (error) {
    console.error('文件下载失败:', error)
    throw createAppError(ERROR_CODES.NETWORK_ERROR, '文件下载失败')
  }
}

/**
 * 删除云存储文件
 */
export async function deleteFile(fileID: string) {
  try {
    const storage = getStorage()
    const result = await storage.deleteFile([fileID])
    
    return result
  } catch (error) {
    console.error('文件删除失败:', error)
    throw createAppError(ERROR_CODES.NETWORK_ERROR, '文件删除失败')
  }
}

/**
 * 获取临时文件URL
 */
export async function getTempFileURL(fileID: string) {
  try {
    const storage = getStorage()
    const result = await storage.getTempFileURL([fileID])
    
    if (result.fileList && result.fileList.length > 0) {
      return result.fileList[0].tempFileURL
    }
    
    throw createAppError(ERROR_CODES.FILE_NOT_FOUND, '文件不存在')
  } catch (error) {
    console.error('获取临时文件URL失败:', error)
    throw error
  }
}

/**
 * 调用云函数
 */
export async function callCloudFunction(name: string, data: any = {}) {
  try {
    const callFunction = getCloudFunction()
    const result = await callFunction({
      name,
      data
    })
    
    return result.result
  } catch (error) {
    console.error(`调用云函数 ${name} 失败:`, error)
    throw createAppError(ERROR_CODES.NETWORK_ERROR, '云函数调用失败')
  }
}

/**
 * 数据库查询构建器
 */
export class DatabaseQueryBuilder {
  private collection: string
  private query: any
  private db: any

  constructor(collection: string) {
    this.collection = collection
    this.db = getDatabase()
    this.query = this.db.collection(collection)
  }

  /**
   * 添加查询条件
   */
  where(conditions: Record<string, any>): DatabaseQueryBuilder {
    for (const [field, value] of Object.entries(conditions)) {
      this.query = this.query.where(field, '==', value)
    }
    return this
  }

  /**
   * 添加排序
   */
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): DatabaseQueryBuilder {
    this.query = this.query.orderBy(field, direction)
    return this
  }

  /**
   * 限制返回数量
   */
  limit(count: number): DatabaseQueryBuilder {
    this.query = this.query.limit(count)
    return this
  }

  /**
   * 跳过记录数
   */
  skip(offset: number): DatabaseQueryBuilder {
    this.query = this.query.skip(offset)
    return this
  }

  /**
   * 选择字段
   */
  field(fields: string[]): DatabaseQueryBuilder {
    const fieldObj: Record<string, boolean> = {}
    fields.forEach(field => {
      fieldObj[field] = true
    })
    this.query = this.query.field(fieldObj)
    return this
  }

  /**
   * 执行查询
   */
  async get(): Promise<any[]> {
    try {
      const result = await this.query.get()
      return result.data || []
    } catch (error) {
      console.error('数据库查询失败:', error)
      throw createAppError(ERROR_CODES.DATABASE_ERROR, '数据库查询失败')
    }
  }

  /**
   * 获取单条记录
   */
  async getOne(): Promise<any | null> {
    try {
      const result = await this.query.limit(1).get()
      return result.data && result.data.length > 0 ? result.data[0] : null
    } catch (error) {
      console.error('数据库查询失败:', error)
      throw createAppError(ERROR_CODES.DATABASE_ERROR, '数据库查询失败')
    }
  }

  /**
   * 统计记录数
   */
  async count(): Promise<number> {
    try {
      const result = await this.query.count()
      return result.total || 0
    } catch (error) {
      console.error('数据库统计失败:', error)
      throw createAppError(ERROR_CODES.DATABASE_ERROR, '数据库统计失败')
    }
  }
}

/**
 * 创建数据库查询构建器
 */
export function createQueryBuilder(collection: string): DatabaseQueryBuilder {
  return new DatabaseQueryBuilder(collection)
}

/**
 * 事务处理
 */
export async function runTransaction(
  callback: (transaction: any) => Promise<any>
): Promise<any> {
  try {
    const db = getDatabase()
    const result = await db.runTransaction(callback)
    return result
  } catch (error) {
    console.error('事务处理失败:', error)
    throw createAppError(ERROR_CODES.DATABASE_ERROR, '事务处理失败')
  }
}

/**
 * 批量操作
 */
export async function batchOperation(
  operations: Array<() => Promise<any>>
): Promise<any[]> {
  try {
    const results = await Promise.all(operations)
    return results
  } catch (error) {
    console.error('批量操作失败:', error)
    throw createAppError(ERROR_CODES.DATABASE_ERROR, '批量操作失败')
  }
}

/**
 * 缓存管理
 */
export class CacheManager {
  private cache: Map<string, { data: any; expireTime: number }> = new Map()

  /**
   * 设置缓存
   */
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    const expireTime = Date.now() + ttl
    this.cache.set(key, { data, expireTime })
  }

  /**
   * 获取缓存
   */
  get(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expireTime) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false

    if (Date.now() > cached.expireTime) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()

/**
 * 限流器
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 60) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  /**
   * 检查是否允许请求
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const requests = this.requests.get(identifier)!
    
    // 清理过期请求
    const validRequests = requests.filter(time => time > windowStart)
    this.requests.set(identifier, validRequests)

    // 检查当前窗口内的请求数
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // 添加当前请求
    validRequests.push(now)
    return true
  }

  /**
   * 获取剩余请求数
   */
  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(identifier)) {
      return this.maxRequests
    }

    const requests = this.requests.get(identifier)!
    const validRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }

  /**
   * 重置限流
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
}

// 创建全局限流器实例
export const rateLimiter = new RateLimiter()

// 导出 CloudBase 工具函数
export default {
  initCloudBase,
  getDatabase,
  getCloudFunction,
  getStorage,
  getUserInfo,
  checkUserExists,
  createOrUpdateUser,
  uploadFile,
  downloadFile,
  deleteFile,
  getTempFileURL,
  callCloudFunction,
  createQueryBuilder,
  runTransaction,
  batchOperation,
  cacheManager,
  rateLimiter
}