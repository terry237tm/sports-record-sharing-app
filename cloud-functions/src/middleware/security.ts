/**
 * 安全中间件
 * 提供各种安全相关的中间件功能
 */

import { Request, Response, NextFunction } from 'express'
import { ResponseUtil } from '../utils'
import { logger } from '../utils/logger'

/**
 * CORS 配置接口
 */
export interface CorsConfig {
  origin?: string | string[] | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

/**
 * 安全头配置接口
 */
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: boolean
  xssProtection?: boolean
  noSniff?: boolean
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string
  hsts?: {
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  referrerPolicy?: string
  permissionsPolicy?: string
}

/**
 * 请求限制配置接口
 */
export interface RateLimitConfig {
  windowMs?: number
  max?: number
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
  statusCode?: number
  headers?: boolean
  draft_polli_ratelimit_headers?: boolean
}

/**
 * 默认 CORS 配置
 */
const defaultCorsConfig: CorsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-API-Version',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Size',
    'X-Current-Page',
    'X-Total-Pages',
    'X-Request-ID',
    'X-Response-Time'
  ],
  credentials: true,
  maxAge: 86400, // 24小时
  optionsSuccessStatus: 200
}

/**
 * 默认安全头配置
 */
const defaultSecurityHeadersConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: true,
  xssProtection: true,
  noSniff: true,
  frameOptions: 'DENY',
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()'
}

/**
 * CORS 中间件
 */
export const corsMiddleware = (config: CorsConfig = {}) => {
  const corsConfig = { ...defaultCorsConfig, ...config }
  
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string
    
    // 处理 origin 配置
    let allowOrigin = false
    if (typeof corsConfig.origin === 'string') {
      allowOrigin = corsConfig.origin === origin
      if (allowOrigin) res.setHeader('Access-Control-Allow-Origin', corsConfig.origin)
    } else if (Array.isArray(corsConfig.origin)) {
      allowOrigin = corsConfig.origin.includes(origin)
      if (allowOrigin) res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (typeof corsConfig.origin === 'function') {
      allowOrigin = corsConfig.origin(origin)
      if (allowOrigin) res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (corsConfig.origin === '*') {
      allowOrigin = true
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
    
    // 设置其他 CORS 头
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods?.join(', '))
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders?.join(', '))
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders?.join(', '))
      
      if (corsConfig.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
      }
      
      if (corsConfig.maxAge) {
        res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString())
      }
    }
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(corsConfig.optionsSuccessStatus || 200).end()
      return
    }
    
    next()
  }
}

/**
 * 安全头中间件
 */
export const securityHeadersMiddleware = (config: SecurityHeadersConfig = {}) => {
  const securityConfig = { ...defaultSecurityHeadersConfig, ...config }
  
  return (req: Request, res: Response, next: NextFunction) => {
    // X-Content-Type-Options
    if (securityConfig.noSniff) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }
    
    // X-Frame-Options
    if (securityConfig.frameOptions) {
      res.setHeader('X-Frame-Options', securityConfig.frameOptions)
    }
    
    // X-XSS-Protection
    if (securityConfig.xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }
    
    // Strict-Transport-Security
    if (securityConfig.hsts && req.secure) {
      const hsts = securityConfig.hsts
      let hstsHeader = `max-age=${hsts.maxAge}`
      if (hsts.includeSubDomains) hstsHeader += '; includeSubDomains'
      if (hsts.preload) hstsHeader += '; preload'
      res.setHeader('Strict-Transport-Security', hstsHeader)
    }
    
    // Referrer-Policy
    if (securityConfig.referrerPolicy) {
      res.setHeader('Referrer-Policy', securityConfig.referrerPolicy)
    }
    
    // Permissions-Policy
    if (securityConfig.permissionsPolicy) {
      res.setHeader('Permissions-Policy', securityConfig.permissionsPolicy)
    }
    
    // Content-Security-Policy
    if (securityConfig.contentSecurityPolicy) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
      res.setHeader('Content-Security-Policy', csp)
    }
    
    // 移除可能泄露服务器信息的头
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')
    
    next()
  }
}

/**
 * 请求大小限制中间件
 */
export const requestSizeLimitMiddleware = (options: {
  maxBodySize?: string | number
  maxParameterSize?: string | number
  maxUrlLength?: number
} = {}) => {
  const {
    maxBodySize = '10mb',
    maxParameterSize = '100kb',
    maxUrlLength = 2000
  } = options
  
  return (req: Request, res: Response, next: NextFunction) => {
    // 检查URL长度
    if (req.url.length > maxUrlLength) {
      logger.warn('URL过长', {
        url: req.url,
        urlLength: req.url.length,
        maxUrlLength
      })
      return res.status(414).json(ResponseUtil.error('请求URL过长', 414))
    }
    
    // 检查查询参数大小
    const queryString = req.originalUrl.split('?')[1] || ''
    if (queryString.length > (typeof maxParameterSize === 'string' ? parseInt(maxParameterSize) : maxParameterSize)) {
      logger.warn('查询参数过大', {
        url: req.url,
        queryLength: queryString.length
      })
      return res.status(413).json(ResponseUtil.error('查询参数过大', 413))
    }
    
    next()
  }
}

