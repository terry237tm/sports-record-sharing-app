/**
 * ImagePreview 图片预览组件
 * 提供缩略图展示、状态显示、删除功能、点击预览等核心功能
 * 支持响应式布局和暗色主题
 */

import React, { useState, useCallback } from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ImageItem } from '@/hooks/useImagePicker'
import { showToast } from '@/utils/ui'
import './index.scss'

/**
 * 图片预览组件属性
 */
export interface ImagePreviewProps {
  /** 图片数据 */
  image: ImageItem
  /** 图片索引 */
  index: number
  /** 是否显示删除按钮 */
  showRemove?: boolean
  /** 是否可点击预览 */
  clickable?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 删除回调 */
  onRemove?: (imageId: string) => void
  /** 预览回调 */
  onPreview?: (image: ImageItem, index: number) => void
  /** 图片加载错误回调 */
  onError?: (image: ImageItem, error: string) => void
  /** 图片尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 形状 */
  shape?: 'square' | 'rounded' | 'circle'
  /** 是否显示状态信息 */
  showStatus?: boolean
  /** 是否显示压缩信息 */
  showCompressionInfo?: boolean
}

/**
 * 图片预览组件
 * 用于展示单张图片的缩略图，支持状态显示和交互操作
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  index,
  showRemove = true,
  clickable = true,
  className = '',
  style,
  onRemove,
  onPreview,
  onError,
  size = 'medium',
  shape = 'square',
  showStatus = true,
  showCompressionInfo = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  /**
   * 处理图片点击
   */
  const handleClick = useCallback(() => {
    if (!clickable || image.status === 'error') {
      return
    }

    if (image.status === 'error') {
      showToast({
        title: image.error || '图片加载失败',
        icon: 'none'
      })
      return
    }

    if (onPreview) {
      onPreview(image, index)
    } else {
      // 默认预览行为
      handleDefaultPreview()
    }
  }, [image, index, clickable, onPreview])

  /**
   * 默认预览实现
   */
  const handleDefaultPreview = useCallback(() => {
    if (image.status === 'error') {
      return
    }

    // 使用Taro的图片预览API
    Taro.previewImage({
      urls: [image.url],
      current: image.url,
      success: () => {
        console.log('图片预览成功')
      },
      fail: (error) => {
        console.error('图片预览失败:', error)
        showToast({
          title: '预览失败',
          icon: 'none'
        })
      }
    })
  }, [image])

  /**
   * 处理删除
   */
  const handleRemove = useCallback((event: any) => {
    event.stopPropagation()
    
    if (!onRemove) {
      return
    }

    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          onRemove(image.id)
          showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }, [image.id, onRemove])

  /**
   * 处理图片加载成功
   */
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  /**
   * 处理图片加载失败
   */
  const handleImageError = useCallback(() => {
    setImageLoaded(false)
    setImageError(true)
    const errorMsg = '图片加载失败'
    setImageError(true)
    
    if (onError) {
      onError(image, errorMsg)
    }
  }, [image, onError])

  /**
   * 获取状态图标
   */
  const getStatusIcon = () => {
    switch (image.status) {
      case 'pending':
        return '⏳'
      case 'compressing':
        return '🔄'
      case 'compressed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return ''
    }
  }

  /**
   * 获取状态文本
   */
  const getStatusText = () => {
    switch (image.status) {
      case 'pending':
        return '待处理'
      case 'compressing':
        return '压缩中'
      case 'compressed':
        return '已压缩'
      case 'error':
        return image.error || '处理失败'
      default:
        return ''
    }
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = () => {
    switch (image.status) {
      case 'pending':
        return '#999'
      case 'compressing':
        return '#1890ff'
      case 'compressed':
        return '#52c41a'
      case 'error':
        return '#ff4d4f'
      default:
        return '#999'
    }
  }

  /**
   * 获取压缩比例
   */
  const getCompressionRatio = () => {
    if (!image.originalSize || !image.compressedSize) {
      return null
    }
    const ratio = Math.round(((image.originalSize - image.compressedSize) / image.originalSize) * 100)
    return ratio > 0 ? `-${ratio}%` : null
  }

  const isError = image.status === 'error'
  const isCompressing = image.status === 'compressing'
  const isCompressed = image.status === 'compressed'
  const showCompressionRatio = isCompressed && showCompressionInfo

  return (
    <View 
      className={[
        'image-preview',
        `image-preview--${size}`,
        `image-preview--${shape}`,
        isError ? 'image-preview--error' : '',
        isCompressing ? 'image-preview--compressing' : '',
        clickable && !isError ? 'image-preview--clickable' : '',
        className
      ].filter(Boolean).join(' ')}
      style={style}
      onClick={handleClick}
    >
      {/* 图片主体 */}
      <View className="image-preview__container">
        <Image
          className={[
            'image-preview__image',
            imageLoaded ? 'image-preview__image--loaded' : '',
            imageError ? 'image-preview__image--error' : ''
          ].filter(Boolean).join(' ')}
          src={image.url}
          mode="aspectFill"
          lazyLoad
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* 加载占位符 */}
        {!imageLoaded && !imageError && (
          <View className="image-preview__placeholder">
            <Text className="image-preview__placeholder-icon">📷</Text>
            <Text className="image-preview__placeholder-text">加载中...</Text>
          </View>
        )}

        {/* 错误状态 */}
        {imageError && (
          <View className="image-preview__error">
            <Text className="image-preview__error-icon">⚠️</Text>
            <Text className="image-preview__error-text">加载失败</Text>
          </View>
        )}
      </View>

      {/* 状态指示器 */}
      {showStatus && (
        <View className="image-preview__status">
          <View 
            className="image-preview__status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          >
            <Text className="image-preview__status-icon">{getStatusIcon()}</Text>
            <Text className="image-preview__status-text">{getStatusText()}</Text>
          </View>

          {/* 压缩信息 */}
          {showCompressionRatio && (
            <View className="image-preview__compression">
              <Text className="image-preview__compression-ratio">
                {getCompressionRatio()}
              </Text>
              {image.originalSize && image.compressedSize && (
                <Text className="image-preview__compression-size">
                  {(image.originalSize / 1024 / 1024).toFixed(1)}MB → {(image.compressedSize / 1024 / 1024).toFixed(1)}MB
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* 删除按钮 */}
      {showRemove && (
        <View
          className="image-preview__remove"
          onClick={handleRemove}
        >
          <Text className="image-preview__remove-icon">×</Text>
        </View>
      )}

      {/* 点击遮罩 */}
      {clickable && !isError && (
        <View className="image-preview__overlay">
          <Text className="image-preview__overlay-text">点击查看</Text>
        </View>
      )}
    </View>
  )
}

/**
 * 图片预览列表组件
 * 用于展示多个图片预览
 */
export interface ImagePreviewListProps {
  /** 图片列表 */
  images: ImageItem[]
  /** 列数 */
  columns?: number
  /** 间距 */
  gap?: number
  /** 其他ImagePreview属性 */
  previewProps?: Omit<ImagePreviewProps, 'image' | 'index'>
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 图片预览列表组件
 */
export const ImagePreviewList: React.FC<ImagePreviewListProps> = ({
  images,
  columns = 3,
  gap = 8,
  previewProps,
  className = '',
  style
}) => {
  return (
    <View 
      className={`image-preview-list ${className}`}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <ImagePreview
          key={image.id}
          image={image}
          index={index}
          {...previewProps}
        />
      ))}
    </View>
  )
}

export default ImagePreview
export type { ImagePreviewProps, ImagePreviewListProps }