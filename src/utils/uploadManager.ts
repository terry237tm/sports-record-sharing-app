/**
 * 上传管理器
 * 管理多个上传任务，提供队列管理、并发控制、状态跟踪等功能
 */

import { 
  ImageUploadService, 
  UploadTask, 
  UploadStatus, 
  UploadResult,
  UploadConfig 
} from '@/services/imageUpload'
import { EventEmitter } from 'events'

/**
 * 上传队列配置
 */
export interface UploadQueueConfig {
  maxConcurrent: number // 最大并发上传数
  retryAttempts: number // 重试次数
  retryDelay: number // 重试延迟（毫秒）
  autoStart: boolean // 是否自动开始上传
  priorityMode: 'fifo' | 'lifo' // 优先级模式：先进先出或后进先出
}

/**
 * 默认上传队列配置
 */
export const DEFAULT_QUEUE_CONFIG: UploadQueueConfig = {
  maxConcurrent: 3,
  retryAttempts: 3,
  retryDelay: 1000,
  autoStart: true,
  priorityMode: 'fifo'
}

/**
 * 上传队列项
 */
export interface UploadQueueItem {
  id: string
  file: File | string
  config?: UploadConfig
  priority: number
  addedAt: number
  startedAt?: number
  completedAt?: number
  attempts: number
  result?: UploadResult
  error?: string
}

/**
 * 上传管理器事件
 */
export interface UploadManagerEvents {
  'task-added': (taskId: string) => void
  'task-started': (taskId: string) => void
  'task-progress': (taskId: string, progress: number) => void
  'task-completed': (taskId: string, result: UploadResult) => void
  'task-failed': (taskId: string, error: string) => void
  'task-retry': (taskId: string, attempt: number) => void
  'queue-paused': () => void
  'queue-resumed': () => void
  'queue-cleared': () => void
  'all-completed': (results: UploadResult[]) => void
}

/**
 * 上传统计信息
 */
export interface UploadStats {
  total: number
  pending: number
  uploading: number
  completed: number
  failed: number
  averageSpeed: number // 平均上传速度（字节/秒）
  totalSize: number
  uploadedSize: number
  successRate: number
}

/**
 * 上传管理器
 */
export class UploadManager extends EventEmitter {
  private uploadService: ImageUploadService
  private queue: UploadQueueItem[] = []
  private activeTasks: Map<string, UploadQueueItem> = new Map()
  private completedTasks: Map<string, UploadQueueItem> = new Map()
  private isPaused = false
  private isProcessing = false
  private config: UploadQueueConfig
  private stats = {
    totalSize: 0,
    uploadedSize: 0,
    startTime: 0,
    totalTime: 0
  }

