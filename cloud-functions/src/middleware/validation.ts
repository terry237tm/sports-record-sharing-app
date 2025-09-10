import { Request, Response, NextFunction } from 'express'
import { validationMiddleware as enhancedValidationMiddleware, ValidationRule } from '../utils/validation'
import { ResponseUtil } from '../utils'
import { logger } from '../utils/logger'

/**
 * 请求验证中间件 - 增强版
 * 提供全面的请求参数验证功能
 */

/**
 * 请求验证配置接口
 */
export interface ValidationConfig {
  body?: Record<string, ValidationRule>    // 请求体验证规则
  query?: Record<string, ValidationRule>   // 查询参数验证规则
  params?: Record<string, ValidationRule>  // 路由参数验证规则
  headers?: Record<string, ValidationRule> // 请求头验证规则
  allowUnknown?: boolean                   // 是否允许未知字段
  stripUnknown?: boolean                   // 是否剥离未知字段
  abortEarly?: boolean                     // 是否在第一个错误时停止
}

/**
 * 验证错误响应格式化
 */
const formatValidationErrors = (errors: any[]) => {
  return errors.map(error => ({
    field: error.field,
    message: error.message,
    value: error.value
  }))
}

/**
 * 请求体验证中间件
 */
export const validateBody = (schema: Record<string, ValidationRule>, options: Partial<ValidationConfig> = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = new enhancedValidationMiddleware.EnhancedValidator()
      const result = validator.validateObjectSchema(req.body, schema)
      
      if (!result.valid) {
        logger.warn('请求体验证失败', {
          url: req.url,
          method: req.method,
          errors: result.errors,
          body: req.body
        })
        
        return res.status(400).json(ResponseUtil.error('请求参数验证失败', 400, {
          code: 'VALIDATION_ERROR',
          errors: formatValidationErrors(result.errors),
          details: {
            location: 'body',
            fields: result.errors.map(e => e.field)
          }
        }))
      }
      
      next()
    } catch (error) {
      logger.error('请求体验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('验证过程发生错误', 500))
    }
  }
}

/**
 * 查询参数验证中间件
 */
export const validateQuery = (schema: Record<string, ValidationRule>, options: Partial<ValidationConfig> = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = new enhancedValidationMiddleware.EnhancedValidator()
      const result = validator.validateObjectSchema(req.query, schema)
      
      if (!result.valid) {
        logger.warn('查询参数验证失败', {
          url: req.url,
          method: req.method,
          errors: result.errors,
          query: req.query
        })
        
        return res.status(400).json(ResponseUtil.error('查询参数验证失败', 400, {
          code: 'VALIDATION_ERROR',
          errors: formatValidationErrors(result.errors),
          details: {
            location: 'query',
            fields: result.errors.map(e => e.field)
          }
        }))
      }
      
      next()
    } catch (error) {
      logger.error('查询参数验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('验证过程发生错误', 500))
    }
  }
}

/**
 * 路由参数验证中间件
 */
export const validateParams = (schema: Record<string, ValidationRule>, options: Partial<ValidationConfig> = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = new enhancedValidationMiddleware.EnhancedValidator()
      const result = validator.validateObjectSchema(req.params, schema)
      
      if (!result.valid) {
        logger.warn('路由参数验证失败', {
          url: req.url,
          method: req.method,
          errors: result.errors,
          params: req.params
        })
        
        return res.status(400).json(ResponseUtil.error('路由参数验证失败', 400, {
          code: 'VALIDATION_ERROR',
          errors: formatValidationErrors(result.errors),
          details: {
            location: 'params',
            fields: result.errors.map(e => e.field)
          }
        }))
      }
      
      next()
    } catch (error) {
      logger.error('路由参数验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('验证过程发生错误', 500))
    }
  }
}

/**
 * 请求头验证中间件
 */
export const validateHeaders = (schema: Record<string, ValidationRule>, options: Partial<ValidationConfig> = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = new enhancedValidationMiddleware.EnhancedValidator()
      const result = validator.validateObjectSchema(req.headers, schema)
      
      if (!result.valid) {
        logger.warn('请求头验证失败', {
          url: req.url,
          method: req.method,
          errors: result.errors,
          headers: req.headers
        })
        
        return res.status(400).json(ResponseUtil.error('请求头验证失败', 400, {
          code: 'VALIDATION_ERROR',
          errors: formatValidationErrors(result.errors),
          details: {
            location: 'headers',
            fields: result.errors.map(e => e.field)
          }
        }))
      }
      
      next()
    } catch (error) {
      logger.error('请求头验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('验证过程发生错误', 500))
    }
  }
}

/**
 * 综合验证中间件
 */
