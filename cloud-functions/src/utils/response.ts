/**
 * 响应标准化工具
 * 提供统一的响应格式和处理功能
 */

import { Response } from 'express'
import { logger } from './logger'

/**
 * 响应状态枚举
 */
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 响应代码枚举
 */
export enum ResponseCode {
  // 成功响应
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // 客户端错误
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // 服务器错误
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

/**
 * 基础响应接口
 */
export interface BaseResponse<T = any> {
  success: boolean
  code: number
  message: string
  data?: T
  timestamp: string
  requestId?: string
  path?: string
  method?: string
}

/**
 * 错误响应接口
 */
export interface ErrorResponse extends BaseResponse {
  success: false
  error?: {
    code: string
    message: string
    details?: any
    stack?: string
  }
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = any> extends BaseResponse<T[]> {
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 列表响应接口
 */
export interface ListResponse<T = any> extends BaseResponse<T[]> {
  count: number
}

/**
 * 元数据响应接口
 */
export interface MetadataResponse<T = any> extends BaseResponse<T> {
  metadata: {
    version: string
    source: string
    processedAt: string
    [key: string]: any
  }
}

/**
 * 响应构建器类
 */
export class ResponseBuilder<T = any> {
  private response: Partial<BaseResponse<T>> = {}
  private requestId: string = ''
  private path: string = ''
  private method: string = ''

  constructor() {
    this.response.timestamp = new Date().toISOString()
  }

  /**
   * 设置请求上下文
   */
  setContext(req?: any): this {
    if (req) {
      this.requestId = req.headers['x-request-id'] || this.generateRequestId()
      this.path = req.path || req.url
      this.method = req.method
      
      this.response.requestId = this.requestId
      this.response.path = this.path
      this.response.method = this.method
    }
    return this
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 设置成功响应
   */
  success(data?: T, message: string = '操作成功'): this {
    this.response.success = true
    this.response.code = ResponseCode.OK
    this.response.message = message
    this.response.data = data
    return this
  }

  /**
   * 设置创建成功响应
   */
  created(data?: T, message: string = '创建成功'): this {
    this.response.success = true
    this.response.code = ResponseCode.CREATED
    this.response.message = message
    this.response.data = data
    return this
  }

  /**
   * 设置错误响应
   */
  error(message: string, code: ResponseCode = ResponseCode.INTERNAL_SERVER_ERROR, details?: any): this {
    this.response.success = false
    this.response.code = code
    this.response.message = message
    this.response.error = {
      code: this.getErrorCode(code),
      message,
      details
    }
    return this
  }

  /**
   * 设置客户端错误响应
   */
  clientError(message: string, code: ResponseCode = ResponseCode.BAD_REQUEST, details?: any): this {
    return this.error(message, code, details)
  }

  /**
   * 设置服务器错误响应
   */
  serverError(message: string = '服务器内部错误', details?: any): this {
    return this.error(message, ResponseCode.INTERNAL_SERVER_ERROR, details)
  }

  /**
   * 设置未找到响应
   */
  notFound(resource: string = '资源'): this {
    return this.error(`${resource}不存在`, ResponseCode.NOT_FOUND)
  }

  /**
   * 设置未授权响应
   */
  unauthorized(message: string = '未授权访问'): this {
    return this.error(message, ResponseCode.UNAUTHORIZED)
  }

  /**
   * 设置权限不足响应
   */
  forbidden(message: string = '权限不足'): this {
    return this.error(message, ResponseCode.FORBIDDEN)
  }

  /**
   * 设置分页响应
   */
  paginated(data: T[], total: number, page: number = 1, pageSize: number = 20): this {
    const totalPages = Math.ceil(total / pageSize)
    const response: PaginatedResponse<T> = {
      success: true,
      code: ResponseCode.OK,
      message: '查询成功',
      data,
      timestamp: this.response.timestamp!,
      requestId: this.requestId,
      path: this.path,
      method: this.method,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
    
    this.response = response
    return this
  }

  /**
   * 设置列表响应
   */
  list(data: T[], count?: number): this {
    const response: ListResponse<T> = {
      success: true,
      code: ResponseCode.OK,
      message: '查询成功',
      data,
      count: count ?? data.length,
      timestamp: this.response.timestamp!,
      requestId: this.requestId,
      path: this.path,
      method: this.method
    }
    
    this.response = response
    return this
  }

  /**
   * 设置元数据响应
   */
  withMetadata(data: T, metadata: any): this {
    const response: MetadataResponse<T> = {
      success: true,
      code: ResponseCode.OK,
      message: '查询成功',
      data,
      metadata: {
        version: '1.0.0',
        source: 'sports-record-api',
        processedAt: new Date().toISOString(),
        ...metadata
      },
      timestamp: this.response.timestamp!,
      requestId: this.requestId,
      path: this.path,
      method: this.method
    }
    
    this.response = response
    return this
  }

  /**
   * 添加警告信息
   */
  withWarning(message: string, details?: any): this {
    if (this.response.success) {
      (this.response as any).warning = { message, details }
    }
    return this
  }

  /**
   * 添加调试信息（仅在开发环境）
   */
  withDebug(debug: any): this {
    if (process.env.NODE_ENV === 'development') {
      (this.response as any).debug = debug
    }
    return this
  }

  /**
   * 获取错误代码
   */
  private getErrorCode(code: ResponseCode): string {
    const errorCodes = {
      [ResponseCode.BAD_REQUEST]: 'BAD_REQUEST',
      [ResponseCode.UNAUTHORIZED]: 'UNAUTHORIZED',
      [ResponseCode.FORBIDDEN]: 'FORBIDDEN',
      [ResponseCode.NOT_FOUND]: 'NOT_FOUND',
      [ResponseCode.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
      [ResponseCode.CONFLICT]: 'CONFLICT',
      [ResponseCode.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [ResponseCode.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [ResponseCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [ResponseCode.NOT_IMPLEMENTED]: 'NOT_IMPLEMENTED',
      [ResponseCode.BAD_GATEWAY]: 'BAD_GATEWAY',
      [ResponseCode.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE'
    }
    
    return errorCodes[code] || 'UNKNOWN_ERROR'
  }

  /**
   * 构建响应
   */
  build(): BaseResponse<T> {
    return this.response as BaseResponse<T>
  }

  /**
   * 发送响应
   */
  send(res: Response): Response {
    const response = this.build()
    
    // 记录响应日志
    if (response.success) {
      logger.info('响应成功', {
        code: response.code,
        message: response.message,
        requestId: response.requestId,
        path: response.path,
        method: response.method
      })
    } else {
      logger.error('响应错误', {
        code: response.code,
        message: response.message,
        requestId: response.requestId,
        path: response.path,
        method: response.method,
        error: response.error
      })
    }
    
    return res.status(response.code).json(response)
  }
}

/**
 * 响应工具类 - 向后兼容
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(data?: T, message: string = '操作成功'): BaseResponse<T> {
    return new ResponseBuilder<T>()
      .success(data, message)
      .build()
  }

  /**
   * 错误响应
   */
  static error(message: string, code: number = ResponseCode.INTERNAL_SERVER_ERROR, details?: any): ErrorResponse {
    return new ResponseBuilder()
      .error(message, code as ResponseCode, details)
      .build() as ErrorResponse
  }

  /**
   * 分页响应
   */
  static paginate<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResponse<T> {
    return new ResponseBuilder<T>()
      .paginated(items, total, page, pageSize)
      .build() as PaginatedResponse<T>
  }

  /**
   * 创建成功响应
   */
  static created<T>(data?: T, message: string = '创建成功'): BaseResponse<T> {
    return new ResponseBuilder<T>()
      .created(data, message)
      .build()
  }

  /**
   * 未找到响应
   */
  static notFound(resource: string = '资源'): ErrorResponse {
    return new ResponseBuilder()
      .notFound(resource)
      .build() as ErrorResponse
  }

  /**
   * 未授权响应
   */
  static unauthorized(message: string = '未授权访问'): ErrorResponse {
    return new ResponseBuilder()
      .unauthorized(message)
      .build() as ErrorResponse
  }

  /**
   * 权限不足响应
   */
  static forbidden(message: string = '权限不足'): ErrorResponse {
    return new ResponseBuilder()
      .forbidden(message)
      .build() as ErrorResponse
  }
}

/**
 * 快速响应构建器
 */
export const response = {
  /**
   * 成功响应
   */
  success: <T>(data?: T, message?: string) => new ResponseBuilder<T>().success(data, message),
  
  /**
   * 创建成功响应
   */
  created: <T>(data?: T, message?: string) => new ResponseBuilder<T>().created(data, message),
  
  /**
   * 错误响应
   */
  error: (message: string, code?: ResponseCode, details?: any) => new ResponseBuilder().error(message, code, details),
  
  /**
   * 客户端错误
   */
  badRequest: (message: string, details?: any) => new ResponseBuilder().clientError(message, ResponseCode.BAD_REQUEST, details),
  
  /**
   * 未授权
   */
  unauthorized: (message?: string) => new ResponseBuilder().unauthorized(message),
  
  /**
   * 权限不足
   */
  forbidden: (message?: string) => new ResponseBuilder().forbidden(message),
  
  /**
   * 未找到
   */
  notFound: (resource?: string) => new ResponseBuilder().notFound(resource),
  
  /**
   * 分页响应
   */
  paginated: <T>(data: T[], total: number, page?: number, pageSize?: number) => new ResponseBuilder<T>().paginated(data, total, page, pageSize),
  
  /**
   * 列表响应
   */
  list: <T>(data: T[], count?: number) => new ResponseBuilder<T>().list(data, count),
  
  /**
   * 带元数据的响应
   */
  withMetadata: <T>(data: T, metadata: any) => new ResponseBuilder<T>().withMetadata(data, metadata)
}

/**
 * 响应中间件 - 为所有响应添加标准格式
 */
export const responseMiddleware = () => {
  return (req: any, res: any, next: any) => {
    // 保存原始的json方法
    const originalJson = res.json
    
    // 重写json方法
    res.json = function(body: any) {
      // 如果响应已经格式化，直接返回
      if (body && typeof body === 'object' && body.success !== undefined) {
        return originalJson.call(this, body)
      }
      
      // 如果是错误响应，包装成标准格式
      if (res.statusCode >= 400) {
        const response = new ResponseBuilder()
          .error(
            body.message || '请求处理失败',
            res.statusCode as ResponseCode,
            body
          )
          .setContext(req)
          .build()
        
        return originalJson.call(this, response)
      }
      
      // 如果是成功响应，包装成标准格式
      const response = new ResponseBuilder()
        .success(body)
        .setContext(req)
        .build()
      
      return originalJson.call(this, response)
    }
    
    next()
  }
}

/**
 * 性能监控中间件
 */
export const performanceMiddleware = () => {
  return (req: any, res: any, next: any) => {
    const start = process.hrtime.bigint()
    
    // 重写send方法以计算响应时间
    const originalSend = res.send
    res.send = function(body: any) {
      const end = process.hrtime.bigint()
      const responseTime = Number(end - start) / 1000000 // 转换为毫秒
      
      // 添加响应时间到头信息
      res.setHeader('X-Response-Time', `${responseTime}ms`)
      
      // 记录性能日志
      logger.logPerformance('request_response_time', responseTime, 'ms')
      
      if (responseTime > 1000) {
        logger.warn('响应时间过长', {
          url: req.url,
          method: req.method,
          responseTime: `${responseTime}ms`
        })
      }
      
      return originalSend.call(this, body)
    }
    
    next()
  }
}

export default ResponseUtil