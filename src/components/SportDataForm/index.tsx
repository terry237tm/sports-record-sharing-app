/**
 * SportDataForm 运动数据输入表单组件
 * 提供运动时长、距离、卡路里、心率、步数等数据的输入界面
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { SportDataValidationRules } from '@/types/sport'
import './index.scss'

interface SportDataFormValues {
  duration: string // 时长（分钟）
  distance: string // 距离（公里）
  calories: string // 卡路里
  heartRate: string // 心率（次/分钟）
  steps: string // 步数
}

interface SportDataFormProps {
  /** 表单值 */
  values: SportDataFormValues
  /** 值变化回调函数 */
  onChange: (field: keyof SportDataFormValues, value: string) => void
  /** 验证状态变化回调函数 */
  onValidationChange?: (field: keyof SportDataFormValues, isValid: boolean) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否禁用 */
  disabled?: boolean
}

interface ValidationErrors {
  duration?: string
  distance?: string
  calories?: string
  heartRate?: string
  steps?: string
}

/**
 * 运动数据输入表单组件
 * 提供完整的运动数据输入界面，包含实时验证功能
 */
const SportDataForm: React.FC<SportDataFormProps> = ({
  values,
  onChange,
  onValidationChange,
  className = '',
  style,
  disabled = false
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<keyof SportDataFormValues, boolean>>({})

  /**
   * 验证单个字段
   */
  const validateField = useCallback((field: keyof SportDataFormValues, value: string): string | undefined => {
    const rules = SportDataValidationRules[field]
    if (!rules) return undefined

    // 必填验证
    if (rules.required && (!value || value.trim() === '')) {
      return '此字段为必填项'
    }

    // 如果为空且不是必填项，跳过验证
    if (!rules.required && (!value || value.trim() === '')) {
      return undefined
    }

    // 数字格式验证
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return '请输入有效的数字'
    }

    // 最小值验证
    if (rules.min !== undefined && numValue < rules.min) {
      return rules.message
    }

    // 最大值验证
    if (rules.max !== undefined && numValue > rules.max) {
      return rules.message
    }

    return undefined
  }, [])

  /**
   * 处理字段值变化
   */
  const handleChange = useCallback((field: keyof SportDataFormValues, value: string) => {
    // 只允许输入数字和小数点
    const sanitizedValue = value.replace(/[^\d.]/g, '')
    
    // 限制小数点数量
    const parts = sanitizedValue.split('.')
    if (parts.length > 2) {
      return
    }

    onChange(field, sanitizedValue)

    // 如果字段已被触摸过，实时验证
    if (touched[field]) {
      const error = validateField(field, sanitizedValue)
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
      
      // 调用验证状态回调
      if (onValidationChange) {
        onValidationChange(field, !error)
      }
    }
  }, [onChange, touched, validateField, onValidationChange])

  /**
   * 处理字段失焦
   */
  const handleBlur = useCallback((field: keyof SportDataFormValues) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    const value = values[field]
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))

    // 调用验证状态回调
    if (onValidationChange) {
      onValidationChange(field, !error)
    }
  }, [values, validateField, onValidationChange])

  /**
   * 验证所有字段
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(values).forEach((field) => {
      const fieldName = field as keyof SportDataFormValues
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched({
      duration: true,
      distance: true,
      calories: true,
      heartRate: true,
      steps: true
    })

    return isValid
  }, [values, validateField])

  // 暴露验证方法给父组件
  useEffect(() => {
    // 这里可以通过ref或其他方式暴露给父组件
    // 暂时通过window对象暴露（生产环境中应该使用更好的方式）
    ;(window as any).__validateSportDataForm = validateAll
  }, [validateAll])

  /**
   * 获取输入框状态类名
   */
  const getInputStatus = (field: keyof SportDataFormValues) => {
    if (touched[field] && errors[field]) {
      return 'error'
    }
    if (touched[field] && !errors[field] && values[field]) {
      return 'success'
    }
    return ''
  }

  /**
   * 渲染表单字段
   */
  const renderField = (
    field: keyof SportDataFormValues,
    label: string,
    placeholder: string,
    unit: string,
    required = false
  ) => {
    const error = errors[field]
    const status = getInputStatus(field)

    return (
      <View className={`form-field ${status}`} key={field}>
        <View className="field-label">
          <Text className="label-text">
            {label}
            {required && <Text className="required-mark">*</Text>}
          </Text>
          <Text className="field-unit">{unit}</Text>
        </View>
        <Input
          className={`form-input ${status}`}
          type="text"
          value={values[field]}
          placeholder={placeholder}
          disabled={disabled}
          onInput={(e) => handleChange(field, e.detail.value)}
          onBlur={() => handleBlur(field)}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${field}-error` : undefined}
        />
        {error && (
          <Text 
            className="error-message" 
            id={`${field}-error`}
            role="alert"
          >
            {error}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View 
      className={`sport-data-form ${className}`}
      style={style}
      role="form"
      aria-label="运动数据输入表单"
    >
      <View className="form-section">
        <Text className="section-title">运动数据</Text>
        <View className="form-fields">
          {renderField(
            'duration',
            '运动时长（分钟）',
            '请输入运动时长',
            '分钟',
            true
          )}
          {renderField(
            'distance',
            '运动距离（公里）',
            '请输入运动距离',
            '公里',
            false
          )}
          {renderField(
            'calories',
            '消耗卡路里',
            '请输入消耗卡路里',
            '千卡',
            true
          )}
          {renderField(
            'heartRate',
            '心率（次/分钟）',
            '请输入心率',
            '次/分钟',
            false
          )}
          {renderField(
            'steps',
            '步数',
            '请输入步数',
            '步',
            false
          )}
        </View>
      </View>
    </View>
  )
}

export default SportDataForm