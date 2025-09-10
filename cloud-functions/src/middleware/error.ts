import { Request, Response, NextFunction } from 'express'
import { ResponseUtil, Logger } from '../utils'

/**
 * 错误处理中间件
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const errorContext = {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    userId: (req as any).user?.userId || 'anonymous'
  }

  // 根据错误级别记录日志
  if (err.statusCode >= 500 || err.statusCode === undefined) {
    Logger.error('系统错误', errorContext)
  } else if (err.statusCode >= 400) {
    Logger.warn('客户端错误', errorContext)
  } else {
    Logger.info('应用错误', errorContext)
  }

  // 默认错误信息
  let statusCode = 500
  let message = '服务器内部错误'
  let code = 'INTERNAL_ERROR'

  // 根据错误类型设置不同的响应
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = '参数验证失败'
    code = 'VALIDATION_ERROR'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = '参数格式错误'
    code = 'INVALID_PARAMETER'
  } else if (err.code === 11000) {
    statusCode = 409
    message = '数据已存在'
    code = 'DUPLICATE_DATA'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = '认证令牌无效'
    code = 'INVALID_TOKEN'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = '认证令牌已过期'
    code = 'TOKEN_EXPIRED'
  } else if (err.status === 404 || err.statusCode === 404) {
    statusCode = 404
    message = '资源不存在'
    code = 'NOT_FOUND'
  } else if (err.status === 403 || err.statusCode === 403) {
    statusCode = 403
    message = '权限不足'
    code = 'FORBIDDEN'
  } else if (err.status === 401 || err.statusCode === 401) {
    statusCode = 401
    message = '未认证'
    code = 'UNAUTHORIZED'
  } else if (err.status === 429 || err.statusCode === 429) {
    statusCode = 429
    message = '请求过于频繁'
    code = 'RATE_LIMIT_EXCEEDED'
  }

  // 开发环境显示详细错误信息
  const details = process.env['NODE_ENV'] === 'development' ? {
    stack: err.stack,
    originalError: err.message
  } : undefined

  res.status(statusCode).json(ResponseUtil.error(message, statusCode, {
    code,
    ...(details && { details })
  }))
}

/**
 * 404 处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  Logger.warn('404 错误', {
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString()
  })
  
  res.status(404).json(ResponseUtil.error('请求的资源不存在', 404, {
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method
  }))
}

/**
 * 异步错误包装器
 * 用于捕获异步函数中的错误并传递给错误处理中间件
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = fn(req, res, next)
    if (result && typeof result.catch === 'function') {
      result.catch((error: any) => {
        Logger.error('异步函数错误', {
          error: error.message,
          stack: error.stack,
          url: req.url,
          method: req.method,
          functionName: fn.name || 'anonymous'
        })
        next(error)
      })
    }
    return result
  } catch (error) {
    Logger.error('同步函数错误', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      url: req.url,
      method: req.method,
      functionName: fn.name || 'anonymous'
    })
    next(error)
  }
}

/**
 * 创建自定义错误
 */
export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    
    // 保持正确的错误栈跟踪
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * 资源不存在错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 404, 'NOT_FOUND')
  }
}

/**
 * 重复数据错误
 */
export class DuplicateError extends AppError {
  constructor(message: string = '数据已存在') {
    super(message, 409, 'DUPLICATE_DATA')
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}