export const validateRequest = (config: ValidationConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validator = new enhancedValidationMiddleware.EnhancedValidator()
      const allErrors: any[] = []
      
      // 验证请求体
      if (config.body) {
        const result = validator.validateObjectSchema(req.body, config.body)
        if (!result.valid) {
          allErrors.push(...result.errors.map(error => ({ ...error, location: 'body' })))
        }
      }
      
      // 验证查询参数
      if (config.query) {
        validator.reset()
        const result = validator.validateObjectSchema(req.query, config.query)
        if (!result.valid) {
          allErrors.push(...result.errors.map(error => ({ ...error, location: 'query' })))
        }
      }
      
      // 验证路由参数
      if (config.params) {
        validator.reset()
        const result = validator.validateObjectSchema(req.params, config.params)
        if (!result.valid) {
          allErrors.push(...result.errors.map(error => ({ ...error, location: 'params' })))
        }
      }
      
      // 验证请求头
      if (config.headers) {
        validator.reset()
        const result = validator.validateObjectSchema(req.headers, config.headers)
        if (!result.valid) {
          allErrors.push(...result.errors.map(error => ({ ...error, location: 'headers' })))
        }
      }
      
      // 如果有错误，返回验证失败响应
      if (allErrors.length > 0) {
        logger.warn('请求验证失败', {
          url: req.url,
          method: req.method,
          errors: allErrors
        })
        
        return res.status(400).json(ResponseUtil.error('请求参数验证失败', 400, {
          code: 'VALIDATION_ERROR',
          errors: formatValidationErrors(allErrors),
          details: {
            locations: [...new Set(allErrors.map(e => e.location))],
            fields: allErrors.map(e => e.field)
          }
        }))
      }
      
      next()
    } catch (error) {
      logger.error('请求验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('验证过程发生错误', 500))
    }
  }
}

/**
 * 分页参数验证中间件
 */
export const validatePagination = (options: {
  maxPageSize?: number
  defaultPageSize?: number
  allowZeroPageSize?: boolean
} = {}) => {
  const {
    maxPageSize = 100,
    defaultPageSize = 20,
    allowZeroPageSize = false
  } = options
  
  return validateQuery({
    page: {
      type: 'number',
      required: false,
      min: 1,
      custom: (value) => {
        const page = parseInt(value)
        return page > 0 || '页码必须大于0'
      }
    },
    pageSize: {
      type: 'number',
      required: false,
      min: allowZeroPageSize ? 0 : 1,
      max: maxPageSize,
      custom: (value) => {
        const pageSize = parseInt(value)
        if (pageSize < 0) return '每页条数不能为负数'
        if (pageSize > maxPageSize) return `每页条数不能超过${maxPageSize}`
        return true
      }
    },
    sort: {
      type: 'string',
      required: false,
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*(\.(asc|desc))?$/,
      custom: (value) => {
        return true // 可以添加更复杂的排序字段验证
      }
    },
    order: {
      type: 'string',
      required: false,
      enum: ['asc', 'desc']
    }
  })
}

/**
 * 搜索参数验证中间件
 */
export const validateSearch = (options: {
  maxKeywordLength?: number
  allowEmptyKeyword?: boolean
} = {}) => {
  const {
    maxKeywordLength = 50,
    allowEmptyKeyword = true
  } = options
  
  return validateQuery({
    keyword: {
      type: 'string',
      required: false,
      maxLength: maxKeywordLength,
      custom: (value) => {
        if (!allowEmptyKeyword && !value.trim()) {
          return '搜索关键词不能为空'
        }
        return true
      }
    },
    category: {
      type: 'string',
      required: false,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    startDate: {
      type: 'date',
      required: false
    },
    endDate: {
      type: 'date',
      required: false
    }
  })
}

/**
 * 坐标参数验证中间件
 */
export const validateCoordinates = () => {
  return validateQuery({
    latitude: {
      type: 'number',
      required: true,
      min: -90,
      max: 90,
      custom: (value) => {
        const lat = parseFloat(value)
        if (isNaN(lat)) return '纬度必须是有效数字'
        if (lat < -90 || lat > 90) return '纬度必须在-90到90之间'
        return true
      }
    },
    longitude: {
      type: 'number',
      required: true,
      min: -180,
      max: 180,
      custom: (value) => {
        const lng = parseFloat(value)
        if (isNaN(lng)) return '经度必须是有效数字'
        if (lng < -180 || lng > 180) return '经度必须在-180到180之间'
        return true
      }
    },
    radius: {
      type: 'number',
      required: false,
      min: 0,
      max: 50000, // 最大50公里
      custom: (value) => {
        const radius = parseFloat(value)
        if (isNaN(radius)) return '半径必须是有效数字'
        if (radius < 0) return '半径不能为负数'
        if (radius > 50000) return '搜索半径不能超过50公里'
        return true
      }
    }
  })
}

/**
 * 文件上传验证中间件
 */
export const validateFileUpload = (options: {
  allowedTypes?: string[]
  maxSize?: number
  required?: boolean
  maxCount?: number
} = {}) => {
  const {
    allowedTypes = ['jpg', 'jpeg', 'png', 'gif'],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = false,
    maxCount = 1
  } = options
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 检查是否有文件上传
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        if (required) {
          return res.status(400).json(ResponseUtil.error('必须上传文件', 400))
        }
        return next()
      }
      
      const files = Array.isArray(req.files) ? req.files : [req.files]
      
      // 检查文件数量
      if (files.length > maxCount) {
        return res.status(400).json(ResponseUtil.error(`最多只能上传${maxCount}个文件`, 400))
      }
      
      // 验证每个文件
      for (const file of files) {
        // 检查文件类型
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase()
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return res.status(400).json(ResponseUtil.error(`文件类型不支持，只允许: ${allowedTypes.join(', ')}`, 400))
        }
        
        // 检查文件大小
        if (file.size > maxSize) {
          const maxSizeMB = Math.round(maxSize / (1024 * 1024))
          return res.status(400).json(ResponseUtil.error(`文件大小不能超过${maxSizeMB}MB`, 400))
        }
      }
      
      next()
    } catch (error) {
      logger.error('文件上传验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('文件验证过程发生错误', 500))
    }
  }
}

