/**
 * 运动记录云函数处理器
 */

import { 
  CloudFunctionEvent, 
  CloudFunctionContext, 
  CloudFunctionResponse,
  CreateSportRecordParams,
  UpdateSportRecordParams,
  QuerySportRecordsParams,
  SportRecordDB 
} from '../types'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateSportRecordParams,
  validateQueryParams,
  formatValidationErrors,
  checkPermission,
  getPaginationOffset,
  hasMoreData,
  getRelativeTime
} from '../utils'
import { createQueryBuilder } from '../utils/cloudbase'
import { COLLECTIONS, ERROR_CODES, SPORT_TYPES, SPORT_TYPE_LABELS } from '../constants'

/**
 * 创建运动记录
 */
async function createSportRecord(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const params = event.data as CreateSportRecordParams
    
    // 参数验证
    const validationErrors = validateSportRecordParams(params)
    if (validationErrors.length > 0) {
      return createErrorResponse(
        formatValidationErrors(validationErrors),
        ERROR_CODES.VALIDATION_FAILED
      )
    }

    // 验证运动类型
    if (!Object.values(SPORT_TYPES).includes(params.sportType)) {
      return createErrorResponse('无效的运动类型', ERROR_CODES.INVALID_SPORT_TYPE)
    }

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 创建运动记录
    const record: Omit<SportRecordDB, '_id'> = {
      _openid: userInfo.openid,
      sportType: params.sportType,
      data: params.data,
      images: params.images || [],
      description: params.description,
      location: params.location,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }

    const result = await db.query.add(record)
    
    if (!result._id) {
      return createErrorResponse('创建记录失败', ERROR_CODES.DATABASE_ERROR)
    }

    // 返回创建成功的记录
    const createdRecord = {
      ...record,
      _id: result._id
    }

    return createSuccessResponse(createdRecord, '运动记录创建成功')
  } catch (error) {
    console.error('创建运动记录失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '创建运动记录失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 获取运动记录列表
 */
async function getSportRecords(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const params = event.data as QuerySportRecordsParams
    
    // 参数验证
    const validationErrors = validateQueryParams(params)
    if (validationErrors.length > 0) {
      return createErrorResponse(
        formatValidationErrors(validationErrors),
        ERROR_CODES.VALIDATION_FAILED
      )
    }

    const {
      page = 1,
      pageSize = 10,
      sportType,
      startDate,
      endDate,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 构建查询条件
    let query = db.where({
      _openid: userInfo.openid,
      isDeleted: false
    })

    if (sportType) {
      query = query.where({ sportType })
    }

    if (startDate || endDate) {
      const dateCondition: any = {}
      if (startDate) {
        dateCondition.$gte = new Date(startDate)
      }
      if (endDate) {
        dateCondition.$lte = new Date(endDate)
      }
      query = query.where({ createdAt: dateCondition })
    }

    if (keyword) {
      // 关键词搜索（描述和位置地址）
      query = query.where({
        $or: [
          { description: { $regex: keyword, $options: 'i' } },
          { 'location.address': { $regex: keyword, $options: 'i' } }
        ]
      })
    }

    // 获取总数
    const total = await query.count()
    
    // 获取分页数据
    const offset = getPaginationOffset(page, pageSize)
    const records = await query
      .orderBy(sortBy, sortOrder)
      .skip(offset)
      .limit(pageSize)
      .get()

    // 格式化数据
    const formattedRecords = records.map(record => ({
      ...record,
      relativeTime: getRelativeTime(record.createdAt)
    }))

    const response = {
      list: formattedRecords,
      total,
      page,
      pageSize,
      hasMore: hasMoreData(total, page, pageSize)
    }

    return createSuccessResponse(response, '获取运动记录列表成功')
  } catch (error) {
    console.error('获取运动记录列表失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '获取运动记录列表失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 获取单条运动记录
 */
async function getSportRecord(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const { id } = event.data
    if (!id) {
      return createErrorResponse('记录ID不能为空', ERROR_CODES.INVALID_PARAMS)
    }

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 查询记录
    const record = await db
      .where({
        _id: id,
        _openid: userInfo.openid,
        isDeleted: false
      })
      .getOne()

    if (!record) {
      return createErrorResponse('记录不存在', ERROR_CODES.RECORD_NOT_FOUND)
    }

    // 格式化数据
    const formattedRecord = {
      ...record,
      relativeTime: getRelativeTime(record.createdAt)
    }

    return createSuccessResponse(formattedRecord, '获取运动记录成功')
  } catch (error) {
    console.error('获取运动记录失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '获取运动记录失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 更新运动记录
 */
async function updateSportRecord(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const params = event.data as UpdateSportRecordParams
    if (!params.id) {
      return createErrorResponse('记录ID不能为空', ERROR_CODES.INVALID_PARAMS)
    }

    // 参数验证
    if (params.data || params.description || params.images) {
      const validationData = {
        sportType: params.sportType || 'running',
        data: params.data || {},
        images: params.images || [],
        description: params.description || ''
      }
      
      const validationErrors = validateSportRecordParams(validationData)
      if (validationErrors.length > 0) {
        return createErrorResponse(
          formatValidationErrors(validationErrors),
          ERROR_CODES.VALIDATION_FAILED
        )
      }
    }

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 检查记录是否存在且属于当前用户
    const existingRecord = await db
      .where({
        _id: params.id,
        _openid: userInfo.openid,
        isDeleted: false
      })
      .getOne()

    if (!existingRecord) {
      return createErrorResponse('记录不存在或无权限', ERROR_CODES.RECORD_NOT_FOUND)
    }

    // 构建更新数据
    const updateData: Partial<SportRecordDB> = {
      updatedAt: new Date()
    }

    if (params.sportType) {
      updateData.sportType = params.sportType
    }
    if (params.data) {
      updateData.data = { ...existingRecord.data, ...params.data }
    }
    if (params.images) {
      updateData.images = params.images
    }
    if (params.description !== undefined) {
      updateData.description = params.description
    }
    if (params.location) {
      updateData.location = params.location
    }

    // 执行更新
    await db.query.doc(params.id).update(updateData)

    // 获取更新后的记录
    const updatedRecord = await db
      .where({
        _id: params.id,
        _openid: userInfo.openid
      })
      .getOne()

    return createSuccessResponse(updatedRecord, '运动记录更新成功')
  } catch (error) {
    console.error('更新运动记录失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '更新运动记录失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 删除运动记录
 */
async function deleteSportRecord(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const { id } = event.data
    if (!id) {
      return createErrorResponse('记录ID不能为空', ERROR_CODES.INVALID_PARAMS)
    }

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 检查记录是否存在且属于当前用户
    const existingRecord = await db
      .where({
        _id: id,
        _openid: userInfo.openid,
        isDeleted: false
      })
      .getOne()

    if (!existingRecord) {
      return createErrorResponse('记录不存在或无权限', ERROR_CODES.RECORD_NOT_FOUND)
    }

    // 软删除记录
    await db.query.doc(id).update({
      isDeleted: true,
      updatedAt: new Date()
    })

    return createSuccessResponse(null, '运动记录删除成功')
  } catch (error) {
    console.error('删除运动记录失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '删除运动记录失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 获取运动统计
 */
async function getSportStatistics(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { userInfo } = event
    if (!userInfo?.openid) {
      return createErrorResponse('用户未登录', ERROR_CODES.NOT_LOGGED_IN)
    }

    const { period = 'all' } = event.data

    const db = createQueryBuilder(COLLECTIONS.SPORT_RECORDS)
    
    // 构建查询条件
    let query = db.where({
      _openid: userInfo.openid,
      isDeleted: false
    })

    // 根据时间段筛选
    if (period !== 'all') {
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }
      
      query = query.where({
        createdAt: { $gte: startDate }
      })
    }

    // 获取所有记录用于统计
    const records = await query.get()

    // 计算统计数据
    const statistics = {
      totalRecords: records.length,
      totalDuration: 0,
      totalDistance: 0,
      totalCalories: 0,
      thisWeekRecords: 0,
      thisMonthRecords: 0,
      sportTypeStats: {} as Record<string, number>,
      longestDuration: 0,
      longestDistance: 0,
      favoriteSportType: ''
    }

    const now = new Date()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const sportTypeCount: Record<string, number> = {}

    records.forEach(record => {
      // 基础统计
      statistics.totalDuration += record.data.duration || 0
      statistics.totalDistance += record.data.distance || 0
      statistics.totalCalories += record.data.calories || 0

      // 本周统计
      if (record.createdAt >= weekStart) {
        statistics.thisWeekRecords++
      }

      // 本月统计
      if (record.createdAt >= monthStart) {
        statistics.thisMonthRecords++
      }

      // 最长记录
      if (record.data.duration > statistics.longestDuration) {
        statistics.longestDuration = record.data.duration
      }
      if (record.data.distance > statistics.longestDistance) {
        statistics.longestDistance = record.data.distance
      }

      // 运动类型统计
      sportTypeCount[record.sportType] = (sportTypeCount[record.sportType] || 0) + 1
    })

    // 最喜欢的运动类型
    const favoriteType = Object.entries(sportTypeCount)
      .sort(([, a], [, b]) => b - a)[0]
    
    statistics.sportTypeStats = sportTypeCount
    statistics.favoriteSportType = favoriteType ? 
      SPORT_TYPE_LABELS[favoriteType[0]] || favoriteType[0] : ''

    return createSuccessResponse(statistics, '获取运动统计成功')
  } catch (error) {
    console.error('获取运动统计失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '获取运动统计失败',
      ERROR_CODES.DATABASE_ERROR
    )
  }
}

/**
 * 主入口函数
 */
export async function main(
  event: CloudFunctionEvent,
  context: CloudFunctionContext
): Promise<CloudFunctionResponse> {
  try {
    const { action } = event

    // 根据 action 路由到对应的处理函数
    switch (action) {
      case 'createSportRecord':
        return await createSportRecord(event, context)
      
      case 'getSportRecords':
        return await getSportRecords(event, context)
      
      case 'getSportRecord':
        return await getSportRecord(event, context)
      
      case 'updateSportRecord':
        return await updateSportRecord(event, context)
      
      case 'deleteSportRecord':
        return await deleteSportRecord(event, context)
      
      case 'getSportStatistics':
        return await getSportStatistics(event, context)
      
      default:
        return createErrorResponse(`未知的操作: ${action}`, ERROR_CODES.INVALID_PARAMS)
    }
  } catch (error) {
    console.error('云函数执行失败:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : '云函数执行失败',
      ERROR_CODES.UNKNOWN_ERROR
    )
  }
}

// 导出处理函数
export {
  createSportRecord,
  getSportRecords,
  getSportRecord,
  updateSportRecord,
  deleteSportRecord,
  getSportStatistics
}

export default main