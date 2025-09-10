/**
 * 云函数类型定义
 */

// 云函数事件数据
export interface CloudFunctionEvent {
  action: string
  data: any
  userInfo?: {
    openid: string
    appid: string
    unionid?: string
  }
}

// 云函数上下文
export interface CloudFunctionContext {
  requestId: string
  environment: string
  functionName: string
  functionVersion: string
  memoryLimitInMB: number
  timeLimitInMS: number
}

// 云函数响应
export interface CloudFunctionResponse {
  code: number
  message: string
  data?: any
  error?: string
}

// 运动记录数据库模型
export interface SportRecordDB {
  _id?: string
  _openid: string
  sportType: string
  data: {
    duration: number
    distance?: number
    calories: number
    heartRate?: number
    steps?: number
  }
  images: string[]
  description: string
  location?: {
    latitude: number
    longitude: number
    address: string
    city?: string
    district?: string
  }
  createdAt: Date
  updatedAt: Date
  isDeleted?: boolean
}

// 创建运动记录参数
export interface CreateSportRecordParams {
  sportType: string
  data: {
    duration: number
    distance?: number
    calories: number
    heartRate?: number
    steps?: number
  }
  images: string[]
  description: string
  location?: {
    latitude: number
    longitude: number
    address: string
    city?: string
    district?: string
  }
}

// 更新运动记录参数
export interface UpdateSportRecordParams {
  id: string
  sportType?: string
  data?: {
    duration?: number
    distance?: number
    calories?: number
    heartRate?: number
    steps?: number
  }
  images?: string[]
  description?: string
  location?: {
    latitude: number
    longitude: number
    address: string
    city?: string
    district?: string
  }
}

// 查询运动记录参数
export interface QuerySportRecordsParams {
  page?: number
  pageSize?: number
  sportType?: string
  startDate?: string
  endDate?: string
  keyword?: string
  sortBy?: 'createdAt' | 'duration' | 'distance' | 'calories'
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 运动统计
export interface SportStatistics {
  totalRecords: number
  totalDuration: number
  totalDistance: number
  totalCalories: number
  thisWeekRecords: number
  thisMonthRecords: number
  sportTypeStats: Record<string, number>
}

// 错误类型
export interface AppError extends Error {
  code: string
  statusCode: number
  details?: any
}

// 验证错误
export interface ValidationError {
  field: string
  message: string
  value?: any
}

// 数据库操作结果
export interface DatabaseResult<T> {
  success: boolean
  data?: T
  error?: AppError
  affectedDocs?: number
}