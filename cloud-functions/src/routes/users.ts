import { Router, Request, Response } from 'express'
import { ResponseUtil, ValidationUtil, Logger } from '../utils'
import { asyncHandler } from '../middleware'

const router = Router()

/**
 * 用户登录
 */
router.post('/login', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body

  if (!code) {
    res.status(400).json(ResponseUtil.error('请提供登录凭证', 400))
    return
  }

  Logger.info('用户登录请求', { code })

  // 这里应该调用小程序登录接口验证 code
  // 暂时返回模拟数据
  const mockUser = {
    _id: 'mock-user-id',
    openid: 'mock-openid',
    nickname: '运动达人',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockToken = 'mock-jwt-token'

  res.json(ResponseUtil.success({
    token: mockToken,
    user: mockUser,
    expiresIn: 7 * 24 * 60 * 60 // 7天
  }, '登录成功'))
}))

/**
 * 用户注册
 */
router.post('/register', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { nickname, phone, email } = req.body

  if (!nickname) {
    res.status(400).json(ResponseUtil.error('请提供昵称', 400))
    return
  }

  if (phone && !ValidationUtil.isValidPhone(phone)) {
    res.status(400).json(ResponseUtil.error('手机号格式不正确', 400))
    return
  }

  if (email && !ValidationUtil.isValidEmail(email)) {
    res.status(400).json(ResponseUtil.error('邮箱格式不正确', 400))
    return
  }

  Logger.info('用户注册请求', { nickname })

  // 这里应该实现真实的用户注册逻辑
  const mockUser = {
    _id: 'mock-user-id',
    openid: 'mock-openid',
    nickname,
    phone,
    email,
    avatar: 'https://example.com/default-avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  res.json(ResponseUtil.success(mockUser, '注册成功'))
}))

/**
 * 获取用户信息
 */
router.get('/profile', asyncHandler(async (_req: Request, res: Response) => {
  // 这里应该从请求中获取用户信息
  const mockUser = {
    _id: 'mock-user-id',
    openid: 'mock-openid',
    nickname: '运动达人',
    avatar: 'https://example.com/avatar.jpg',
    phone: '13800138000',
    email: 'user@example.com',
    gender: 1,
    birthday: '1990-01-01',
    height: 175,
    weight: 70,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  res.json(ResponseUtil.success(mockUser))
}))

/**
 * 更新用户信息
 */
router.put('/profile', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { nickname, phone, email, gender, birthday, height, weight } = req.body

  if (phone && !ValidationUtil.isValidPhone(phone)) {
    res.status(400).json(ResponseUtil.error('手机号格式不正确', 400))
    return
  }

  if (email && !ValidationUtil.isValidEmail(email)) {
    res.status(400).json(ResponseUtil.error('邮箱格式不正确', 400))
    return
  }

  Logger.info('更新用户信息', { nickname })

  // 这里应该实现真实的用户更新逻辑
  const updatedUser = {
    _id: 'mock-user-id',
    openid: 'mock-openid',
    nickname: nickname || '运动达人',
    avatar: 'https://example.com/avatar.jpg',
    phone,
    email,
    gender,
    birthday,
    height,
    weight,
    updatedAt: new Date()
  }

  res.json(ResponseUtil.success(updatedUser, '用户信息更新成功'))
}))

export default router