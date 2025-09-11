/**
 * 创建运动记录页面
 * 提供完整的运动记录创建表单界面，集成提交状态管理和反馈机制
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Button, ScrollView, Progress } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useSportSubmission } from '@/hooks/useSportSubmission'
import SportTypeSelector from '@/components/SportTypeSelector'
import SportDataForm from '@/components/SportDataForm'
import SportDescriptionInput from '@/components/SportDescriptionInput'
import ImageUploader from '@/components/ImageUploader'
import LocationSelector from '@/components/LocationSelector'
import { SportType, LocationInfo } from '@/types/sport'
import { showToast, showConfirm } from '@/utils/ui'
import './create.scss'

interface FormData {
  sportType: SportType
  duration: string
  distance: string
  calories: string
  heartRate: string
  steps: string
  description: string
  images: File[]
  location?: LocationInfo
}

interface ValidationState {
  sportType: boolean
  duration: boolean
  calories: boolean
  description: boolean
}

export default function CreateSport() {
  const { user } = useSelector((state: RootState) => state.user)
  const { 
    state: submissionState, 
    submitSportRecord, 
    cancelSubmission,
    navigateToRecord,
    navigateToList 
  } = useSportSubmission()
  
  const [formData, setFormData] = useState<FormData>({
    sportType: '' as SportType,
    duration: '',
    distance: '',
    calories: '',
    heartRate: '',
    steps: '',
    description: '',
    images: [],
    location: undefined
  })

  const [validation, setValidation] = useState<ValidationState>({
    sportType: false,
    duration: false,
    calories: false,
    description: true // 描述是可选的，默认为有效
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 页面加载处理
  useLoad(() => {
    console.log('创建运动记录页面加载')
    
    // 检查用户登录状态
    if (!user?.openid) {
      showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  })

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时取消正在进行的提交
      if (submissionState.isSubmitting || submissionState.isUploading) {
        cancelSubmission()
      }
    }
  }, [])

  /**
   * 处理运动类型选择
   */
  const handleSportTypeChange = useCallback((sportType: SportType) => {
    setFormData(prev => ({ ...prev, sportType }))
    setValidation(prev => ({ ...prev, sportType: !!sportType }))
    
    // 清除错误信息
    if (errors.sportType) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.sportType
        return newErrors
      })
    }
  }, [errors.sportType])

  /**
   * 处理运动数据变化
   */
  const handleDataChange = useCallback((field: keyof Omit<FormData, 'sportType' | 'description' | 'images' | 'location'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  /**
   * 处理运动数据验证状态变化
   */
  const handleDataValidationChange = useCallback((field: string, isValid: boolean) => {
    if (field === 'duration' || field === 'calories') {
      setValidation(prev => ({ ...prev, [field]: isValid }))
    }
  }, [])

  /**
   * 处理描述变化
   */
  const handleDescriptionChange = useCallback((description: string) => {
    setFormData(prev => ({ ...prev, description }))
  }, [])

  /**
   * 处理描述验证状态变化
   */
  const handleDescriptionValidationChange = useCallback((isValid: boolean) => {
    setValidation(prev => ({ ...prev, description: isValid }))
  }, [])

  /**
   * 处理图片变化
   */
  const handleImagesChange = useCallback((images: File[]) => {
    setFormData(prev => ({ ...prev, images }))
  }, [])

  /**
   * 处理位置变化
   */
  const handleLocationChange = useCallback((location: LocationInfo | undefined) => {
    setFormData(prev => ({ ...prev, location }))
  }, [])

  /**
   * 验证表单
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    // 验证运动类型
    if (!formData.sportType) {
      newErrors.sportType = '请选择运动类型'
    }
    
    // 验证必填字段
    if (!formData.duration) {
      newErrors.duration = '请输入运动时长'
    }
    
    if (!formData.calories) {
      newErrors.calories = '请输入消耗卡路里'
    }
    
    // 验证描述（如果填写了）
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '运动描述最多500字'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  /**
   * 检查是否可以提交
   */
  const canSubmit = (): boolean => {
    return validation.sportType && validation.duration && validation.calories && validation.description
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      showToast({
        title: '请完善表单信息',
        icon: 'none'
      })
      return
    }

    if (!canSubmit()) {
      showToast({
        title: '表单数据验证失败',
        icon: 'none'
      })
      return
    }

    // 准备提交数据
    const submissionData = {
      sportType: formData.sportType,
      data: {
        duration: parseInt(formData.duration) || 0,
        distance: parseFloat(formData.distance) || undefined,
        calories: parseInt(formData.calories) || 0,
        heartRate: parseInt(formData.heartRate) || undefined,
        steps: parseInt(formData.steps) || undefined
      },
      images: formData.images,
      description: formData.description,
      location: formData.location
    }

    // 提交运动记录
    const success = await submitSportRecord(submissionData, {
      onSuccess: (recordId) => {
        console.log('运动记录创建成功，ID:', recordId)
        // 延迟导航，让用户看到成功提示
        setTimeout(() => {
          // 可以选择导航到详情页或返回列表页
          if (Math.random() > 0.5) {
            navigateToRecord(recordId)
          } else {
            navigateToList()
          }
        }, 1500)
      },
      onError: (error) => {
        console.error('运动记录创建失败:', error)
        // 保持当前页面，用户可以看到错误信息并重新提交
      },
      onUploadProgress: (progress) => {
        console.log('上传进度:', progress + '%')
      }
    })

    // 如果提交成功，重置表单（可选）
    if (success) {
      // 可以在这里重置表单数据
      setTimeout(() => {
        setFormData({
          sportType: '' as SportType,
          duration: '',
          distance: '',
          calories: '',
          heartRate: '',
          steps: '',
          description: '',
          images: [],
          location: undefined
        })
        setValidation({
          sportType: false,
          duration: false,
          calories: false,
          description: true
        })
        setErrors({})
      }, 2000)
    }
  }, [formData, validateForm, canSubmit, submitSportRecord, navigateToRecord, navigateToList])

  /**
   * 处理取消
   */
  const handleCancel = useCallback(async () => {
    // 如果有正在进行的提交，先取消
    if (submissionState.isSubmitting || submissionState.isUploading) {
      await cancelSubmission()
      return
    }

    // 检查是否有未保存的数据
    const hasUnsavedData = formData.sportType || 
                          formData.duration || 
                          formData.calories || 
                          formData.description || 
                          formData.images.length > 0

    if (hasUnsavedData) {
      const confirmed = await showConfirm({
        title: '确认取消',
        content: '确定要取消创建运动记录吗？未保存的数据将丢失。',
        confirmText: '确定',
        cancelText: '取消'
      })

      if (confirmed) {
        navigateToList()
      }
    } else {
      navigateToList()
    }
  }, [submissionState, cancelSubmission, formData, navigateToList])

  // 如果用户未登录，显示加载状态
  if (!user?.openid) {
    return (
      <View className="create-sport-page loading">
        <Text className="loading-text">正在检查登录状态...</Text>
      </View>
    )
  }

  // 如果正在提交且上传进度大于0，显示上传进度
  const showProgress = submissionState.isUploading && submissionState.uploadProgress > 0

  return (
    <View className="create-sport-page">
      {/* 上传进度条 */}
      {showProgress && (
        <View className="upload-progress">
          <Progress 
            percent={submissionState.uploadProgress} 
            strokeWidth={2}
            activeColor="#07c160"
            backgroundColor="#ebebeb"
          />
          <Text className="progress-text">
            正在上传图片... {submissionState.uploadProgress}%
          </Text>
        </View>
      )}

      <View className="page-header">
        <Text className="page-title">创建运动记录</Text>
        <Text className="page-subtitle">记录你的运动时光</Text>
      </View>

      <ScrollView className="form-container" scrollY>
        <View className="form-content">
          {/* 运动类型选择 */}
          <View className="form-section">
            <SportTypeSelector
              value={formData.sportType}
              onChange={handleSportTypeChange}
              className={errors.sportType ? 'has-error' : ''}
              disabled={submissionState.isSubmitting}
            />
            {errors.sportType && (
              <Text className="error-message">{errors.sportType}</Text>
            )}
          </View>

          {/* 运动数据输入 */}
          <View className="form-section">
            <SportDataForm
              values={{
                duration: formData.duration,
                distance: formData.distance,
                calories: formData.calories,
                heartRate: formData.heartRate,
                steps: formData.steps
              }}
              onChange={handleDataChange}
              onValidationChange={handleDataValidationChange}
              className={errors.duration || errors.calories ? 'has-error' : ''}
              disabled={submissionState.isSubmitting}
            />
            {(errors.duration || errors.calories) && (
              <Text className="error-message">{errors.duration || errors.calories}</Text>
            )}
          </View>

          {/* 运动描述 */}
          <View className="form-section">
            <SportDescriptionInput
              value={formData.description}
              onChange={handleDescriptionChange}
              onValidationChange={handleDescriptionValidationChange}
              className={errors.description ? 'has-error' : ''}
              placeholder="分享你的运动感受、心得、路线、配速等详细信息..."
              disabled={submissionState.isSubmitting}
            />
            {errors.description && (
              <Text className="error-message">{errors.description}</Text>
            )}
          </View>

          {/* 图片上传 */}
          <View className="form-section">
            <ImageUploader
              images={formData.images}
              onChange={handleImagesChange}
              maxCount={9}
              disabled={submissionState.isSubmitting || submissionState.isUploading}
            />
          </View>

          {/* 位置选择 */}
          <View className="form-section">
            <LocationSelector
              location={formData.location}
              onChange={handleLocationChange}
              disabled={submissionState.isSubmitting}
            />
          </View>

          {/* 错误信息显示 */}
          {submissionState.error && (
            <View className="error-section">
              <Text className="error-message">{submissionState.error}</Text>
            </View>
          )}

          {/* 操作按钮 */}
          <View className="form-actions">
            <Button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={submissionState.isSubmitting}
            >
              {submissionState.isSubmitting ? '取消提交' : '取消'}
            </Button>
            <Button
              className={`btn-submit ${canSubmit() && !submissionState.isSubmitting ? 'active' : 'disabled'}`}
              onClick={handleSubmit}
              disabled={!canSubmit() || submissionState.isSubmitting || submissionState.isUploading}
            >
              {submissionState.isSubmitting 
                ? (submissionState.isUploading ? '上传中...' : '创建中...') 
                : '创建记录'
              }
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}