/**
 * 图片上传Hook
 * 提供图片上传的状态管理、进度跟踪、错误处理等功能
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  imageUploadService, 
  UploadTask, 
  UploadStatus, 
  UploadResult,
  UploadConfig 
} from '@/services/imageUpload'
import { uploadManager, UploadQueueItem } from '@/utils/uploadManager'
import { showToast } from '@/utils/ui'
import Taro from '@tarojs/taro'

/**
 * 上传状态
 */
export interface UploadState {
  isUploading: boolean
  progress: number
  uploadedCount: number
  totalCount: number
  uploadSpeed: number
  estimatedTime: number
  errors: string[]
}

/**
 * 上传Hook返回类型
 */
export interface UseImageUploadReturn {
  // 状态
  uploadState: UploadState
  uploadTasks: UploadTask[]
  queueItems: UploadQueueItem[]
  
  // 操作方法
  uploadImages: (files: (File | string)[]) => Promise<UploadResult[]>
  uploadSingleImage: (file: File | string) => Promise<UploadResult>
  cancelUpload: (taskId: string) => void
  retryUpload: (taskId: string) => Promise<boolean>
  clearUploads: () => void
  
  // 微信小程序专用
  chooseAndUploadImages: (count?: number) => Promise<UploadResult[]>
  chooseAndUploadImage: () => Promise<UploadResult>
  
  // 工具方法
  getUploadStats: () => any
}

/**
 * 图片上传Hook
 */
