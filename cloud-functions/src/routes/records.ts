import { Router, Request, Response } from 'express'
import { ResponseUtil, ValidationUtil, Logger, PaginationUtil } from '../utils'
import { asyncHandler } from '../middleware'
import { SportsType } from '../types'

const router = Router()

/**
 * 创建运动记录
 */
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    type,
    duration,
    distance,
    calories,
    heartRate,
    speed,
    location,
    weather,
    notes,
    tags,
    images,
    videos,
    isPublic = true
  } = req.body

  // 参数验证
  if (!type || !ValidationUtil.isValidSportsType(type)) {
    res.status(400).json(ResponseUtil.error('请提供有效的运动类型', 400))
    return
  }

  if (!duration || duration <= 0) {
    res.status(400).json(ResponseUtil.error('请提供有效的运动时长', 400))
    return
  }

  if (!calories || calories <= 0) {
    res.status(400).json(ResponseUtil.error('请提供有效的消耗卡路里', 400))
    return
  }

  if (heartRate) {
    if (heartRate.average && (heartRate.average < 40 || heartRate.average > 220)) {
      res.status(400).json(ResponseUtil.error('平均心率必须在40-220之间', 400))
      return
    }
    if (heartRate.max && (heartRate.max < 40 || heartRate.max > 250)) {
      res.status(400).json(ResponseUtil.error('最大心率必须在40-250之间', 400))
      return
    }
  }

  Logger.info('创建运动记录', { type, duration, calories })

  // 这里应该实现真实的记录创建逻辑
  const newRecord = {
    _id: 'mock-record-id',
    userId: 'mock-user-id',
    type: type as SportsType,
    duration,
    distance,
    calories,
    heartRate,
    speed,
    location,
    weather,
    notes,
    tags: tags || [],
    images: images || [],
    videos: videos || [],
    isPublic,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  res.status(201).json(ResponseUtil.success(newRecord, '运动记录创建成功'))
}))

/**
 * 获取运动记录列表
 */
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    pageSize = 20,
    type
    // userId, // 暂不使用的参数
    // isPublic,
    // startDate,
    // endDate,
    // tags,
    // sortBy = 'createdAt',
    // sortOrder = 'desc'
  } = req.query as any

  // 验证分页参数
  const paginationValidation = PaginationUtil.validatePagination(Number(page), Number(pageSize))
  if (!paginationValidation.valid) {
    res.status(400).json(ResponseUtil.error(paginationValidation.errors.join(', '), 400))
    return
  }

  // 验证运动类型
  if (type && !ValidationUtil.isValidSportsType(type as string)) {
    res.status(400).json(ResponseUtil.error('无效的运动类型', 400))
    return
  }

  Logger.info('获取运动记录列表', { page, pageSize, type })

  // 这里应该实现真实的记录查询逻辑
  const mockRecords = [
    {
      _id: 'mock-record-1',
      userId: 'mock-user-id',
      type: SportsType.RUNNING,
      duration: 30,
      distance: 5.2,
      calories: 300,
      heartRate: { average: 120, max: 150, min: 80 },
      speed: { average: 10.4, max: 12.0 },
      location: { latitude: 31.2304, longitude: 121.4737, address: '上海市' },
      weather: { temperature: 20, condition: '晴', humidity: 60 },
      notes: '今天状态不错，跑了5公里',
      tags: ['晨跑', '户外'],
      images: ['image1.jpg'],
      videos: [],
      isPublic: true,
      likesCount: 5,
      commentsCount: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'mock-record-2',
      userId: 'mock-user-id',
      type: SportsType.CYCLING,
      duration: 60,
      distance: 20.5,
      calories: 500,
      heartRate: { average: 110, max: 140, min: 70 },
      speed: { average: 20.5, max: 25.0 },
      location: { latitude: 31.2304, longitude: 121.4737, address: '上海市' },
      weather: { temperature: 22, condition: '多云', humidity: 55 },
      notes: '骑行到郊区，风景很好',
      tags: ['骑行', '周末'],
      images: ['image2.jpg', 'image3.jpg'],
      videos: [],
      isPublic: true,
      likesCount: 8,
      commentsCount: 3,
      createdAt: new Date(Date.now() - 86400000), // 昨天
      updatedAt: new Date(Date.now() - 86400000)
    }
  ]

  const paginatedResult = {
    items: mockRecords,
    total: 2,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }

  res.json(ResponseUtil.success(paginatedResult))
}))

/**
 * 获取运动记录详情
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (!id) {
    res.status(400).json(ResponseUtil.error('请提供记录ID', 400))
    return
  }

  Logger.info('获取运动记录详情', { id })

  // 这里应该实现真实的记录查询逻辑
  const mockRecord = {
    _id: id,
    userId: 'mock-user-id',
    type: SportsType.RUNNING,
    duration: 30,
    distance: 5.2,
    calories: 300,
    heartRate: { average: 120, max: 150, min: 80 },
    speed: { average: 10.4, max: 12.0 },
    location: { latitude: 31.2304, longitude: 121.4737, address: '上海市浦东新区' },
    weather: { temperature: 20, condition: '晴', humidity: 60 },
    notes: '今天状态不错，跑了5公里',
    tags: ['晨跑', '户外'],
    images: ['image1.jpg'],
    videos: [],
    isPublic: true,
    likesCount: 5,
    commentsCount: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  res.json(ResponseUtil.success(mockRecord))
}))

/**
 * 更新运动记录
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const {
    duration,
    distance,
    calories,
    heartRate,
    speed,
    notes,
    tags,
    isPublic
  } = req.body

  if (!id) {
    res.status(400).json(ResponseUtil.error('请提供记录ID', 400))
    return
  }

  // 验证参数
  if (duration !== undefined && duration <= 0) {
    res.status(400).json(ResponseUtil.error('请提供有效的运动时长', 400))
    return
  }

  if (calories !== undefined && calories <= 0) {
    res.status(400).json(ResponseUtil.error('请提供有效的消耗卡路里', 400))
    return
  }

  if (heartRate) {
    if (heartRate.average && (heartRate.average < 40 || heartRate.average > 220)) {
      res.status(400).json(ResponseUtil.error('平均心率必须在40-220之间', 400))
      return
    }
    if (heartRate.max && (heartRate.max < 40 || heartRate.max > 250)) {
      res.status(400).json(ResponseUtil.error('最大心率必须在40-250之间', 400))
      return
    }
  }

  Logger.info('更新运动记录', { id })

  // 这里应该实现真实的记录更新逻辑
  const updatedRecord = {
    _id: id,
    userId: 'mock-user-id',
    type: SportsType.RUNNING,
    duration: duration || 30,
    distance: distance || 5.2,
    calories: calories || 300,
    heartRate: heartRate || { average: 120, max: 150, min: 80 },
    speed: speed || { average: 10.4, max: 12.0 },
    notes: notes || '今天状态不错，跑了5公里',
    tags: tags || ['晨跑', '户外'],
    isPublic: isPublic !== undefined ? isPublic : true,
    likesCount: 5,
    commentsCount: 2,
    updatedAt: new Date()
  }

  res.json(ResponseUtil.success(updatedRecord, '运动记录更新成功'))
}))

/**
 * 删除运动记录
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (!id) {
    res.status(400).json(ResponseUtil.error('请提供记录ID', 400))
    return
  }

  Logger.info('删除运动记录', { id })

  // 这里应该实现真实的记录删除逻辑
  res.json(ResponseUtil.success(null, '运动记录删除成功'))
}))

export default router