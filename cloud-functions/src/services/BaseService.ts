import { database } from '../config/database'
import { BaseModel, OperationResult, QueryOptions, PaginatedResult } from '../models/BaseModel'

/**
 * 基础服务类
 * 提供通用的数据库操作方法
 */
export abstract class BaseService<T extends BaseModel> {
  protected collectionName: string

  constructor(collectionName: string) {
    super()
    this.collectionName = collectionName
  }

  /**
   * 获取集合引用
   */
  protected getCollection(): any {
    return database.getCollection(this.collectionName)
  }

  /**
   * 创建文档
   */
  public async create(data: Omit<T, keyof BaseModel>): Promise<OperationResult<T>> {
    try {
      const now = new Date()
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
        isDeleted: false
      }

      const result = await this.getCollection().add(docData)
      
      if (!result.id) {
        return {
          success: false,
          error: '创建文档失败：未返回文档ID'
        }
      }

      const newDoc = await this.getCollection().doc(result.id).get()
      
      return {
        success: true,
        data: {
          ...newDoc.data,
          _id: result.id
        } as T
      }
    } catch (error) {
      return {
        success: false,
        error: `创建文档失败：${error.message}`
      }
    }
  }

  /**
   * 根据ID查询文档
   */
  public async findById(id: string): Promise<OperationResult<T>> {
    try {
      const result = await this.getCollection()
        .doc(id)
        .where({
          isDeleted: false
        })
        .get()

      if (!result.data || result.data.length === 0) {
        return {
          success: false,
          error: '文档不存在'
        }
      }

      return {
        success: true,
        data: {
          ...result.data[0],
          _id: id
        } as T
      }
    } catch (error) {
      return {
        success: false,
        error: `查询文档失败：${error.message}`
      }
    }
  }

  /**
   * 查询文档列表
   */
  public async find(options: QueryOptions = {}): Promise<OperationResult<PaginatedResult<T>>> {
    try {
      const {
        page = 1,
        pageSize = 20,
        sort = { createdAt: -1 },
        filter = {},
        fields = []
      } = options

      // 默认过滤条件：未删除
      const defaultFilter = { isDeleted: false }
      const finalFilter = { ...defaultFilter, ...filter }

      // 构建查询
      let query = this.getCollection().where(finalFilter)

      // 排序
      Object.entries(sort).forEach(([field, order]) => {
        query = query.orderBy(field, order === 1 ? 'asc' : 'desc')
      })

      // 分页
      const skip = (page - 1) * pageSize
      query = query.skip(skip).limit(pageSize)

      // 字段选择
      if (fields.length > 0) {
        query = query.field({
          _id: true,
          ...fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
        })
      }

      const result = await query.get()
      
      // 获取总数
      const countResult = await this.getCollection()
        .where(finalFilter)
        .count()

      const total = countResult.total || 0
      const totalPages = Math.ceil(total / pageSize)

      return {
        success: true,
        data: {
          data: (result.data || []).map((item, index) => ({
            ...item,
            _id: item._id || item._openid || `temp_${Date.now()}_${index}`
          })) as T[],
          total,
          page,
          pageSize,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `查询文档列表失败：${error.message}`
      }
    }
  }

  /**
   * 查询单个文档
   */
  public async findOne(filter: Record<string, any>): Promise<OperationResult<T>> {
    try {
      const defaultFilter = { isDeleted: false }
      const finalFilter = { ...defaultFilter, ...filter }

      const result = await this.getCollection()
        .where(finalFilter)
        .limit(1)
        .get()

      if (!result.data || result.data.length === 0) {
        return {
          success: false,
          error: '文档不存在'
        }
      }

      return {
        success: true,
        data: result.data[0] as T
      }
    } catch (error) {
      return {
        success: false,
        error: `查询文档失败：${error.message}`
      }
    }
  }

  /**
   * 更新文档
   */
  public async update(
    id: string,
    data: Partial<T>
  ): Promise<OperationResult<T>> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      }

      // 删除不允许更新的字段
      delete updateData._id
      delete updateData.createdAt

      await this.getCollection()
        .doc(id)
        .update(updateData)

      // 返回更新后的文档
      return await this.findById(id)
    } catch (error) {
      return {
        success: false,
        error: `更新文档失败：${error.message}`
      }
    }
  }

  /**
   * 软删除文档
   */
  public async softDelete(id: string): Promise<OperationResult<boolean>> {
    try {
      await this.getCollection()
        .doc(id)
        .update({
          isDeleted: true,
          updatedAt: new Date()
        })

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `删除文档失败：${error.message}`
      }
    }
  }

  /**
   * 硬删除文档
   */
  public async hardDelete(id: string): Promise<OperationResult<boolean>> {
    try {
      await this.getCollection().doc(id).remove()

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `删除文档失败：${error.message}`
      }
    }
  }

  /**
   * 批量创建
   */
  public async batchCreate(
    items: Omit<T, keyof BaseModel>[]
  ): Promise<OperationResult<cloudbase.database.BatchUpdateResult>> {
    try {
      const batch = database.createBatch()
      const now = new Date()

      items.forEach(item => {
        const docData = {
          ...item,
          createdAt: now,
          updatedAt: now,
          isDeleted: false
        }
        batch.create(this.getCollection().doc(), docData)
      })

      const result = await batch.commit()

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: `批量创建失败：${error.message}`
      }
    }
  }

  /**
   * 批量更新
   */
  public async batchUpdate(
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<OperationResult<cloudbase.database.BatchUpdateResult>> {
    try {
      const batch = database.createBatch()

      updates.forEach(({ id, data }) => {
        const updateData = {
          ...data,
          updatedAt: new Date()
        }
        delete updateData._id
        delete updateData.createdAt

        batch.update(this.getCollection().doc(id), updateData)
      })

      const result = await batch.commit()

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: `批量更新失败：${error.message}`
      }
    }
  }

  /**
   * 计数
   */
  public async count(filter: Record<string, any> = {}): Promise<OperationResult<number>> {
    try {
      const defaultFilter = { isDeleted: false }
      const finalFilter = { ...defaultFilter, ...filter }

      const result = await this.getCollection()
        .where(finalFilter)
        .count()

      return {
        success: true,
        data: result.total || 0
      }
    } catch (error) {
      return {
        success: false,
        error: `计数失败：${error.message}`
      }
    }
  }

  /**
   * 检查文档是否存在
   */
  public async exists(id: string): Promise<OperationResult<boolean>> {
    try {
      const result = await this.getCollection()
        .doc(id)
        .where({ isDeleted: false })
        .count()

      return {
        success: true,
        data: result.total > 0
      }
    } catch (error) {
      return {
        success: false,
        error: `检查文档存在性失败：${error.message}`
      }
    }
  }
}

export default BaseService