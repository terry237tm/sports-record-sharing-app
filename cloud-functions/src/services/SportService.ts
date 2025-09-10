import BaseService from './BaseService'
import { SportRecord, CreateSportRecordData, UpdateSportRecordData, RecordQueryOptions, RecordStats, SportType } from '../models/SportRecord'
import { OperationResult, PaginatedResult } from '../models/BaseModel'
import { database } from '../config/database'

/**
 * 运动记录服务
 * 提供运动记录相关的业务逻辑
 */
export class SportService extends BaseService<SportRecord> {
  constructor() {
    super('records')
  }

  /**
   * 创建运动记录
   */
  public async createRecord(
    userId: string,
    data: CreateSportRecordData
  ): Promise<OperationResult<SportRecord>> {
    try {
      // 验证运动数据
      const validation = this.validateSportData(data)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // 计算训练负荷
      const trainingLoad = this.calculateTrainingLoad(data)

      // 检查是否创造个人记录
      const personalRecords = await this.checkPersonalRecords(userId, data)

      // 创建记录
      const recordData = {
        userId,
        ...data,
        status: 'active' as const,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        trainingLoad,
        personalRecords,
        syncStatus: {
          synced: true,
          syncTime: new Date()
        }
      }

      return await this.create(recordData)
    } catch (error) {
      return {
        success: false,
        error: `创建运动记录失败：${error.message}`
      }
    }
  }

