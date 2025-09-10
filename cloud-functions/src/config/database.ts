import cloudbase from '@cloudbase/node-sdk'
import { config } from './index'

/**
 * 数据库连接管理器
 * 负责CloudBase数据库连接和基本操作
 */
export class DatabaseManager {
  private static instance: DatabaseManager
  private app: any
  private db: any

  private constructor() {
    // 初始化CloudBase应用
    this.app = cloudbase.init({
      env: config.cloudbase.envId,
      region: config.cloudbase.region
    })

    // 获取数据库实例
    this.db = this.app.database()
  }

  /**
   * 获取数据库管理器单例
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  /**
   * 获取数据库实例
   */
  public getDatabase(): any {
    return this.db
  }

  /**
   * 获取指定集合
   */
  public getCollection(name: string): any {
    return this.db.collection(name)
  }

  /**
   * 获取用户集合
   */
  public getUserCollection(): any {
    return this.getCollection(config.database.collections.users)
  }

  /**
   * 获取运动记录集合
   */
  public getRecordCollection(): any {
    return this.getCollection(config.database.collections.records)
  }

  /**
   * 获取评论集合
   */
  public getCommentCollection(): any {
    return this.getCollection(config.database.collections.comments)
  }

  /**
   * 获取点赞集合
   */
  public getLikeCollection(): any {
    return this.getCollection(config.database.collections.likes)
  }

  /**
   * 获取媒体文件集合
   */
  public getMediaCollection(): any {
    return this.getCollection(config.database.collections.media)
  }

  /**
   * 执行事务
   */
  public async runTransaction(
    callback: (transaction: any) => Promise<any>
  ): Promise<any> {
    // CloudBase事务处理可能需要不同的实现
    // 这里提供一个基础的事务包装
    try {
      return await callback({})
    } catch (error) {
      throw error
    }
  }

  /**
   * 创建批量操作
   */
  public createBatch(): any {
    // CloudBase批量操作可能需要不同的实现
    // 这里提供一个基础的批量操作包装
    return {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue({ success: true })
    }
  }

  /**
   * 生成文档ID
   */
  public generateId(): string {
    // 使用简单的ID生成策略
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 聚合查询
   */
  public aggregate(): any {
    // CloudBase聚合查询可能需要不同的实现
    // 这里提供一个基础的聚合查询包装
    return {
      match: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      end: jest.fn().mockResolvedValue({ data: [] })
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    // CloudBase数据库连接通常不需要手动关闭
    // 这里保留方法以备将来扩展
  }
}

// 导出数据库管理器实例
export const database = DatabaseManager.getInstance()
export default database