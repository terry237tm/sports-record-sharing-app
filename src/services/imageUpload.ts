/**
 * 图片上传服务
 * 提供图片上传、进度跟踪、失败重试等功能
 */

import { cloudbaseService } from './cloudbase'
import { 
  compressImage, 
  compressImages, 
  CompressionConfig,
  DEFAULT_COMPRESSION_CONFIG,
  CompressionResult 
} from '@/utils/imageCompression'
import { 
  validateImageFile, 
  validateWechatImage,
  ImageValidationResult 
} from '@/utils/imageValidation'
import Taro from '@tarojs/taro'

/**
 * 上传任务状态
 */
export enum UploadStatus {
  PENDING = 'pending',
  COMPRESSING = 'compressing',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 上传任务
 */
export interface UploadTask {
  id: string
  file: File | string // File对象（H5）或临时文件路径（微信小程序）
  status: UploadStatus
  progress: number // 0-100
  compressedFile?: File | Blob
  uploadedUrl?: string
  error?: string
  retryCount: number
  startTime?: number
  endTime?: number
}

/**
 * 上传结果
 */
export interface UploadResult {
  success: boolean
  url?: string
  fileId?: string
  size?: number
  error?: string
  duration?: number
}

/**
 * 上传配置
 */
export interface UploadConfig {
  compression?: Partial<CompressionConfig>
  maxRetries?: number
  retryDelay?: number
  cloudPathPrefix?: string
  enableContentCheck?: boolean
}

/**
 * 默认上传配置
 */
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  compression: DEFAULT_COMPRESSION_CONFIG,
  maxRetries: 3,
  retryDelay: 1000,
  cloudPathPrefix: 'sport-images/',
  enableContentCheck: true
}

/**
 * 图片上传服务类
 */
export class ImageUploadService {
  private uploadTasks: Map<string, UploadTask> = new Map()
  private progressCallbacks: Map<string, (progress: number) => void> = new Map()
  private statusCallbacks: Map<string, (status: UploadStatus) => void> = new Map()
  private currentUploadCount = 0
  private maxConcurrentUploads = 3

  /**
   * 上传单个图片
   */
  async uploadImage(
    file: File | string,
    config: UploadConfig = {}
  ): Promise<UploadResult> {
    const finalConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config }
    const taskId = this.generateTaskId()
    
    // 创建上传任务
    const task: UploadTask = {
      id: taskId,
      file,
      status: UploadStatus.PENDING,
      progress: 0,
      retryCount: 0
    }
    
    this.uploadTasks.set(taskId, task)
    
