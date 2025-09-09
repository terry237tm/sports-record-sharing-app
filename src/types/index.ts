/**
 * 类型定义入口文件
 * 统一导出所有类型定义
 */

// 运动记录相关类型
export * from './sport'

// 分享功能相关类型
export * from './share'

// 用户相关类型
export * from './user'

// 通用API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页相关类型
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedData<T>> {}

// 通用错误类型
export interface AppError {
  code: string
  message: string
  details?: any
}

// 加载状态类型
export enum LoadingStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 异步操作状态
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: AppError | null
  status: LoadingStatus
}

// 表单验证错误
export interface ValidationError {
  field: string
  message: string
}

// 地理位置坐标
export interface LatLng {
  latitude: number
  longitude: number
}

// 文件上传结果
export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

// 日期范围
export interface DateRange {
  start: Date
  end: Date
}

// 统计时间范围
export enum StatisticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all'
}