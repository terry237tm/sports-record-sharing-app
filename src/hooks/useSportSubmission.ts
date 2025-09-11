/**
 * 运动记录提交Hook
 * 处理运动记录的创建、上传、状态管理和反馈
 */

import { useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { createSportRecord, uploadImages } from '@/store/sportThunks'
import { resetFormData, setSaveLoading, setSaveError } from '@/store/slices/sportSlice'
import { SportType, LocationInfo } from '@/types/sport'
import { 
  showLoading, 
  hideLoading, 
  showSuccessToast, 
  showErrorToast,
  showToast 
} from '@/utils/ui'
import Taro from '@tarojs/taro'

export interface SubmissionData {
  sportType: SportType
  data: {
    duration: number
    distance?: number
    calories: number
    heartRate?: number
    steps?: number
  }
  images: File[]
  description: string
  location?: LocationInfo
}

export interface SubmissionState {
  isSubmitting: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  submittedRecordId?: string
}

export interface SubmissionCallbacks {
  onSuccess?: (recordId: string) => void
  onError?: (error: string) => void
  onUploadProgress?: (progress: number) => void
}

/**
 * 运动记录提交Hook
 */
export function useSportSubmission() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  
  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    isUploading: false,
    uploadProgress: 0,
    error: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * 重置提交状态
   */
  const resetState = useCallback(() => {
    setState({
      isSubmitting: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      submittedRecordId: undefined
    })
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  /**
   * 上传图片并显示进度
   */
  const uploadImagesWithProgress = useCallback(async (
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<string[]> => {
    if (files.length === 0) {
      return []
    }

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }))

    try {
      // 创建中止控制器
      abortControllerRef.current = new AbortController()

      // 模拟上传进度
      const totalFiles = files.length
      let uploadedCount = 0

      const uploadPromises = files.map(async (file, index) => {
        // 模拟上传延迟和进度
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
        
        const response = await dispatch(uploadImages([file])).unwrap()
        
        uploadedCount++
        const progress = Math.round((uploadedCount / totalFiles) * 100)
        
        setState(prev => ({ ...prev, uploadProgress: progress }))
        onProgress?.(progress)
        
        return response[0]
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadProgress: 100 
      }))

      return uploadedUrls
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadProgress: 0 
      }))
      throw error
    }
  }, [dispatch])

  /**
   * 提交运动记录
   */
  const submitSportRecord = useCallback(async (
    data: SubmissionData,
    callbacks?: SubmissionCallbacks
  ): Promise<boolean> => {
    // 检查用户登录状态
    if (!user?.openid) {
      const error = '请先登录后再提交运动记录'
      setState(prev => ({ ...prev, error }))
      callbacks?.onError?.(error)
      showErrorToast('请先登录')
      return false
    }

    // 重置状态
    resetState()
    
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))
    dispatch(setSaveLoading(true))
    dispatch(setSaveError(null))

    try {
      // 显示加载状态
      await showLoading({ title: '正在创建运动记录...' })

      let uploadedImageUrls: string[] = []
      
      // 上传图片
      if (data.images.length > 0) {
        uploadedImageUrls = await uploadImagesWithProgress(
          data.images, 
          callbacks?.onUploadProgress
        )
      }

      // 准备提交数据
      const submitData = {
        sportType: data.sportType,
        data: data.data,
        images: uploadedImageUrls,
        description: data.description,
        location: data.location
      }

      // 创建运动记录
      const result = await dispatch(createSportRecord(submitData)).unwrap()
      
      // 更新状态
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        submittedRecordId: result._id 
      }))

      // 隐藏加载状态
      await hideLoading()

      // 显示成功提示
      await showSuccessToast('运动记录创建成功')

      // 重置表单数据
      dispatch(resetFormData())

      // 调用成功回调
      callbacks?.onSuccess?.(result._id!)

      return true

    } catch (error) {
      // 隐藏加载状态
      await hideLoading()

      const errorMessage = error instanceof Error ? error.message : '创建运动记录失败'
      
      // 更新状态
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        error: errorMessage 
      }))

      // 设置Redux错误状态
      dispatch(setSaveError(errorMessage))
      dispatch(setSaveLoading(false))

      // 显示错误提示
      await showErrorToast('创建失败，请重试')

      // 调用错误回调
      callbacks?.onError?.(errorMessage)

      return false
    }
  }, [user, dispatch, resetState, uploadImagesWithProgress])

  /**
   * 取消提交
   */
  const cancelSubmission = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // 重置所有状态
    resetState()
    dispatch(setSaveLoading(false))
    dispatch(setSaveError(null))
    
    await hideLoading()
  }, [resetState, dispatch])

  /**
   * 导航到记录详情页
   */
  const navigateToRecord = useCallback((recordId: string) => {
    Taro.navigateTo({
      url: `/pages/sports/detail?id=${recordId}`
    })
  }, [])

  /**
   * 返回列表页
   */
  const navigateToList = useCallback(() => {
    Taro.navigateBack()
  }, [])

  return {
    // 状态
    state,
    
    // 操作方法
    submitSportRecord,
    cancelSubmission,
    resetState,
    
    // 导航方法
    navigateToRecord,
    navigateToList,
    
    // 便捷状态访问
    isSubmitting: state.isSubmitting,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error,
    submittedRecordId: state.submittedRecordId
  }
}

export default useSportSubmission