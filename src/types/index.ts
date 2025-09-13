/**
 * 类型定义入口文件
 * 统一导出所有类型定义，提供完整的类型系统支持
 * 
 * 本模块包含以下主要类型分类：
 * - 运动记录类型 (sport.ts) - 运动记录、运动类型、验证规则等
 * - 分享功能类型 (share.ts) - 分享图片、Canvas绘制、平台配置等  
 * - 用户相关类型 (user.ts) - 用户信息、设置、统计、成就等
 * - API相关类型 (api.ts) - API请求/响应类型、HTTP状态码、错误处理等
 * - 常量枚举类型 (constants.ts) - 运动类型、状态码、错误信息等枚举
 * - 通用基础类型 - 分页、异步状态、验证错误等基础类型
 */

/**
 * 运动记录相关类型
 * 从sport.ts模块重新导出所有运动记录相关类型定义
 */
export * from './sport'

/**
 * 分享功能相关类型
 * 从share.ts模块重新导出所有分享功能相关类型定义
 */
export * from './share'

/**
 * 用户相关类型
 * 从user.ts模块重新导出所有用户相关类型定义
 */
export * from './user'

/**
 * API相关类型
 * 从api.ts模块重新导出所有API请求/响应相关类型定义
 */
export * from './api'

/**
 * 常量枚举类型
 * 从constants.ts模块重新导出所有枚举和常量定义
 */
export * from './constants'

/**
 * 通用API响应类型
 * 所有API响应的统一数据结构，包含状态码、消息和数据
 * @template T 响应数据的类型，默认为任意类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

/**
 * 分页查询参数
 * 用于分页查询的基础参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * 分页数据
 * 包含分页信息和数据列表的通用结构
 * @template T 数据项的类型
 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * 分页API响应
 * 分页数据的API响应格式
 * @template T 分页数据的类型
 */
export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedData<T>> {}

/**
 * 通用错误类型
 * 应用程序统一的错误信息结构
 */
export interface AppError {
  code: string
  message: string
  details?: any
}

/**
 * 加载状态类型
 * 异步操作的不同状态枚举
 */
export enum LoadingStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * 异步操作状态
 * 异步操作的完整状态信息，包含数据、加载状态和错误信息
 * @template T 数据的类型，默认为任意类型
 */
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: AppError | null
  status: LoadingStatus
}

/**
 * 表单验证错误
 * 单个表单字段的验证错误信息
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * 地理位置坐标
 * 经纬度坐标信息
 */
export interface LatLng {
  latitude: number
  longitude: number
}

/**
 * 文件上传结果
 * 文件上传操作的返回结果
 */
export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

/**
 * 日期范围
 * 包含开始和结束日期的范围定义
 */
export interface DateRange {
  start: Date
  end: Date
}

/**
 * 统计时间范围
 * 数据统计的不同时间周期枚举
 */
export enum StatisticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all'
}

/**
 * 位置相关类型
 * 从location.ts模块重新导出所有位置相关类型定义
 */
export * from './location'