/**
 * 请求超时中间件
 */
export const requestTimeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let timeoutId: NodeJS.Timeout
    
    // 设置超时
    timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.error('请求超时', {
          url: req.url,
          method: req.method,
          timeout: timeoutMs
        })
        
        res.status(408).json(ResponseUtil.error('请求超时', 408))
      }
    }, timeoutMs)
    
    // 清理超时
    res.on('finish', () => {
      clearTimeout(timeoutId)
    })
    
    res.on('close', () => {
      clearTimeout(timeoutId)
    })
    
    next()
  }
}

/**
 * IP 黑名单中间件
 */
export const ipBlacklistMiddleware = (blacklist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || ''
    
    if (blacklist.includes(clientIp)) {
      logger.warn('IP黑名单拦截', {
        ip: clientIp,
        url: req.url
      })
      
      return res.status(403).json(ResponseUtil.error('访问被拒绝', 403))
    }
    
    next()
  }
}

/**
 * IP 白名单中间件
 */
export const ipWhitelistMiddleware = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 如果没有设置白名单，允许所有访问
    if (whitelist.length === 0) {
      return next()
    }
    
    const clientIp = req.ip || req.connection.remoteAddress || ''
    
    if (!whitelist.includes(clientIp)) {
      logger.warn('IP白名单拦截', {
        ip: clientIp,
        url: req.url
      })
      
      return res.status(403).json(ResponseUtil.error('访问被拒绝', 403))
    }
    
    next()
  }
}

/**
 * 用户代理检查中间件
 */
export const userAgentMiddleware = (options: {
  allowedAgents?: string[]
  blockedAgents?: string[]
  allowEmpty?: boolean
} = {}) => {
  const {
    allowedAgents = [],
    blockedAgents = [],
    allowEmpty = true
  } = options
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers['user-agent'] || ''
    
    // 检查空用户代理
    if (!userAgent && !allowEmpty) {
      logger.warn('空用户代理访问', {
        url: req.url,
        ip: req.ip
      })
      return res.status(400).json(ResponseUtil.error('用户代理不能为空', 400))
    }
    
    // 检查黑名单
    if (blockedAgents.length > 0) {
      for (const blockedAgent of blockedAgents) {
        if (userAgent.toLowerCase().includes(blockedAgent.toLowerCase())) {
          logger.warn('用户代理黑名单拦截', {
            userAgent,
            blockedAgent,
            url: req.url
          })
          return res.status(403).json(ResponseUtil.error('访问被拒绝', 403))
        }
      }
    }
    
    // 检查白名单
    if (allowedAgents.length > 0) {
      let isAllowed = false
      for (const allowedAgent of allowedAgents) {
        if (userAgent.toLowerCase().includes(allowedAgent.toLowerCase())) {
          isAllowed = true
          break
        }
      }
      
      if (!isAllowed) {
        logger.warn('用户代理白名单拦截', {
          userAgent,
          url: req.url
        })
        return res.status(403).json(ResponseUtil.error('访问被拒绝', 403))
      }
    }
    
    next()
  }
}

/**
 * 请求签名验证中间件
 */
export const requestSignatureMiddleware = (options: {
  secretKey: string
  algorithm?: string
  headers?: string[]
  timeout?: number
} = { secretKey: '', algorithm: 'sha256', headers: ['date', 'content-type'], timeout: 300000 }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!options.secretKey) {
      return next()
    }
    
    try {
      const signature = req.headers['x-request-signature'] as string
      const timestamp = req.headers['x-request-timestamp'] as string
      
      if (!signature || !timestamp) {
        logger.warn('缺少请求签名', {
          url: req.url,
          ip: req.ip
        })
        return res.status(401).json(ResponseUtil.error('缺少请求签名', 401))
      }
      
      // 检查时间戳是否过期
      const now = Date.now()
      const requestTime = parseInt(timestamp)
      if (Math.abs(now - requestTime) > (options.timeout || 300000)) {
        logger.warn('请求签名过期', {
          url: req.url,
          requestTime,
          now,
          timeout: options.timeout
        })
        return res.status(401).json(ResponseUtil.error('请求签名过期', 401))
      }
      
      // 这里应该实现实际的签名验证逻辑
      // 简化版本，实际项目中需要使用加密库进行验证
      
      next()
    } catch (error) {
      logger.error('请求签名验证失败', error)
      return res.status(401).json(ResponseUtil.error('请求签名验证失败', 401))
    }
  }
}

