// 用户类型
export interface User {
  _id?: string
  openid: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  gender?: number // 1: 男, 2: 女, 0: 未知
  birthday?: string
  height?: number // 身高 (cm)
  weight?: number // 体重 (kg)
  createdAt: Date
  updatedAt: Date
}

// 运动记录类型
export interface SportsRecord {
  _id?: string
  userId: string
  type: SportsType
  duration: number // 运动时长 (分钟)
  distance?: number // 距离 (公里)
  calories: number // 消耗卡路里
  heartRate?: {
    average?: number
    max?: number
    min?: number
  }
  speed?: {
    average?: number
    max?: number
  }
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  weather?: {
    temperature?: number
    condition?: string
    humidity?: number
  }
  notes?: string
  tags?: string[]
  images?: string[] // 图片文件ID数组
  videos?: string[] // 视频文件ID数组
  isPublic: boolean // 是否公开
  likesCount: number
  commentsCount: number
  createdAt: Date
  updatedAt: Date
}

// 运动类型
export enum SportsType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  WALKING = 'walking',
  FITNESS = 'fitness',
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  TENNIS = 'tennis',
  BADMINTON = 'badminton',
  YOGA = 'yoga',
  PILATES = 'pilates',
  DANCING = 'dancing',
  CLIMBING = 'climbing',
  SKIING = 'skiing',
  OTHER = 'other'
}

// 评论类型
export interface Comment {
  _id?: string
  recordId: string
  userId: string
  content: string
  parentId?: string // 回复的评论ID
  replyTo?: string // 被回复的用户ID
  likesCount: number
  createdAt: Date
  updatedAt: Date
}

// 点赞类型
export interface Like {
  _id?: string
  recordId: string
  userId: string
  createdAt: Date
}

// 媒体文件类型
export interface MediaFile {
  _id?: string
  userId: string
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  duration?: number // 视频时长 (秒)
  width?: number
  height?: number
  createdAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data?: T
  timestamp: string
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 错误响应类型
export interface ErrorResponse {
  error: {
    message: string
    code: string
    details?: any
    timestamp: string
  }
}

// 登录请求类型
export interface LoginRequest {
  code: string // 小程序登录凭证
}

// 登录响应类型
export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

// 创建记录请求类型
export interface CreateRecordRequest {
  type: SportsType
  duration: number
  distance?: number
  calories: number
  heartRate?: {
    average?: number
    max?: number
    min?: number
  }
  speed?: {
    average?: number
    max?: number
  }
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  weather?: {
    temperature?: number
    condition?: string
    humidity?: number
  }
  notes?: string
  tags?: string[]
  images?: string[]
  videos?: string[]
  isPublic?: boolean
}

// 更新记录请求类型
export interface UpdateRecordRequest {
  duration?: number
  distance?: number
  calories?: number
  heartRate?: {
    average?: number
    max?: number
    min?: number
  }
  speed?: {
    average?: number
    max?: number
  }
  notes?: string
  tags?: string[]
  isPublic?: boolean
}

// 创建评论请求类型
export interface CreateCommentRequest {
  recordId: string
  content: string
  parentId?: string
}

// 文件上传请求类型
export interface UploadFileRequest {
  fileName: string
  fileSize: number
  mimeType: string
}

// 文件上传响应类型
export interface UploadFileResponse {
  uploadUrl: string
  fileId: string
  expiresAt: number
}

// 查询参数类型
export interface QueryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  type?: SportsType
  userId?: string
  isPublic?: boolean
  startDate?: string
  endDate?: string
  tags?: string[]
}

// 云函数事件类型
export interface CloudFunctionEvent {
  httpMethod: string
  path: string
  headers: Record<string, string>
  queryStringParameters?: Record<string, string>
  body?: string
  pathParameters?: Record<string, string>
  requestContext: {
    requestId: string
    sourceIp: string
    userAgent: string
  }
}

// 云函数上下文类型
export interface CloudFunctionContext {
  requestId: string
  functionName: string
  functionVersion: string
  memoryLimitInMB: number
  timeLimitInMS: number
}

// JWT 载荷类型
export interface JwtPayload {
  userId: string
  openid: string
  iat: number
  exp: number
}