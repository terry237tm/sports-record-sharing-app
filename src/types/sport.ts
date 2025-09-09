/**
 * 运动记录相关类型定义
 */

// 运动类型枚举
export enum SportType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  FITNESS = 'fitness',
  HIKING = 'hiking',
  SWIMMING = 'swimming',
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  BADMINTON = 'badminton',
  TENNIS = 'tennis',
  OTHER = 'other'
}

// 运动类型显示名称
export const SportTypeLabels: Record<SportType, string> = {
  [SportType.RUNNING]: '跑步',
  [SportType.CYCLING]: '骑行',
  [SportType.FITNESS]: '健身',
  [SportType.HIKING]: '徒步',
  [SportType.SWIMMING]: '游泳',
  [SportType.BASKETBALL]: '篮球',
  [SportType.FOOTBALL]: '足球',
  [SportType.BADMINTON]: '羽毛球',
  [SportType.TENNIS]: '网球',
  [SportType.OTHER]: '其他'
}

// 运动类型图标
export const SportTypeIcons: Record<SportType, string> = {
  [SportType.RUNNING]: '🏃‍♂️',
  [SportType.CYCLING]: '🚴‍♂️',
  [SportType.FITNESS]: '💪',
  [SportType.HIKING]: '🥾',
  [SportType.SWIMMING]: '🏊‍♂️',
  [SportType.BASKETBALL]: '⛹️‍♂️',
  [SportType.FOOTBALL]: '⚽',
  [SportType.BADMINTON]: '🏸',
  [SportType.TENNIS]: '🎾',
  [SportType.OTHER]: '🏃‍♂️'
}

// 运动记录基础数据
export interface SportRecordData {
  duration: number // 运动时长（分钟）
  distance?: number // 运动距离（公里）
  calories: number // 消耗卡路里
  heartRate?: number // 心率（可选）
  steps?: number // 步数（可选）
}

// 地理位置信息
export interface LocationInfo {
  latitude: number // 纬度
  longitude: number // 经度
  address: string // 地址描述
  city?: string // 城市
  district?: string // 区域
}

// 运动记录
export interface SportRecord {
  _id?: string // 数据库ID
  openid: string // 用户openid
  sportType: SportType // 运动类型
  data: SportRecordData // 运动数据
  images: string[] // 图片URLs
  description: string // 运动描述（最多500字）
  location?: LocationInfo // 地理位置信息
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
  isDeleted?: boolean // 软删除标记
}

// 运动记录表单数据
export interface SportRecordFormData {
  sportType: SportType
  duration: string
  distance: string
  calories: string
  heartRate: string
  steps: string
  description: string
  images: File[]
  location?: LocationInfo
}

// 运动记录列表项
export interface SportRecordListItem {
  _id: string
  sportType: SportType
  data: SportRecordData
  images: string[]
  description: string
  location?: LocationInfo
  createdAt: string
  relativeTime: string // 相对时间（如"2小时前"）
}

// 分页数据
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 运动记录查询参数
export interface SportRecordQuery {
  page?: number
  pageSize?: number
  sportType?: SportType
  startDate?: string
  endDate?: string
  keyword?: string
}

// 验证规则
export interface ValidationRule {
  min?: number
  max?: number
  required?: boolean
  pattern?: RegExp
  message: string
}

// 运动数据验证规则
export const SportDataValidationRules = {
  duration: {
    min: 1,
    max: 1440, // 24小时
    required: true,
    message: '运动时长应在1-1440分钟之间'
  },
  distance: {
    min: 0.1,
    max: 200,
    required: false,
    message: '运动距离应在0.1-200公里之间'
  },
  calories: {
    min: 10,
    max: 5000,
    required: true,
    message: '消耗卡路里应在10-5000之间'
  },
  heartRate: {
    min: 40,
    max: 220,
    required: false,
    message: '心率应在40-220之间'
  },
  steps: {
    min: 1,
    max: 100000,
    required: false,
    message: '步数应在1-100000之间'
  },
  description: {
    max: 500,
    required: false,
    message: '运动描述最多500字'
  }
} as const

// 图片上传配置
export const ImageUploadConfig = {
  maxCount: 9,
  maxSize: 2 * 1024 * 1024, // 2MB
  acceptTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  acceptTypesText: 'JPG、JPEG、PNG'
} as const

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页API响应
export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedData<T>> {}

// 创建运动记录API参数
export interface CreateSportRecordParams {
  sportType: SportType
  data: SportRecordData
  images: string[] // 已上传的图片URLs
  description: string
  location?: LocationInfo
}

// 更新运动记录API参数
export interface UpdateSportRecordParams extends Partial<CreateSportRecordParams> {
  id: string
}