/**
 * 防重放攻击中间件
 */
export const replayAttackMiddleware = (options: {
  windowMs?: number
  maxRequests?: number
  keyGenerator?: (req: Request) => string
} = {}) => {
  const {
    windowMs = 60000, // 1分钟
    maxRequests = 5,
    keyGenerator = (req: Request) => `${req.ip}-${req.method}-${req.url}`
  } = options
  
  const requests = new Map<string, number[]>()
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req)
      const now = Date.now()
      
      // 获取该键的请求时间记录
      let timestamps = requests.get(key)
      if (!timestamps) {
        timestamps = []
        requests.set(key, timestamps)
      }
      
      // 清理过期的请求记录
      const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs)
      
      // 检查是否超过限制
      if (validTimestamps.length >= maxRequests) {
        logger.warn('防重放攻击拦截', {
          key,
          requestCount: validTimestamps.length,
          maxRequests,
          windowMs
        })
        
        return res.status(429).json(ResponseUtil.error('请求过于频繁，疑似重放攻击', 429))
      }
      
      // 添加当前请求时间
      validTimestamps.push(now)
      requests.set(key, validTimestamps)
      
      next()
    } catch (error) {
      logger.error('防重放攻击中间件错误', error)
      next()
    }
  }
}

/**
 * 安全日志中间件
 */
export const securityLoggerMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    
    // 记录请求信息
    logger.info('安全日志 - 请求开始', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      authorization: req.headers.authorization ? 'Bearer ***' : undefined
    })
    
    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - start
      
      // 记录安全相关的响应信息
      if (res.statusCode >= 400) {
        logger.warn('安全日志 - 异常响应', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          duration: `${duration}ms`,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        })
      }
      
      // 记录慢请求
      if (duration > 5000) {
        logger.warn('安全日志 - 慢请求', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          ip: req.ip || req.connection.remoteAddress
        })
      }
    })
    
    next()
  }
}

/**
 * 综合安全中间件
 */
export const securityMiddleware = (options: {
  cors?: CorsConfig
  securityHeaders?: SecurityHeadersConfig
  rateLimit?: RateLimitConfig
  enableRequestSizeLimit?: boolean
  requestSizeLimitOptions?: any
  enableTimeout?: boolean
  timeoutMs?: number
  enableIpBlacklist?: boolean
  ipBlacklist?: string[]
  enableIpWhitelist?: boolean
  ipWhitelist?: string[]
  enableUserAgentCheck?: boolean
  userAgentOptions?: any
  enableRequestSignature?: boolean
  requestSignatureOptions?: any
  enableReplayProtection?: boolean
  replayProtectionOptions?: any
  enableSecurityLogging?: boolean
} = {}) => {
  const middlewares = []
  
  // 安全日志中间件（优先级最高）
  if (options.enableSecurityLogging !== false) {
    middlewares.push(securityLoggerMiddleware())
  }
  
  // CORS 中间件
  if (options.cors !== false) {
    middlewares.push(corsMiddleware(options.cors))
  }
  
  // 安全头中间件
  if (options.securityHeaders !== false) {
    middlewares.push(securityHeadersMiddleware(options.securityHeaders))
  }
  
  // 请求大小限制中间件
  if (options.enableRequestSizeLimit !== false) {
    middlewares.push(requestSizeLimitMiddleware(options.requestSizeLimitOptions))
  }
  
  // 请求超时中间件
  if (options.enableTimeout !== false) {
    middlewares.push(requestTimeoutMiddleware(options.timeoutMs))
  }
  
  // IP 白名单中间件
  if (options.enableIpWhitelist) {
    middlewares.push(ipWhitelistMiddleware(options.ipWhitelist || []))
  }
  
  // IP 黑名单中间件
  if (options.enableIpBlacklist) {
    middlewares.push(ipBlacklistMiddleware(options.ipBlacklist || []))
  }
  
  // 用户代理检查中间件
  if (options.enableUserAgentCheck) {
    middlewares.push(userAgentMiddleware(options.userAgentOptions))
  }
  
  // 请求签名验证中间件
  if (options.enableRequestSignature) {
    middlewares.push(requestSignatureMiddleware(options.requestSignatureOptions))
  }
  
  // 防重放攻击中间件
  if (options.enableReplayProtection) {
    middlewares.push(replayAttackMiddleware(options.replayProtectionOptions))
  }
  
  return middlewares
}