  constructor(config: Partial<UploadQueueConfig> = {}) {
    super()
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config }
    this.uploadService = new ImageUploadService()
    this.setupServiceListeners()
  }

  /**
   * 添加上传任务到队列
   */
  async addTask(
    file: File | string,
    config?: UploadConfig,
    priority = 0
  ): Promise<string> {
    const taskId = this.generateTaskId()
    
    const queueItem: UploadQueueItem = {
      id: taskId,
      file,
      config,
      priority,
      addedAt: Date.now(),
      attempts: 0
    }

    // 添加到队列
    this.queue.push(queueItem)
    this.sortQueue()

    // 触发事件
    this.emit('task-added', taskId)

    // 自动开始处理
    if (this.config.autoStart && !this.isPaused) {
      this.processQueue()
    }

    return taskId
  }

  /**
   * 批量添加上传任务
   */
  async addTasks(
    files: (File | string)[],
    config?: UploadConfig,
    priority = 0
  ): Promise<string[]> {
    const taskIds: string[] = []
    
    for (const file of files) {
      const taskId = await this.addTask(file, config, priority)
      taskIds.push(taskId)
    }

    return taskIds
  }

  /**
   * 开始处理队列
   */
  async start(): Promise<void> {
    if (this.isPaused) {
      this.isPaused = false
      this.emit('queue-resumed')
    }
    
    await this.processQueue()
  }

  /**
   * 暂停队列处理
   */
  pause(): void {
    this.isPaused = true
    this.emit('queue-paused')
  }

  /**
   * 恢复队列处理
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false
      this.emit('queue-resumed')
      this.processQueue()
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
    this.activeTasks.clear()
    this.completedTasks.clear()
    this.isPaused = false
    this.isProcessing = false
    this.emit('queue-cleared')
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): UploadQueueItem | undefined {
    // 先在队列中查找
    const queueItem = this.queue.find(item => item.id === taskId)
    if (queueItem) return queueItem

    // 在活跃任务中查找
    const activeItem = this.activeTasks.get(taskId)
    if (activeItem) return activeItem

    // 在已完成任务中查找
    return this.completedTasks.get(taskId)
  }

  /**
   * 获取队列中的任务
   */
  getQueueTasks(): UploadQueueItem[] {
    return [...this.queue]
  }

  /**
   * 获取活跃任务
   */
  getActiveTasks(): UploadQueueItem[] {
    return Array.from(this.activeTasks.values())
  }

  /**
   * 获取已完成任务
   */
  getCompletedTasks(): UploadQueueItem[] {
    return Array.from(this.completedTasks.values())
  }

  /**
   * 获取队列统计信息
   */
  getStats(): UploadStats {
    const total = this.queue.length + this.activeTasks.size + this.completedTasks.size
    const pending = this.queue.length
    const uploading = this.activeTasks.size
    const completed = Array.from(this.completedTasks.values()).filter(
      item => item.result?.success
    ).length
    const failed = Array.from(this.completedTasks.values()).filter(
      item => item.result && !item.result.success
    ).length

    const successRate = total > 0 ? (completed / total) * 100 : 0
    const averageSpeed = this.stats.totalTime > 0 
      ? this.stats.uploadedSize / (this.stats.totalTime / 1000)
      : 0

    return {
      total,
      pending,
      uploading,
      completed,
      failed,
      averageSpeed,
      totalSize: this.stats.totalSize,
      uploadedSize: this.stats.uploadedSize,
      successRate
    }
  }

  /**
   * 取消特定任务
   */
  cancelTask(taskId: string): boolean {
    // 从队列中移除
    const queueIndex = this.queue.findIndex(item => item.id === taskId)
    if (queueIndex >= 0) {
      this.queue.splice(queueIndex, 1)
      return true
    }

    // 取消活跃任务
    const activeItem = this.activeTasks.get(taskId)
    if (activeItem) {
      this.uploadService.cancelUpload(taskId)
      this.activeTasks.delete(taskId)
      return true
    }

    return false
  }

  /**
   * 重试失败的任务
   */
  async retryTask(taskId: string): Promise<boolean> {
    const completedItem = this.completedTasks.get(taskId)
    if (!completedItem || !completedItem.error) {
      return false
    }

    // 重置任务状态
    completedItem.attempts = 0
    completedItem.error = undefined
    completedItem.result = undefined
    completedItem.completedAt = undefined

    // 移回队列
    this.completedTasks.delete(taskId)
    this.queue.push(completedItem)
    this.sortQueue()

    // 触发重试事件
    this.emit('task-retry', taskId, 1)

    // 开始处理
    if (!this.isPaused) {
      this.processQueue()
    }

    return true
  }

  /**
   * 重试所有失败的任务
   */
  async retryAllFailed(): Promise<number> {
    const failedTasks = Array.from(this.completedTasks.entries()).filter(
      ([_, item]) => item.result && !item.result.success
    )

    let retryCount = 0
    for (const [taskId, _] of failedTasks) {
      if (await this.retryTask(taskId)) {
        retryCount++
      }
    }

    return retryCount
  }

  /**
   * 等待所有任务完成
   */
  async waitForCompletion(): Promise<UploadResult[]> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        const stats = this.getStats()
        if (stats.pending === 0 && stats.uploading === 0) {
          const results = Array.from(this.completedTasks.values())
            .map(item => item.result!)
          resolve(results)
        } else {
          setTimeout(checkCompletion, 100)
        }
      }
      
      checkCompletion()
    })
  }

  /**
   * 处理上传队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused) {
      return
    }

    this.isProcessing = true
    this.stats.startTime = Date.now()

    try {
      while (this.queue.length > 0 && this.activeTasks.size < this.config.maxConcurrent) {
        if (this.isPaused) break

        // 取出下一个任务
        const queueItem = this.config.priorityMode === 'fifo' 
          ? this.queue.shift()!
          : this.queue.pop()!

        // 开始处理任务
        this.processTask(queueItem)
      }

      // 等待所有任务完成
      if (this.queue.length === 0 && this.activeTasks.size === 0) {
        this.stats.totalTime = Date.now() - this.stats.startTime
        const results = Array.from(this.completedTasks.values())
          .map(item => item.result!)
        this.emit('all-completed', results)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 处理单个上传任务
   */
  private async processTask(queueItem: UploadQueueItem): Promise<void> {
    const { id, file, config } = queueItem
    
    // 添加到活跃任务
    this.activeTasks.set(id, queueItem)
    queueItem.startedAt = Date.now()
    queueItem.attempts++

    // 触发开始事件
    this.emit('task-started', id)

    try {
      // 执行上传
      const result = await this.uploadService.uploadImage(file, config)
      
      // 更新任务状态
      queueItem.result = result
      queueItem.completedAt = Date.now()
      
      // 更新统计信息
      if (result.success && result.size) {
        this.stats.uploadedSize += result.size
      }
      
      // 移动到已完成任务
      this.activeTasks.delete(id)
      this.completedTasks.set(id, queueItem)
      
      // 触发完成事件
      this.emit('task-completed', id, result)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      queueItem.error = errorMessage
      queueItem.completedAt = Date.now()
      
      // 移动到已完成任务（标记为失败）
      this.activeTasks.delete(id)
      this.completedTasks.set(id, queueItem)
      
      // 触发失败事件
      this.emit('task-failed', id, errorMessage)
    }

    // 继续处理队列
    if (!this.isPaused) {
      this.processQueue()
    }
  }

  /**
   * 设置上传服务监听器
   */
  private setupServiceListeners(): void {
    // 监听上传服务的事件并转发
    this.uploadService.on('progress', (taskId: string, progress: number) => {
      this.emit('task-progress', taskId, progress)
    })
  }

  /**
   * 排序队列（根据优先级）
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 创建上传管理器实例
 */
export function createUploadManager(config?: Partial<UploadQueueConfig>): UploadManager {
  return new UploadManager(config)
}

/**
 * 全局上传管理器实例
 */
export const uploadManager = new UploadManager()