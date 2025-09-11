/**
 * SportTypeSelector 运动类型选择组件
 * 提供多种运动类型的图标化选择界面
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { SportType, SportTypeLabels, SportTypeIcons } from '@/types/sport'
import './index.scss'

interface SportTypeSelectorProps {
  /** 当前选中的运动类型 */
  value: SportType | string
  /** 选择变化回调函数 */
  onChange: (sportType: SportType) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 运动类型选择组件
 * 提供网格布局的运动类型选择界面，包含图标和文字标签
 */
const SportTypeSelector: React.FC<SportTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  style,
  disabled = false
}) => {
  // 运动类型列表，定义显示顺序
  const sportTypes = [
    SportType.RUNNING,
    SportType.CYCLING,
    SportType.SWIMMING,
    SportType.FITNESS,
    SportType.HIKING,
    SportType.BASKETBALL,
    SportType.FOOTBALL,
    SportType.BADMINTON,
    SportType.TENNIS,
    SportType.OTHER
  ]

  /**
   * 处理运动类型选择
   */
  const handleSelect = (sportType: SportType) => {
    if (disabled) return
    onChange(sportType)
  }

  /**
   * 获取运动类型项的CSS类名
   */
  const getItemClassName = (sportType: SportType) => {
    const baseClass = 'sport-type-item'
    const selectedClass = value === sportType ? 'selected' : ''
    const disabledClass = disabled ? 'disabled' : ''
    
    return [baseClass, selectedClass, disabledClass].filter(Boolean).join(' ')
  }

  return (
    <View 
      className={`sport-type-selector ${className}`}
      style={style}
    >
      <Text className="selector-title">选择运动类型</Text>
      <View 
        className="sport-type-grid"
        role="list"
        aria-label="运动类型选择"
      >
        {sportTypes.map((sportType) => (
          <View
            key={sportType}
            className={getItemClassName(sportType)}
            role="listitem"
            onClick={() => handleSelect(sportType)}
            aria-selected={value === sportType}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled) {
                handleSelect(sportType)
              }
            }}
          >
            <View className="sport-icon">
              {SportTypeIcons[sportType]}
            </View>
            <Text className="sport-label">
              {SportTypeLabels[sportType]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default SportTypeSelector