export function useImageUpload(config?: UploadConfig): UseImageUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedCount: 0,
    totalCount: 0,
    uploadSpeed: 0,
    estimatedTime: 0,
    errors: []
  })
  
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([])
  const [queueItems, setQueueItems] = useState<UploadQueueItem[]>([])
  
  const uploadStateRef = useRef(uploadState)
  const managerListenersRef = useRef(false)
  
  // 同步状态引用
  useEffect(() => {
    uploadStateRef.current = uploadState
  }, [uploadState])

  // 设置上传管理器监听器
  useEffect(() => {
    if (managerListenersRef.current) return
    
    managerListenersRef.current = true
    
    // 任务添加事件
    uploadManager.on('task-added', (taskId: string) => {
      updateQueueItems()
    })
    
    // 任务开始事件
    uploadManager.on('task-started', (taskId: string) => {
      updateUploadState()
      updateQueueItems()
    })
    
    // 任务进度事件
    uploadManager.on('task-progress', (taskId: string, progress: number) => {
      updateUploadState()
    })
    
    // 任务完成事件
    uploadManager.on('task-completed', (taskId: string, result: UploadResult) => {
      updateUploadState()
      updateQueueItems()
      
      if (result.success) {
        showToast({ title: '上传成功', icon: 'success' })
      }
    })
    
    // 任务失败事件
    uploadManager.on('task-failed', (taskId: string, error: string) => {
      updateUploadState()
      updateQueueItems()
      
      setUploadState(prev => ({
        ...prev,
        errors: [...prev.errors, error]
      }))
      
      showToast({ title: `上传失败: ${error}`, icon: 'error' })
    })
    
    // 所有任务完成事件
    uploadManager.on('all-completed', (results: UploadResult[]) => {
      const successCount = results.filter(r => r.success).length
      const totalCount = results.length
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedCount: successCount,
        totalCount
      }))
      
      showToast({ 
        title: `上传完成: ${successCount}/${totalCount}`, 
        icon: successCount === totalCount ? 'success' : 'none' 
      })
    })
    
    return () => {
      managerListenersRef.current = false
      uploadManager.removeAllListeners()
    }
  }, [])

  /**
   * 更新上传状态
   */
  const updateUploadState = useCallback(() => {
    const stats = uploadManager.getStats()
    const tasks = imageUploadService.getAllUploadTasks()
    
    // 计算总体进度
    let totalProgress = 0
    let activeTasks = 0
    
    tasks.forEach(task => {
      if (task.status === UploadStatus.UPLOADING) {
        totalProgress += task.progress
        activeTasks++
      }
    })
    
    const overallProgress = activeTasks > 0 ? totalProgress / activeTasks : 0
    
    setUploadState(prev => ({
      ...prev,
      isUploading: stats.uploading > 0 || stats.pending > 0,
      progress: Math.round(overallProgress),
      uploadedCount: stats.completed,
      totalCount: stats.total,
      uploadSpeed: stats.averageSpeed
    }))
    
    setUploadTasks(tasks)
  }, [])

  /**
   * 更新队列项目
   */
  const updateQueueItems = useCallback(() => {
    const stats = uploadManager.getStats()
    const allItems: UploadQueueItem[] = []
    
    // 获取队列中的项目
    // 注意：这里需要访问uploadManager的内部状态，可能需要添加相应的方法
    setQueueItems(allItems)
  }, [])

  /**
   * 上传多张图片
   */
  const uploadImages = useCallback(async (
    files: (File | string)[]
  ): Promise<UploadResult[]> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        totalCount: files.length,
        errors: []
      }))
      
      // 添加到上传管理器队列
      const taskIds = await uploadManager.addTasks(files, config)
      
      // 开始上传
      uploadManager.start()
      
      // 等待所有任务完成
      const results = await uploadManager.waitForCompletion()
      
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        errors: [...prev.errors, errorMessage]
      }))
      
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [config])

  /**
   * 上传单张图片
   */
  const uploadSingleImage = useCallback(async (
    file: File | string
  ): Promise<UploadResult> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        totalCount: 1,
        errors: []
      }))
      
      const result = await imageUploadService.uploadImage(file, config)
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: result.success ? 100 : 0,
        uploadedCount: result.success ? 1 : 0
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        errors: [errorMessage]
      }))
      
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [config])

  /**
   * 取消上传
   */
  const cancelUpload = useCallback((taskId: string) => {
    const cancelled = uploadManager.cancelTask(taskId)
    if (cancelled) {
      showToast({ title: '上传已取消', icon: 'none' })
    }
  }, [])

  /**
   * 重试上传
   */
  const retryUpload = useCallback(async (taskId: string): Promise<boolean> => {
    const retried = await uploadManager.retryTask(taskId)
    if (retried) {
      showToast({ title: '正在重试上传', icon: 'none' })
    } else {
      showToast({ title: '无法重试此任务', icon: 'error' })
    }
    return retried
  }, [])

  /**
   * 清空上传
   */
  const clearUploads = useCallback(() => {
    uploadManager.clear()
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedCount: 0,
      totalCount: 0,
      uploadSpeed: 0,
      estimatedTime: 0,
      errors: []
    })
    setUploadTasks([])
    setQueueItems([])
    showToast({ title: '上传队列已清空', icon: 'none' })
  }, [])

  /**
   * 选择并上传多张图片（微信小程序）
   */
  const chooseAndUploadImages = useCallback(async (
    count = 9
  ): Promise<UploadResult[]> => {
    try {
      // 使用Taro选择图片
      const res = await Taro.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      if (res.tempFilePaths.length === 0) {
        return []
      }
      
      return await uploadImages(res.tempFilePaths)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '选择图片失败'
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [uploadImages])

  /**
   * 选择并上传单张图片（微信小程序）
   */
  const chooseAndUploadImage = useCallback(async (): Promise<UploadResult> => {
    try {
      // 使用Taro选择图片
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      if (res.tempFilePaths.length === 0) {
        throw new Error('未选择图片')
      }
      
      return await uploadSingleImage(res.tempFilePaths[0])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '选择图片失败'
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [uploadSingleImage])

  /**
   * 获取上传统计信息
   */
  const getUploadStats = useCallback(() => {
    return uploadManager.getStats()
  }, [])

  return {
    uploadState,
    uploadTasks,
    queueItems,
    uploadImages,
    uploadSingleImage,
    cancelUpload,
    retryUpload,
    clearUploads,
    chooseAndUploadImages,
    chooseAndUploadImage,
    getUploadStats
  }
}

/**
 * 微信小程序图片上传Hook
 */
export function useWechatImageUpload(config?: UploadConfig) {
  const {
    uploadState,
    uploadTasks,
    queueItems,
    uploadImages,
    uploadSingleImage,
    cancelUpload,
    retryUpload,
    clearUploads,
    getUploadStats
  } = useImageUpload(config)

  /**
   * 选择并上传多张图片
   */
  const chooseAndUpload = useCallback(async (
    count = 9,
    sourceType: Array<'album' | 'camera'> = ['album', 'camera']
  ): Promise<UploadResult[]> => {
    try {
      const res = await Taro.chooseImage({
        count,
        sizeType: ['compressed', 'original'],
        sourceType
      })
      
      if (res.tempFilePaths.length === 0) {
        return []
      }
      
      showToast({ title: `已选择 ${res.tempFilePaths.length} 张图片`, icon: 'none' })
      return await uploadImages(res.tempFilePaths)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '选择图片失败'
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [uploadImages])

  /**
   * 拍照并上传
   */
  const takePhotoAndUpload = useCallback(async (): Promise<UploadResult> => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera']
      })
      
      if (res.tempFilePaths.length === 0) {
        throw new Error('拍照失败')
      }
      
      return await uploadSingleImage(res.tempFilePaths[0])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '拍照失败'
      showToast({ title: errorMessage, icon: 'error' })
      throw error
    }
  }, [uploadSingleImage])

  return {
    uploadState,
    uploadTasks,
    queueItems,
    uploadImages,
    uploadSingleImage,
    cancelUpload,
    retryUpload,
    clearUploads,
    chooseAndUpload,
    takePhotoAndUpload,
    getUploadStats
  }
}

/**
 * H5图片上传Hook
 */
export function useH5ImageUpload(config?: UploadConfig) {
  const {
    uploadState,
    uploadTasks,
    queueItems,
    uploadImages,
    uploadSingleImage,
    cancelUpload,
    retryUpload,
    clearUploads,
    getUploadStats
  } = useImageUpload(config)

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    maxCount = 9
  ): Promise<UploadResult[]> => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return []
    }
    
    // 限制文件数量
    const selectedFiles = Array.from(files).slice(0, maxCount)
    
    showToast({ title: `已选择 ${selectedFiles.length} 张图片`, icon: 'none' })
    return await uploadImages(selectedFiles)
  }, [uploadImages])

  /**
   * 拖拽上传
   */
  const handleDrop = useCallback(async (
    event: React.DragEvent,
    maxCount = 9
  ): Promise<UploadResult[]> => {
    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, maxCount)
    
    if (files.length === 0) {
      showToast({ title: '请选择图片文件', icon: 'error' })
      return []
    }
    
    showToast({ title: `已选择 ${files.length} 张图片`, icon: 'none' })
    return await uploadImages(files)
  }, [uploadImages])

  return {
    uploadState,
    uploadTasks,
    queueItems,
    uploadImages,
    uploadSingleImage,
    cancelUpload,
    retryUpload,
    clearUploads,
    handleFileSelect,
    handleDrop,
    getUploadStats
  }
}