  /**
   * 获取用户的运动记录列表
   */
  public async getUserRecords(
    userId: string,
    options: RecordQueryOptions = {}
  ): Promise<OperationResult<PaginatedResult<SportRecord>>> {
    try {
      const filter = {
        userId,
        status: 'active'
      }

      // 添加其他过滤条件
      if (options.sportType) {
        filter['sportType'] = options.sportType
      }

      if (options.startDate || options.endDate) {
        filter['startTime'] = {}
        if (options.startDate) {
          filter['startTime']['$gte'] = options.startDate
        }
        if (options.endDate) {
          filter['startTime']['$lte'] = options.endDate
        }
      }

      if (options.minDuration) {
        filter['duration'] = { ...filter['duration'], $gte: options.minDuration }
      }

      if (options.maxDuration) {
        filter['duration'] = { ...filter['duration'], $lte: options.maxDuration }
      }

      if (options.minDistance) {
        filter['distance'] = { ...filter['distance'], $gte: options.minDistance }
      }

      if (options.maxDistance) {
        filter['distance'] = { ...filter['distance'], $lte: options.maxDistance }
      }

      if (options.tags && options.tags.length > 0) {
        filter['tags'] = { $in: options.tags }
      }

      const sort = {}
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1
      } else {
        sort['startTime'] = -1
      }

      return await this.find({
        ...options,
        filter,
        sort
      })
    } catch (error) {
      return {
        success: false,
        error: `获取运动记录失败：${error.message}`
      }
    }
  }

  /**
   * 获取公开的运动记录（发现页）
   */
  public async getPublicRecords(
    options: RecordQueryOptions = {}
  ): Promise<OperationResult<PaginatedResult<SportRecord>>> {
    try {
      const filter = {
        isPublic: true,
        status: 'active'
      }

      if (options.sportType) {
        filter['sportType'] = options.sportType
      }

      const sort = { startTime: -1 }
      if (options.sortBy === 'likesCount') {
        sort['likesCount'] = -1
      }

      return await this.find({
        ...options,
        filter,
        sort
      })
    } catch (error) {
      return {
        success: false,
        error: `获取公开记录失败：${error.message}`
      }
    }
  }

  /**
   * 获取运动记录统计
   */
  public async getRecordStats(userId: string): Promise<OperationResult<RecordStats>> {
    try {
      const collection = database.getRecordCollection()

      // 基础统计
      const baseStats = await collection
        .where({
          userId,
          status: 'active'
        })
        .aggregate()
        .group({
          _id: null,
          totalRecords: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalDistance: { $sum: '$distance' },
          totalCalories: { $sum: '$calories' }
        })
        .end()

      // 运动类型统计
      const sportTypeStats = await collection
        .where({
          userId,
          status: 'active'
        })
        .aggregate()
        .group({
          _id: '$sportType',
          count: { $sum: 1 },
          duration: { $sum: '$duration' },
          distance: { $sum: '$distance' },
          calories: { $sum: '$calories' }
        })
        .end()

      const stats = baseStats.data[0] || {
        totalRecords: 0,
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0
      }

      const sportTypeMap: Record<SportType, {
        count: number
        duration: number
        distance: number
        calories: number
      }> = {} as any

      // 初始化所有运动类型
      Object.values(SportType).forEach(type => {
        sportTypeMap[type] = {
          count: 0,
          duration: 0,
          distance: 0,
          calories: 0
        }
      })

      // 填充统计数据
      sportTypeStats.data.forEach((item: any) => {
        if (item._id) {
          sportTypeMap[item._id] = {
            count: item.count || 0,
            duration: item.duration || 0,
            distance: item.distance || 0,
            calories: item.calories || 0
          }
        }
      })

      return {
        success: true,
        data: {
          totalRecords: stats.totalRecords,
          totalDuration: stats.totalDuration,
          totalDistance: stats.totalDistance,
          totalCalories: stats.totalCalories,
          sportTypeStats: sportTypeMap
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `获取统计信息失败：${error.message}`
      }
    }
  }

  /**
   * 更新运动记录
   */
  public async updateRecord(
    recordId: string,
    userId: string,
    data: UpdateSportRecordData
  ): Promise<OperationResult<SportRecord>> {
    try {
      // 验证记录是否存在且属于该用户
      const existingRecord = await this.findOne({
        _id: recordId,
        userId
      })

      if (!existingRecord.success) {
        return {
          success: false,
          error: '记录不存在或无权限'
        }
      }

      return await this.update(recordId, data)
    } catch (error) {
      return {
        success: false,
        error: `更新运动记录失败：${error.message}`
      }
    }
  }

  /**
   * 删除运动记录
   */
  public async deleteRecord(recordId: string, userId: string): Promise<OperationResult<boolean>> {
    try {
      // 验证记录是否存在且属于该用户
      const existingRecord = await this.findOne({
        _id: recordId,
        userId
      })

      if (!existingRecord.success) {
        return {
          success: false,
          error: '记录不存在或无权限'
        }
      }

      return await this.softDelete(recordId)
    } catch (error) {
      return {
        success: false,
        error: `删除运动记录失败：${error.message}`
      }
    }
  }

  /**
   * 获取运动记录详情
   */
  public async getRecordDetail(recordId: string): Promise<OperationResult<SportRecord>> {
    return await this.findById(recordId)
  }

  /**
   * 验证运动数据
   */
  private validateSportData(data: CreateSportRecordData): { valid: boolean; error?: string } {
    // 验证时间
    if (data.startTime >= data.endTime) {
      return { valid: false, error: '结束时间必须晚于开始时间' }
    }

    // 验证时长
    if (data.duration <= 0) {
      return { valid: false, error: '运动时长必须大于0' }
    }

    // 验证卡路里
    if (data.calories < 0) {
      return { valid: false, error: '消耗卡路里不能为负数' }
    }

    // 验证距离
    if (data.distance !== undefined && data.distance < 0) {
      return { valid: false, error: '运动距离不能为负数' }
    }

    // 验证步数
    if (data.steps !== undefined && data.steps < 0) {
      return { valid: false, error: '步数不能为负数' }
    }

    return { valid: true }
  }

  /**
   * 计算训练负荷
   */
  private calculateTrainingLoad(data: CreateSportRecordData): number {
    // 基于运动时长、强度和类型的简单计算
    const baseLoad = data.duration * data.intensity
    
    // 根据运动类型调整系数
    const sportTypeMultiplier = {
      [SportType.RUNNING]: 1.2,
      [SportType.CYCLING]: 1.0,
      [SportType.SWIMMING]: 1.5,
      [SportType.FITNESS]: 1.3,
      [SportType.YOGA]: 0.8,
      [SportType.BASKETBALL]: 1.4,
      [SportType.FOOTBALL]: 1.4,
      [SportType.BADMINTON]: 1.1,
      [SportType.TENNIS]: 1.1,
      [SportType.CLIMBING]: 1.6,
      [SportType.SKATING]: 1.0,
      [SportType.SKIING]: 1.3,
      [SportType.OTHER]: 1.0
    }

    return Math.round(baseLoad * (sportTypeMultiplier[data.sportType] || 1.0))
  }

  /**
   * 检查个人记录
   */
  private async checkPersonalRecords(
    userId: string,
    data: CreateSportRecordData
  ): Promise<{ distance?: boolean; duration?: boolean; speed?: boolean }> {
    try {
      const collection = database.getRecordCollection()
      const records = await collection
        .where({
          userId,
          sportType: data.sportType,
          status: 'active'
        })
        .get()

      let distanceRecord = false
      let durationRecord = false
      let speedRecord = false

      if (records.data && records.data.length > 0) {
        // 检查距离记录
        const maxDistance = Math.max(...records.data.map(r => r.distance || 0))
        if (data.distance && data.distance > maxDistance) {
          distanceRecord = true
        }

        // 检查时长记录
        const maxDuration = Math.max(...records.data.map(r => r.duration))
        if (data.duration > maxDuration) {
          durationRecord = true
        }

        // 检查速度记录（基于距离和时长）
        if (data.distance && data.distance > 0) {
          const currentSpeed = data.distance / (data.duration / 60) // km/h
          const maxSpeed = Math.max(
            ...records.data
              .filter(r => r.distance && r.distance > 0)
              .map(r => r.distance / (r.duration / 60))
          )
          if (currentSpeed > maxSpeed) {
            speedRecord = true
          }
        }
      } else {
        // 第一条记录，所有都是个人记录
        distanceRecord = !!data.distance
        durationRecord = true
        speedRecord = !!(data.distance && data.distance > 0)
      }

      return {
        distance: distanceRecord,
        duration: durationRecord,
        speed: speedRecord
      }
    } catch (error) {
      // 如果检查失败，返回空记录
      return {}
    }
  }
}

export default SportService

// 创建服务实例
export const sportService = new SportService()