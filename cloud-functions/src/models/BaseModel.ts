/**
 * 基础数据模型接口
 * 定义所有数据模型的通用字段
 */
export interface BaseModel {
  _id?: string
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: boolean
}

/**
 * 分页查询结果
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 查询参数
 */
export interface QueryOptions {
  page?: number
  pageSize?: number
  sort?: Record<string, 1 | -1>
  filter?: Record<string, any>
  fields?: string[]
}

/**
 * 数据库操作结果
 */
export interface OperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success: boolean
  inserted?: number
  updated?: number
  deleted?: number
  errors?: string[]
}