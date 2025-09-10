/**
 * API类型定义文件
 * 定义所有API请求和响应相关的类型，遵循RESTful规范
 * 包含请求参数、响应格式、错误处理等类型定义
 */

import { SportRecord, SportType, SportCategory } from './sport'
import { User, UserStats } from './user'
import { ShareConfig } from './share'

/**
 * 通用API响应类型
 * 所有API响应的统一数据结构
 * @template T 响应数据的类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: number
  requestId?: string
}

/**
 * API错误响应
 * 错误响应的专用格式
 */
export interface ErrorResponse extends ApiResponse<null> {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * API成功响应
 * 成功响应的专用格式
 * @template T 成功响应数据的类型
 */
export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true
}

/**
 * 分页请求参数
 * 用于分页查询的基础参数
 */
export interface PaginationRequest {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应数据
 * 包含分页信息和数据列表
 * @template T 数据项的类型
 */
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  totalPages: number
}

/**
 * 获取运动记录请求
 */
export interface GetSportRecordsRequest extends PaginationRequest {
  userId?: string
  sportType?: SportType
  category?: SportCategory
  startDate?: string
  endDate?: string
  isShareable?: boolean
}

/**
 * 创建运动记录请求
 */
export interface CreateSportRecordRequest {
  sportType: SportType
  duration: number
  distance: number
  calories: number
  startTime: string
  endTime: string
  route?: Array<{
    latitude: number
    longitude: number
    timestamp: number
  }>
  averageSpeed?: number
  maxSpeed?: number
  notes?: string
  isShareable: boolean
}

/**
 * 更新运动记录请求
 */
export interface UpdateSportRecordRequest {
  id: string
  notes?: string
  isShareable?: boolean
  route?: Array<{
    latitude: number
    longitude: number
    timestamp: number
  }>
}

/**
 * 删除运动记录请求
 */
export interface DeleteSportRecordRequest {
  id: string
}

/**
 * 用户登录请求
 */
export interface LoginRequest {
  code: string
  encryptedData: string
  iv: string
}

/**
 * 用户信息更新请求
 */
export interface UpdateUserRequest {
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
  height?: number
  weight?: number
  preferences?: {
    unitSystem?: 'metric' | 'imperial'
    autoSync?: boolean
    notificationEnabled?: boolean
  }
}

/**
 * 分享配置请求
 */
export interface ShareRequest {
  recordId: string
  template?: string
  content?: string
  platforms?: string[]
}

/**
 * 获取统计数据请求
 */
export interface GetStatisticsRequest {
  period: 'today' | 'week' | 'month' | 'year' | 'all'
  sportType?: SportType
  userId?: string
}

/**
 * 文件上传请求
 */
export interface UploadFileRequest {
  file: File
  type: 'image' | 'video' | 'audio'
  category?: string
}

/**
 * 获取运动记录响应
 */
export interface GetSportRecordsResponse extends SuccessResponse<PaginationResponse<SportRecord>> {}

/**
 * 创建运动记录响应
 */
export interface CreateSportRecordResponse extends SuccessResponse<SportRecord> {}

/**
 * 更新运动记录响应
 */
export interface UpdateSportRecordResponse extends SuccessResponse<SportRecord> {}

/**
 * 删除运动记录响应
 */
export interface DeleteSportRecordResponse extends SuccessResponse<{ id: string }> {}

/**
 * 用户登录响应
 */
export interface LoginResponse extends SuccessResponse<{
  user: User
  token: string
  expiresIn: number
}> {}

/**
 * 用户信息响应
 */
export interface GetUserResponse extends SuccessResponse<User> {}

/**
 * 更新用户响应
 */
export interface UpdateUserResponse extends SuccessResponse<User> {}

/**
 * 用户统计响应
 */
export interface GetUserStatsResponse extends SuccessResponse<UserStats> {}

/**
 * 分享配置响应
 */
export interface ShareConfigResponse extends SuccessResponse<ShareConfig> {}

/**
 * 分享创建响应
 */
export interface ShareCreateResponse extends SuccessResponse<{
  shareId: string
  shareUrl: string
  qrcodeUrl: string
}> {}

/**
 * 统计数据响应
 */
export interface StatisticsResponse extends SuccessResponse<{
  totalDistance: number
  totalDuration: number
  totalCalories: number
  totalRecords: number
  averageSpeed: number
  recordsByType: Record<SportType, number>
  monthlyTrend: Array<{
    month: string
    distance: number
    duration: number
    calories: number
  }>
}> {}

/**
 * 文件上传响应
 */
export interface UploadFileResponse extends SuccessResponse<{
  url: string
  filename: string
  size: number
  type: string
  originalName: string
}> {}

/**
 * API状态枚举
 */
export enum ApiStatus {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

/**
 * API错误码枚举
 */
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  MISSING_PARAMS = 'MISSING_PARAMS',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  
  // 业务错误
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  INVALID_RECORD_DATA = 'INVALID_RECORD_DATA',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  SHARE_FAILED = 'SHARE_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // 系统错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * HTTP方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * API请求配置
 */
export interface ApiRequestConfig {
  method: HttpMethod
  url: string
  data?: any
  params?: any
  headers?: Record<string, string>
  timeout?: number
  retry?: number
  retryDelay?: number
}

/**
 * API错误类型
 */
export interface ApiError extends Error {
  code: ErrorCode
  status?: number
  details?: any
  requestId?: string
}

/**
 * 请求拦截器
 */
export interface RequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  onRequestError?: (error: any) => any | Promise<any>
}

/**
 * 响应拦截器
 */
export interface ResponseInterceptor<T = any> {
  onResponse?: (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
  onResponseError?: (error: ApiError) => ApiError | Promise<ApiError>
}

/**
 * API客户端配置
 */
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  requestInterceptors?: RequestInterceptor[]
  responseInterceptors?: ResponseInterceptor[]
  retry?: number
  retryDelay?: number
}