/**
 * 速率限制验证中间件
 */
export const validateRateLimit = (options: {
  windowMs?: number
  max?: number
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
} = {}) => {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req)
      const now = Date.now()
      
      // 获取或创建请求记录
      let record = requests.get(key)
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + windowMs
        }
        requests.set(key, record)
      }
      
      // 检查是否超过限制
      if (record.count >= max) {
        const resetTime = new Date(record.resetTime)
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)
        
        logger.warn('请求频率限制触发', {
          key,
          count: record.count,
          max,
          ip: req.ip
        })
        
        res.setHeader('X-RateLimit-Limit', max.toString())
        res.setHeader('X-RateLimit-Remaining', '0')
        res.setHeader('X-RateLimit-Reset', resetTime.toISOString())
        res.setHeader('Retry-After', retryAfter.toString())
        
        return res.status(429).json(ResponseUtil.error('请求过于频繁，请稍后再试', 429, {
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter
        }))
      }
      
      // 增加请求计数
      record.count++
      
      // 设置响应头
      const remaining = max - record.count
      res.setHeader('X-RateLimit-Limit', max.toString())
      res.setHeader('X-RateLimit-Remaining', remaining.toString())
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
      
      // 监听响应以更新计数器
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send
        res.send = function(body) {
          if (skipSuccessfulRequests && res.statusCode < 400) {
            record!.count--
          } else if (skipFailedRequests && res.statusCode >= 400) {
            record!.count--
          }
          return originalSend.call(this, body)
        }
      }
      
      next()
    } catch (error) {
      logger.error('速率限制验证中间件错误', error)
      next()
    }
  }
}

/**
 * 内容类型验证中间件
 */
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method === 'GET' || req.method === 'HEAD') {
        return next()
      }
      
      const contentType = req.headers['content-type'] || ''
      
      // 检查内容类型是否允许
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('/')) {
          return contentType.includes(type)
        } else {
          return contentType.includes(`/${type}`)
        }
      })
      
      if (!isAllowed) {
        return res.status(415).json(ResponseUtil.error(`不支持的媒体类型，只允许: ${allowedTypes.join(', ')}`, 415))
      }
      
      next()
    } catch (error) {
      logger.error('内容类型验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('内容类型验证过程发生错误', 500))
    }
  }
}

/**
 * API版本验证中间件
 */
export const validateApiVersion = (supportedVersions: string[] = ['v1']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 从URL路径或请求头获取API版本
      const urlVersion = req.path.match(/^\/api\/(v\d+)/)?.[1]
      const headerVersion = req.headers['api-version'] as string
      const version = urlVersion || headerVersion
      
      if (version && !supportedVersions.includes(version)) {
        return res.status(400).json(ResponseUtil.error(`不支持的API版本: ${version}`, 400, {
          code: 'UNSUPPORTED_API_VERSION',
          supportedVersions
        }))
      }
      
      // 设置当前API版本到请求对象
      ;(req as any).apiVersion = version || supportedVersions[0]
      
      next()
    } catch (error) {
      logger.error('API版本验证中间件错误', error)
      return res.status(500).json(ResponseUtil.error('API版本验证过程发生错误', 500))
    }
  }
}