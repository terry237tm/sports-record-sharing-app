import { DatabaseManager, database } from '../../src/config/database'

/**
 * 数据库连接配置测试
 * 测试数据库管理器的功能和单例模式
 */
describe('DatabaseManager', () => {
  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = DatabaseManager.getInstance()
      const instance2 = DatabaseManager.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('应该正确导出数据库实例', () => {
      expect(database).toBeDefined()
      expect(database).toBe(DatabaseManager.getInstance())
    })
  })

  describe('数据库实例', () => {
    it('应该返回数据库实例', () => {
      const db = database.getDatabase()
      expect(db).toBeDefined()
      expect(typeof db).toBe('object')
    })

    it('应该返回集合引用', () => {
      const collection = database.getCollection('test_collection')
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })
  })

  describe('预定义集合', () => {
    it('应该返回用户集合', () => {
      const collection = database.getUserCollection()
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })

    it('应该返回记录集合', () => {
      const collection = database.getRecordCollection()
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })

    it('应该返回评论集合', () => {
      const collection = database.getCommentCollection()
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })

    it('应该返回点赞集合', () => {
      const collection = database.getLikeCollection()
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })

    it('应该返回媒体集合', () => {
      const collection = database.getMediaCollection()
      expect(collection).toBeDefined()
      expect(typeof collection).toBe('object')
    })
  })

  describe('工具方法', () => {
    it('应该生成有效的文档ID', () => {
      const id1 = database.generateId()
      const id2 = database.generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('应该创建批量操作', () => {
      const batch = database.createBatch()
      expect(batch).toBeDefined()
      expect(typeof batch).toBe('object')
    })

    it('应该创建聚合查询', () => {
      const aggregate = database.aggregate()
      expect(aggregate).toBeDefined()
      expect(typeof aggregate).toBe('object')
    })
  })

  describe('事务处理', () => {
    it('应该支持事务执行', async () => {
      const mockCallback = jest.fn().mockResolvedValue({ success: true })
      
      // 注意：这里只是测试方法调用，实际的事务执行需要真实的数据库环境
      const transactionMethod = database.runTransaction
      expect(typeof transactionMethod).toBe('function')
      
      // 验证方法存在且可调用
      expect(() => {
        database.runTransaction(mockCallback)
      }).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的集合名称', () => {
      expect(() => {
        database.getCollection('')
      }).not.toThrow()
    })

    it('应该处理特殊字符的集合名称', () => {
      expect(() => {
        database.getCollection('test-collection_123')
      }).not.toThrow()
    })
  })
})