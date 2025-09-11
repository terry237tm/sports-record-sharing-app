/**
 * 上传进度组件
 * 显示上传进度、状态、速度等信息
 */

import React, { useState, useEffect } from 'react'
import { View, Progress, Text, Button, Icon } from '@tarojs/components'
import { UploadTask, UploadStatus } from '@/services/imageUpload'
import { UploadQueueItem } from '@/utils/uploadManager'
import Taro from '@tarojs/taro'
import './index.scss'

/**
 * 上传进度组件属性
 */
export interface UploadProgressProps {
  // 任务数据
  tasks?: UploadTask[]
  queueItems?: UploadQueueItem[]
  
  // 整体状态
  totalProgress?: number
  uploadedCount?: number
  totalCount?: number
  uploadSpeed?: number
  estimatedTime?: number
  isUploading?: boolean
  
  // 回调函数
  onCancel?: (taskId: string) => void
  onRetry?: (taskId: string) => void
  onClear?: () => void
  
  // 显示选项
  showIndividualProgress?: boolean
  showSpeed?: boolean
  showTime?: boolean
  showActions?: boolean
  compact?: boolean
  
  // 样式
  className?: string
  style?: React.CSSProperties
}

/**
 * 上传进度组件
 */
export const UploadProgress: React.FC<UploadProgressProps> = ({
  tasks = [],
  queueItems = [],
  totalProgress = 0,
  uploadedCount = 0,
  totalCount = 0,
  uploadSpeed = 0,
  estimatedTime = 0,
  isUploading = false,
  onCancel,
  onRetry,
  onClear,
  showIndividualProgress = true,
  showSpeed = true,
  showTime = true,
  showActions = true,
  compact = false,
  className = '',
  style
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  // 更新时间（用于计算剩余时间）
  useEffect(() => {
    if (!isUploading) return
    
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isUploading])
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  // 格式化速度
  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s'
  }
  
  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.ceil(seconds % 60)
      return `${minutes}分${remainingSeconds}秒`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}小时${minutes}分`
    }
  }
  
  // 获取状态图标
  const getStatusIcon = (status: UploadStatus): string => {
    switch (status) {
      case UploadStatus.PENDING:
        return '⏳'
      case UploadStatus.COMPRESSING:
        return '🔄'
      case UploadStatus.UPLOADING:
        return '⬆️'
      case UploadStatus.SUCCESS:
        return '✅'
      case UploadStatus.FAILED:
        return '❌'
      case UploadStatus.CANCELLED:
        return '🚫'
      default:
        return '❓'
    }
  }
  
  // 获取状态文本
  const getStatusText = (status: UploadStatus): string => {
    switch (status) {
      case UploadStatus.PENDING:
        return '等待上传'
      case UploadStatus.COMPRESSING:
        return '压缩中...'
      case UploadStatus.UPLOADING:
        return '上传中...'
      case UploadStatus.SUCCESS:
        return '上传成功'
      case UploadStatus.FAILED:
        return '上传失败'
      case UploadStatus.CANCELLED:
        return '已取消'
      default:
        return '未知状态'
    }
  }
  
  // 获取状态颜色
  const getStatusColor = (status: UploadStatus): string => {
    switch (status) {
      case UploadStatus.PENDING:
        return '#999'
      case UploadStatus.COMPRESSING:
      case UploadStatus.UPLOADING:
        return '#1890ff'
      case UploadStatus.SUCCESS:
        return '#52c41a'
      case UploadStatus.FAILED:
      case UploadStatus.CANCELLED:
        return '#ff4d4f'
      default:
        return '#999'
    }
  }
  
  // 处理取消上传
  const handleCancel = (taskId: string) => {
    if (onCancel) {
      onCancel(taskId)
    }
  }
  
  // 处理重试上传
  const handleRetry = (taskId: string) => {
    if (onRetry) {
      onRetry(taskId)
    }
  }
  
  // 处理清空队列
  const handleClear = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空所有上传任务吗？',
      success: (res) => {
        if (res.confirm && onClear) {
          onClear()
        }
      }
    })
  }
  
  // 如果没有任务，显示空状态
  if (tasks.length === 0 && queueItems.length === 0 && !isUploading) {
    return null
  }
  
  // 紧凑模式
  if (compact) {
    return (
      <View className={`upload-progress-compact ${className}`} style={style}>
        <View className="progress-header">
          <Text className="progress-text">
            {isUploading ? `上传中 ${uploadedCount}/${totalCount}` : `已完成 ${uploadedCount}/${totalCount}`}
          </Text>
          <Text className="progress-percent">{totalProgress}%</Text>
        </View>
        <Progress 
          percent={totalProgress} 
          strokeWidth={4}
          activeColor="#1890ff"
          backgroundColor="#f0f0f0"
        />
      </View>
    )
  }
  
  // 完整模式
  return (
    <View className={`upload-progress ${className}`} style={style}>
      {/* 总体进度 */}
      {(totalCount > 1 || isUploading) && (
        <View className="overall-progress">
          <View className="progress-header">
            <Text className="progress-title">总体进度</Text>
            <Text className="progress-count">{uploadedCount}/{totalCount}</Text>
          </View>
          <Progress 
            percent={totalProgress} 
            strokeWidth={8}
            activeColor="#1890ff"
            backgroundColor="#f0f0f0"
          />
          <View className="progress-info">
            {showSpeed && uploadSpeed > 0 && (
              <Text className="speed">速度: {formatSpeed(uploadSpeed)}</Text>
            )}
            {showTime && estimatedTime > 0 && (
              <Text className="time">剩余时间: {formatTime(estimatedTime)}</Text>
            )}
          </View>
        </View>
      )}
      
      {/* 单个任务进度 */}
      {showIndividualProgress && tasks.length > 0 && (
        <View className="individual-progress">
          <Text className="section-title">上传任务</Text>
          {tasks.map((task) => (
            <View key={task.id} className="task-item">
              <View className="task-header">
                <Text className="task-icon" style={{ color: getStatusColor(task.status) }}>{getStatusIcon(task.status)}</Text>
                <View className="task-info">
                  <Text className="task-name" style={{ color: getStatusColor(task.status) }}>{getStatusText(task.status)}</Text>
                  <Text className="task-progress">{Math.round(task.progress)}%</Text>
                </View>
                <View className="task-actions">
                  {task.status === UploadStatus.UPLOADING && onCancel && (
                    <Button 
                      size="mini" 
                      type="warn"
                      onClick={() => handleCancel(task.id)}
                    >
                      取消
                    </Button>
                  )}
                  {task.status === UploadStatus.FAILED && onRetry && (
                    <Button 
                      size="mini" 
                      type="primary"
                      onClick={() => handleRetry(task.id)}
                    >
                      重试
                    </Button>
                  )}
                </View>
              </View>
              
              {task.status === UploadStatus.UPLOADING && (
                <Progress 
                  percent={task.progress} 
                  strokeWidth={4}
                  activeColor={getStatusColor(task.status)}
                  backgroundColor="#f0f0f0"
                />
              )}
              
              {task.error && (
                <Text className="task-error">{task.error}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* 队列项目 */}
      {showIndividualProgress && queueItems.length > 0 && (
        <View className="queue-progress">
          <Text className="section-title">等待上传</Text>
          {queueItems.map((item) => (
            <View key={item.id} className="queue-item">
              <Text className="queue-icon">⏳</Text>
              <Text className="queue-name">等待上传</Text>
              <Text className="queue-attempts">{item.attempts > 0 ? `第${item.attempts + 1}次尝试` : ''}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* 操作按钮 */}
      {showActions && isUploading && (
        <View className="progress-actions">
          <Button 
            size="mini" 
            type="warn"
            onClick={handleClear}
          >
            清空队列
          </Button>
        </View>
      )}
    </View>
  )
}

/**
 * 简洁版上传进度组件
 */
export const CompactUploadProgress: React.FC<Omit<UploadProgressProps, 'compact'>> = (props) => {
  return <UploadProgress {...props} compact={true} />
}

/**
 * 圆形进度组件
 */
export const CircularUploadProgress: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercent?: boolean
  className?: string
}> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = '#1890ff',
  backgroundColor = '#f0f0f0',
  showPercent = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <View className={`circular-progress ${className}`} style={{ width: size, height: size }}>
      <svg
        className="circular-progress-svg"
        width={size}
        height={size}
      >
        <circle
          className="circular-progress-background"
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="circular-progress-bar"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.3s ease'
          }}
        />
      </svg>
      {showPercent && (
        <Text className="circular-progress-text">{Math.round(progress)}%</Text>
      )}
    </View>
  )
}

export default UploadProgress