    try {
      // 验证图片
      const validationResult = await this.validateImage(file)
      if (!validationResult.valid) {
        throw new Error(validationResult.error)
      }
      
      // 压缩图片
      await this.updateTaskStatus(taskId, UploadStatus.COMPRESSING)
      const compressionResult = await this.compressImage(file, finalConfig.compression)
      task.compressedFile = compressionResult.file
      
      // 上传到云存储
      await this.updateTaskStatus(taskId, UploadStatus.UPLOADING)
      const uploadResult = await this.uploadToCloud(
        taskId,
        compressionResult.file,
        finalConfig
      )
      
      // 更新任务状态
      await this.updateTaskStatus(taskId, UploadStatus.SUCCESS)
      task.uploadedUrl = uploadResult.url
      task.endTime = Date.now()
      
      return {
        success: true,
        url: uploadResult.url,
        fileId: uploadResult.fileId,
        size: compressionResult.compressedSize,
        duration: task.endTime! - task.startTime!
      }
    } catch (error) {
      await this.updateTaskStatus(taskId, UploadStatus.FAILED)
      task.error = error instanceof Error ? error.message : '上传失败'
      task.endTime = Date.now()
      
      // 重试机制
      if (task.retryCount < (finalConfig.maxRetries || 0)) {
        task.retryCount++
        await this.delay(finalConfig.retryDelay || 1000)
        return this.uploadImage(file, config)
      }
      
      return {
        success: false,
        error: task.error,
        duration: task.endTime - (task.startTime || task.endTime)
      }
    }
  }

  /**
   * 批量上传图片
   */
  async uploadImages(
    files: (File | string)[],
    config: UploadConfig = {}
  ): Promise<UploadResult[]> {
    // 控制并发数量
    const results: UploadResult[] = []
    const uploadPromises: Promise<UploadResult>[] = []
    
    for (const file of files) {
      // 等待直到有可用并发槽位
      while (this.currentUploadCount >= this.maxConcurrentUploads) {
        await this.delay(100)
      }
      
      this.currentUploadCount++
      const uploadPromise = this.uploadImage(file, config).finally(() => {
        this.currentUploadCount--
      })
      
      uploadPromises.push(uploadPromise)
    }
    
    // 等待所有上传完成
    const settledResults = await Promise.allSettled(uploadPromises)
    
    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          success: false,
          error: result.reason instanceof Error ? result.reason.message : '上传失败'
        })
      }
    }
    
    return results
  }

  /**
   * 取消上传任务
   */
  cancelUpload(taskId: string): boolean {
    const task = this.uploadTasks.get(taskId)
    if (task && task.status === UploadStatus.UPLOADING) {
      task.status = UploadStatus.CANCELLED
      this.uploadTasks.set(taskId, task)
      return true
    }
    return false
  }

  /**
   * 获取上传任务状态
   */
  getUploadTask(taskId: string): UploadTask | undefined {
    return this.uploadTasks.get(taskId)
  }

  /**
   * 获取所有上传任务
   */
  getAllUploadTasks(): UploadTask[] {
    return Array.from(this.uploadTasks.values())
  }

  /**
   * 注册进度回调
   */
  onProgress(taskId: string, callback: (progress: number) => void): void {
    this.progressCallbacks.set(taskId, callback)
  }

  /**
   * 注册状态回调
   */
  onStatusChange(taskId: string, callback: (status: UploadStatus) => void): void {
    this.statusCallbacks.set(taskId, callback)
  }

  /**
   * 清理完成的任务
   */
  cleanupCompletedTasks(): void {
    for (const [taskId, task] of this.uploadTasks.entries()) {
      if (task.status === UploadStatus.SUCCESS || task.status === UploadStatus.FAILED) {
        this.uploadTasks.delete(taskId)
        this.progressCallbacks.delete(taskId)
        this.statusCallbacks.delete(taskId)
      }
    }
  }

  /**
   * 验证图片
   */
  private async validateImage(file: File | string): Promise<ImageValidationResult> {
    if (typeof file === 'string') {
      // 微信小程序临时文件路径
      return await validateWechatImage(file)
    } else {
      // H5 File对象
      return await validateImageFile(file)
    }
  }

  /**
   * 压缩图片
   */
  private async compressImage(
    file: File | string,
    config?: Partial<CompressionConfig>
  ): Promise<CompressionResult> {
    return await compressImage(file, config)
  }

  /**
   * 上传到云存储
   */
  private async uploadToCloud(
    taskId: string,
    file: File | Blob,
    config: UploadConfig
  ): Promise<{ url: string; fileId: string }> {
    const startTime = Date.now()
    
    // 更新任务开始时间
    const task = this.uploadTasks.get(taskId)
    if (task) {
      task.startTime = startTime
    }
    
    // 生成云存储路径
    const fileName = this.generateCloudFileName(file)
    const cloudPath = `${config.cloudPathPrefix}${fileName}`
    
    try {
      // 模拟上传进度（实际项目中这里应该监听真实上传进度）
      this.simulateUploadProgress(taskId)
      
      // 上传到云存储
      const uploadResult = await cloudbaseService.uploadFile(file as File, cloudPath)
      
      if (uploadResult.success && uploadResult.data?.fileUrl) {
        return {
          url: uploadResult.data.fileUrl,
          fileId: uploadResult.data.fileID
        }
      } else {
        throw new Error(uploadResult.message || '上传失败')
      }
    } catch (error) {
      throw new Error(`云存储上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 模拟上传进度
   */
  private simulateUploadProgress(taskId: string): void {
    let progress = 0
    const interval = setInterval(() => {
      const task = this.uploadTasks.get(taskId)
      if (!task || task.status !== UploadStatus.UPLOADING) {
        clearInterval(interval)
        return
      }
      
      // 模拟进度增长
      progress += Math.random() * 15
      if (progress >= 90) {
        progress = 90 // 等待实际上传完成
      }
      
      task.progress = Math.min(progress, 100)
      this.uploadTasks.set(taskId, task)
      
      // 触发进度回调
      const progressCallback = this.progressCallbacks.get(taskId)
      if (progressCallback) {
        progressCallback(task.progress)
      }
    }, 200)
  }

  /**
   * 更新任务状态
   */
  private async updateTaskStatus(taskId: string, status: UploadStatus): Promise<void> {
    const task = this.uploadTasks.get(taskId)
    if (task) {
      task.status = status
      this.uploadTasks.set(taskId, task)
      
      // 触发状态回调
      const statusCallback = this.statusCallbacks.get(taskId)
      if (statusCallback) {
        statusCallback(status)
      }
    }
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成云存储文件名
   */
  private generateCloudFileName(file: File | Blob): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substr(2, 6)
    const extension = file instanceof File ? this.getFileExtension(file.name) : '.jpg'
    return `${timestamp}_${randomStr}${extension}`
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(fileName: string): string {
    const match = fileName.match(/\.[^.]+$/)
    return match ? match[0] : '.jpg'
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建图片上传服务实例
 */
export const imageUploadService = new ImageUploadService()

/**
 * 微信小程序图片上传辅助函数
 */
export async function uploadWechatImages(
  tempFilePaths: string[],
  config: UploadConfig = {}
): Promise<UploadResult[]> {
  return await imageUploadService.uploadImages(tempFilePaths, config)
}

/**
 * H5图片上传辅助函数
 */
export async function uploadH5Images(
  files: File[],
  config: UploadConfig = {}
): Promise<UploadResult[]> {
  return await imageUploadService.uploadImages(files, config)
}