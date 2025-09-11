/**
 * 运动记录表单自定义Hook
 * 管理表单状态、验证、提交逻辑
 */

import { useState, useCallback, useMemo } from 'react'
import { 
  SportRecordFormData, 
  SportType, 
  LocationInfo,
  SportDataValidationRules,
  ValidationRule
} from '../types/sport'
import { validateSportForm, formatFormData } from '../utils/sportFormValidation'

// 表单状态接口
export interface SportFormState {
  // 表单数据
  data: SportRecordFormData
  // 验证错误
  errors: Record<string, string>
  // 表单状态
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  isLoading: boolean
  // 提交状态
  submitCount: number
  submitError: string | null
  submitSuccess: boolean
}

// 表单操作接口
export interface SportFormActions {
  // 数据更新
  updateField: (field: keyof SportRecordFormData, value: any) => void
  updateLocation: (location: LocationInfo | undefined) => void
  addImage: (file: File) => void
  removeImage: (index: number) => void
  // 验证
  validateField: (field: keyof SportRecordFormData) => void
  validateForm: () => boolean
  // 表单操作
  resetForm: () => void
  setSubmitting: (submitting: boolean) => void
  setLoading: (loading: boolean) => void
  // 提交相关
  setSubmitError: (error: string | null) => void
  setSubmitSuccess: (success: boolean) => void
  incrementSubmitCount: () => void
}

// Hook返回值接口
export interface UseSportFormReturn {
  state: SportFormState
  actions: SportFormActions
}

// 初始表单数据
const initialFormData: SportRecordFormData = {
  sportType: SportType.RUNNING,
  duration: '',
  distance: '',
  calories: '',
  heartRate: '',
  steps: '',
  description: '',
  images: [],
  location: undefined
}

export function useSportForm(): UseSportFormReturn {
  // 表单状态
  const [state, setState] = useState<SportFormState>({
    data: { ...initialFormData },
    errors: {},
    isDirty: false,
    isValid: false,
    isSubmitting: false,
    isLoading: false,
    submitCount: 0,
    submitError: null,
    submitSuccess: false
  })

  // 更新字段值
  const updateField = useCallback((field: keyof SportRecordFormData, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      isDirty: true,
      errors: {
        ...prev.errors,
        [field]: '' // 清除该字段的错误
      }
    }))
  }, [])

  // 更新位置信息
  const updateLocation = useCallback((location: LocationInfo | undefined) => {
    updateField('location', location)
  }, [updateField])

  // 添加图片
  const addImage = useCallback((file: File) => {
    setState(prev => {
      const newImages = [...prev.data.images, file]
      // 检查图片数量限制
      if (newImages.length > 9) {
        return {
          ...prev,
          errors: {
            ...prev.errors,
            images: '最多只能上传9张图片'
          }
        }
      }
      return {
        ...prev,
        data: {
          ...prev.data,
          images: newImages
        },
        isDirty: true,
        errors: {
          ...prev.errors,
          images: ''
        }
      }
    })
  }, [])

  // 移除图片
  const removeImage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        images: prev.data.images.filter((_, i) => i !== index)
      },
      isDirty: true
    }))
  }, [])

  // 验证单个字段
  const validateField = useCallback((field: keyof SportRecordFormData) => {
    const value = state.data[field]
    const error = validateSportForm(field, value, state.data)
    
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      }
    }))
    
    return !error
  }, [state.data])

  // 验证整个表单
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    let isValid = true

    // 验证所有字段
    const fields: (keyof SportRecordFormData)[] = [
      'sportType', 'duration', 'distance', 'calories', 
      'heartRate', 'steps', 'description', 'images'
    ]

    fields.forEach(field => {
      const error = validateSportForm(field, state.data[field], state.data)
      if (error) {
        errors[field] = error
        isValid = false
      }
    })

    setState(prev => ({
      ...prev,
      errors,
      isValid
    }))

    return isValid
  }, [state.data])

  // 重置表单
  const resetForm = useCallback(() => {
    setState({
      data: { ...initialFormData },
      errors: {},
      isDirty: false,
      isValid: false,
      isSubmitting: false,
      isLoading: false,
      submitCount: 0,
      submitError: null,
      submitSuccess: false
    })
  }, [])

  // 设置提交状态
  const setSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting: submitting
    }))
  }, [])

  // 设置加载状态
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading
    }))
  }, [])

  // 设置提交错误
  const setSubmitError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      submitError: error,
      submitSuccess: false
    }))
  }, [])

  // 设置提交成功
  const setSubmitSuccess = useCallback((success: boolean) => {
    setState(prev => ({
      ...prev,
      submitSuccess: success,
      submitError: null
    }))
  }, [])

  // 增加提交次数
  const incrementSubmitCount = useCallback(() => {
    setState(prev => ({
      ...prev,
      submitCount: prev.submitCount + 1
    }))
  }, [])

  // 自动验证（当字段值改变时）
  const autoValidate = useCallback((field: keyof SportRecordFormData) => {
    if (state.isDirty || state.submitCount > 0) {
      validateField(field)
    }
  }, [state.isDirty, state.submitCount, validateField])

  // 获取格式化数据（用于提交）
  const formattedData = useMemo(() => {
    return formatFormData(state.data)
  }, [state.data])

  const actions: SportFormActions = {
    updateField,
    updateLocation,
    addImage,
    removeImage,
    validateField,
    validateForm,
    resetForm,
    setSubmitting,
    setLoading,
    setSubmitError,
    setSubmitSuccess,
    incrementSubmitCount
  }

  return {
    state: {
      ...state,
      formattedData
    },
    actions
  }
}