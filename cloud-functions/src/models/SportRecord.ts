import { BaseModel } from './BaseModel'

/**
 * 运动类型枚举
 */
export enum SportType {
  RUNNING = 'running',
  WALKING = 'walking',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  FITNESS = 'fitness',
  YOGA = 'yoga',
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  BADMINTON = 'badminton',
  TENNIS = 'tennis',
  CLIMBING = 'climbing',
  SKATING = 'skating',
  SKIING = 'skiing',
  OTHER = 'other'
}

/**
 * 运动强度枚举
 */
export enum Intensity {
  LOW = 1,      // 低强度
  MODERATE = 2, // 中等强度
  HIGH = 3,     // 高强度
  EXTREME = 4   // 极高强度
}

/**
 * 记录状态枚举
 */
export enum RecordStatus {
  ACTIVE = 'active',     // 正常
  HIDDEN = 'hidden',     // 隐藏
  DELETED = 'deleted'    // 已删除
}

/**
 * 运动记录数据模型
 * 对应数据库中的运动记录集合
 */
export interface SportRecord extends BaseModel {
  // 基本信息
  userId: string // 用户ID
  sportType: SportType // 运动类型
  title: string // 记录标题
  description?: string // 记录描述
  status: RecordStatus // 记录状态

  // 运动数据
  startTime: Date // 开始时间
  endTime: Date // 结束时间
  duration: number // 运动时长（分钟）
  distance?: number // 运动距离（公里）
  calories: number // 消耗卡路里
  steps?: number // 步数

  // 位置信息
  location?: {
    name?: string // 位置名称
    address?: string // 详细地址
    latitude?: number // 纬度
    longitude?: number // 经度
  }

  // 轨迹数据
  trackPoints?: Array<{
    latitude: number
    longitude: number
    altitude?: number
    speed?: number
    timestamp: Date
  }>

  // 心率数据
  heartRate?: {
    avg?: number // 平均心率
    max?: number // 最大心率
    min?: number // 最小心率
    data?: Array<{
      value: number
      timestamp: Date
    }>
  }

  // 配速信息
  pace?: {
    avg?: number // 平均配速（分钟/公里）
    best?: number // 最佳配速
    splits?: Array<{
      distance: number // 分段距离
      time: number // 分段用时
      pace: number // 分段配速
    }>
  }

  // 强度信息
  intensity: Intensity // 运动强度
  trainingLoad?: number // 训练负荷

  // 天气信息
  weather?: {
    condition: string // 天气状况
    temperature: number // 温度（摄氏度）
    humidity?: number // 湿度（%）
    windSpeed?: number // 风速（km/h）
  }

  // 设备信息
  device?: {
    name?: string // 设备名称
    type?: string // 设备类型
    version?: string // 设备版本
  }

  // 媒体文件
  mediaIds?: string[] // 关联的媒体文件ID列表
  thumbnailId?: string // 缩略图ID

  // 社交数据
  likesCount: number // 点赞数
  commentsCount: number // 评论数
  sharesCount: number // 分享数
  isPublic: boolean // 是否公开

  // 标签
  tags?: string[] // 标签列表

  // 个人记录
  personalRecords?: {
    distance?: boolean // 是否创造距离记录
    duration?: boolean // 是否创造时长记录
    speed?: boolean // 是否创造速度记录
  }

  // 同步状态
  syncStatus: {
    synced: boolean // 是否已同步
    syncTime?: Date // 同步时间
    deviceId?: string // 设备ID
  }
}

/**
 * 创建运动记录数据
 */
export interface CreateSportRecordData {
  sportType: SportType
  title: string
  description?: string
  startTime: Date
  endTime: Date
  duration: number
  distance?: number
  calories: number
  steps?: number
  location?: {
    name?: string
    address?: string
    latitude?: number
    longitude?: number
  }
  trackPoints?: Array<{
    latitude: number
    longitude: number
    altitude?: number
    speed?: number
    timestamp: Date
  }>
  heartRate?: {
    avg?: number
    max?: number
    min?: number
    data?: Array<{
      value: number
      timestamp: Date
    }>
  }
  pace?: {
    avg?: number
    best?: number
    splits?: Array<{
      distance: number
      time: number
      pace: number
    }>
  }
  intensity: Intensity
  trainingLoad?: number
  weather?: {
    condition: string
    temperature: number
    humidity?: number
    windSpeed?: number
  }
  device?: {
    name?: string
    type?: string
    version?: string
  }
  mediaIds?: string[]
  thumbnailId?: string
  isPublic: boolean
  tags?: string[]
}

/**
 * 更新运动记录数据
 */
export interface UpdateSportRecordData {
  title?: string
  description?: string
  status?: RecordStatus
  isPublic?: boolean
  tags?: string[]
  mediaIds?: string[]
  thumbnailId?: string
}

/**
 * 运动记录统计信息
 */
export interface RecordStats {
  totalRecords: number // 总记录数
  totalDuration: number // 总运动时长（分钟）
  totalDistance: number // 总运动距离（公里）
  totalCalories: number // 总消耗卡路里
  sportTypeStats: Record<SportType, {
    count: number
    duration: number
    distance: number
    calories: number
  }>
}

/**
 * 运动记录查询参数
 */
export interface RecordQueryOptions {
  userId?: string // 用户ID
  sportType?: SportType // 运动类型
  startDate?: Date // 开始日期
  endDate?: Date // 结束日期
  isPublic?: boolean // 是否公开
  status?: RecordStatus // 记录状态
  minDuration?: number // 最小时长
  maxDuration?: number // 最大时长
  minDistance?: number // 最小距离
  maxDistance?: number // 最大距离
  tags?: string[] // 标签
  sortBy?: 'startTime' | 'duration' | 'distance' | 'calories'
  sortOrder?: 'asc' | 'desc'
}