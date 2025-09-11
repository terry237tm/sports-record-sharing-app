/**
 * SportDescriptionInput 运动描述输入组件
 * 提供多行文本输入，支持字数限制和实时计数
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import './index.scss'

interface SportDescriptionInputProps {
  /** 当前文本值 */
  value: string
  /** 值变化回调函数 */
  onChange: (value: string) => void
  /** 验证状态变化回调函数 */
  onValidationChange?: (isValid: boolean) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 最大长度限制 */
  maxLength?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 标签文本 */
  label?: string
  /** 是否显示字数统计 */
  showCount?: boolean
  /** 最小长度要求 */
  minLength?: number
  /** 是否必填 */
  required?: boolean
}

/**
 * 运动描述输入组件
 * 提供多行文本输入功能，支持实时字数统计和限制
 */
const SportDescriptionInput: React.FC<SportDescriptionInputProps> = ({
  value,
  onChange,
  onValidationChange,
  className = '',
  style,
  maxLength = 500,
  disabled = false,
  readOnly = false,
  placeholder = '分享你的运动感受、心得、路线等...',
  label = '运动描述',
  showCount = true,
  minLength = 0,
  required = false
}) => {
  const [currentLength, setCurrentLength] = useState(value.length)
  const [error, setError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)

  /**
   * 验证文本
   */
  const validateText = useCallback((text: string): string | undefined => {
    // 必填验证
    if (required && text.trim().length === 0) {
      return '此字段为必填项'
    }

    // 最小长度验证
    if (text.length < minLength) {
      return `最少需要输入${minLength}个字符`
    }

    // 最大长度验证
    if (text.length > maxLength) {
      return `最多只能输入${maxLength}个字符`
    }

    return undefined
  }, [required, minLength, maxLength])

  /**
   * 处理文本变化
   */
  const handleChange = useCallback((newValue: string) => {
    // 限制最大长度
    const truncatedValue = newValue.slice(0, maxLength)
    
    onChange(truncatedValue)
    setCurrentLength(truncatedValue.length)

    // 如果已经触摸过，实时验证
    if (touched) {
      const validationError = validateText(truncatedValue)
      setError(validationError)
      
      if (onValidationChange) {
        onValidationChange(!validationError)
      }
    }
  }, [onChange, maxLength, touched, validateText, onValidationChange])

  /**
   * 处理失焦事件
   */
  const handleBlur = useCallback(() => {
    setTouched(true)
    
    const validationError = validateText(value)
    setError(validationError)
    
    if (onValidationChange) {
      onValidationChange(!validationError)
    }
  }, [value, validateText, onValidationChange])

  /**
   * 获取字数统计的样式类
   */
  const getCountClassName = () => {
    const percentage = (currentLength / maxLength) * 100
    
    if (percentage > 100) {
      return 'error'
    } else if (percentage > 80) {
      return 'warning'
    } else if (percentage > 60) {
      return 'info'
    }
    return ''
  }

  /**
   * 获取组件状态类名
   */
  const getStatusClassName = () => {
    if (touched && error) {
      return 'error'
    }
    if (touched && !error && value) {
      return 'success'
    }
    return ''
  }

  /**
   * 获取字数统计文本
   */
  const getCountText = () => {
    if (currentLength > maxLength) {
      return `${currentLength}/${maxLength}`
    }
    return `${currentLength}/${maxLength}`
  }

  // 更新当前长度当值变化时
  useEffect(() => {
    setCurrentLength(value.length)
  }, [value])

  return (
    <View 
      className={`sport-description-input ${getStatusClassName()} ${className}`}
      style={style}
    >
      <View className="input-header">
        <Text className="input-label">
          {label}
          {required && <Text className="required-mark">*</Text>}
        </Text>
        
        {showCount && (
          <Text className={`char-count ${getCountClassName()}`}>
            {getCountText()}
          </Text>
        )}
      </View>
      
      <Textarea
        className={`description-textarea ${getStatusClassName()}`}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxlength={maxLength}
        onInput={(e) => handleChange(e.detail.value)}
        onBlur={handleBlur}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? 'description-error' : undefined}
        autoHeight
        fixed
      />
      
      {error && (
        <Text 
          className="error-message" 
          id="description-error"
          role="alert"
        >
          {error}
        </Text>
      )}
      
      <View className="input-footer">
        <Text className="input-hint">
          {placeholder}
        </Text>
      </View>
    </View>
  )
}

export default SportDescriptionInput