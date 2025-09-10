import { Request, Response, NextFunction } from 'express'
import { JwtUtil, ResponseUtil } from '../utils'
import { JwtPayload } from '../types'

/**
 * 认证中间件
 * 验证 JWT token 并添加用户信息到请求对象
 */
export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(ResponseUtil.error('未提供有效的认证令牌', 401))
      return
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 验证 token
    const decoded = JwtUtil.verifyToken(token)
    
    // 检查 token 是否过期
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      res.status(401).json(ResponseUtil.error('认证令牌已过期', 401))
      return
    }

    // 将用户信息添加到请求对象
    req.user = decoded
    
    next()
  } catch (error) {
    console.error('认证中间件错误:', error)
    res.status(401).json(ResponseUtil.error('认证失败', 401))
  }
}

/**
 * 可选认证中间件
 * 如果提供了有效的 token，则添加用户信息，否则继续处理
 */
export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = JwtUtil.verifyToken(token)
      req.user = decoded
    }
    next()
  } catch (error) {
    // token 无效时继续处理，不中断请求
    next()
  }
}

/**
 * 管理员认证中间件
 * 验证用户是否为管理员
 */
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(ResponseUtil.error('未认证', 401))
    return
  }

  // 这里可以添加管理员权限检查逻辑
  // 例如检查用户角色或权限位
  const isAdmin = false // 默认不是管理员
  
  if (!isAdmin) {
    res.status(403).json(ResponseUtil.error('权限不足', 403))
    return
  }

  next()
}

/**
 * 获取用户信息
 */
export const getUserInfo = (req: AuthRequest): JwtPayload | null => {
  return req.user || null
}

/**
 * 获取用户ID
 */
export const getUserId = (req: AuthRequest): string | null => {
  return req.user?.userId || null
}

/**
 * 获取用户OpenID
 */
export const getUserOpenId = (req: AuthRequest): string | null => {
  return req.user?.openid || null
}