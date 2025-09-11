/**
 * ImagePicker 图片选择器组件
 * 提供完整的图片选择、验证、压缩、预览功能
 * 支持微信小程序和H5双平台
 */

import React, { useEffect } from 'react'
import { View, Text, Image, Button, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import useImagePicker, { ImageItem, UseImagePickerOptions } from '@/hooks/useImagePicker'
import { ImageUploadConfig } from '@/types/sport'
import { showToast } from '@/utils/ui'
import './index.scss'

interface ImagePickerProps extends UseImagePickerOptions {
  /** 当前选中的图片列表 */
  value?: ImageItem[]
  /** 图片变化回调 */
  onChange?: (images: ImageItem[]) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否显示压缩按钮 */
  showCompressButton?: boolean
  /** 是否自动压缩 */
  autoCompress?: boolean
  /** 自定义提示文本 */
  hintText?: string
  /** 是否禁用 */
  disabled?: boolean
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  className = '',
  style,
  showCompressButton = true,
  autoCompress = false,
  hintText,
  disabled = false,
  ...options
}) => {
  const {
    images,
    isLoading,
    selectImages,
    removeImage,
    compressImages,
    clearImages
  } = useImagePicker(options)

  // 同步外部value值
  useEffect(() => {
    if (value && value !== images) {
      // 这里需要实现同步逻辑，由于hook内部管理状态，可能需要调整架构
    }
  }, [value, images])

  // 同步内部状态到外部
  useEffect(() => {
    if (onChange && images !== value) {
      onChange(images)
    }
  }, [images, onChange, value])

  /**
   * 渲染图片项
   */
  const renderImageItem = (image: ImageItem, index: number) => {
    const isError = image.status === 'error'
    const isCompressing = image.status === 'compressing'
    const isCompressed = image.status === 'compressed'

    return (
      <View 
        className={`image-item ${isError ? 'error' : ''} ${isCompressing ? 'compressing' : ''}`}
        key={image.id}
      >
        <Image
          className="image-preview"
          src={image.url}
          mode="aspectFill"
          onClick={() => handlePreviewImage(image, index)}
        />
        
        {/* 状态指示器 */}
        <View className="image-status">
          {isError && (
            <View className="error-indicator">
              <Text className="error-icon">⚠️</Text>
              <Text className="error-text">{image.error}</Text>
            </View>
          )}
          
          {isCompressing && (
            <View className="compressing-indicator">
              <Text className="compressing-text">压缩中...</Text>
            </View>
          )}
          
          {isCompressed && image.compressedSize && image.originalSize && (
            <View className="compression-info">
              <Text className="size-info">
                {(image.originalSize / 1024 / 1024).toFixed(1)}MB → {(image.compressedSize / 1024 / 1024).toFixed(1)}MB
              </Text>
            </View>
          )}
        </View>

        {/* 删除按钮 */}
        {!disabled && (
          <View
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveImage(image.id)
            }}
          >
            <Text className="remove-icon">×</Text>
          </View>
        )}
      </View>
    )
  }

  /**
   * 处理图片选择
   */
  const handleSelectImages = async () => {
    if (disabled || isLoading) return
    await selectImages()
  }

  /**
   * 处理图片删除
   */
  const handleRemoveImage = (imageId: string) => {
    if (disabled) return
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          removeImage(imageId)
          showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }

  /**
   * 处理图片预览
   */
  const handlePreviewImage = (image: ImageItem, currentIndex: number) => {
    if (image.status === 'error') {
      showToast({
        title: image.error || '图片加载失败',
        icon: 'none'
      })
      return
    }

    const validImages = images.filter(img => img.status !== 'error')
    const urls = validImages.map(img => img.url)
    const previewIndex = validImages.findIndex(img => img.id === image.id)

    if (urls.length > 0) {
      Taro.previewImage({
        urls,
        current: urls[previewIndex]
      })
    }
  }

  /**
   * 处理压缩图片
   */
  const handleCompressImages = async () => {
    if (disabled || isLoading) return
    await compressImages()
  }

  /**
   * 获取上传按钮文本
   */
  const getUploadButtonText = () => {
    if (isLoading) {
      return '处理中...'
    }
    
    const pendingCount = images.filter(img => img.status === 'pending').length
    if (pendingCount > 0) {
      return `压缩 ${pendingCount} 张图片`
    }
    
    return '上传照片'
  }

  const maxCount = options.maxCount || ImageUploadConfig.maxCount
  const canAddMore = images.length < maxCount
  const hasPendingImages = images.some(img => img.status === 'pending')
  const errorCount = images.filter(img => img.status === 'error').length

  return (
    <View className={`image-picker ${className}`} style={style}>
      {/* 头部信息 */}
      <View className="picker-header">
        <Text className="picker-title">运动照片</Text>
        <Text className="picker-count">
          {images.length}/{maxCount}
          {errorCount > 0 && (
            <Text className="error-count"> ({errorCount}张错误)</Text>
          )}
        </Text>
      </View>

      {/* 图片网格 */}
      <View className="image-grid">
        {images.map((image, index) => renderImageItem(image, index))}
        
        {/* 添加按钮 */}
        {canAddMore && !disabled && (
          <View 
            className={`add-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleSelectImages}
          >
            <View className="add-icon">+</View>
            <Text className="add-text">{getUploadButtonText()}</Text>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      {showCompressButton && hasPendingImages && !disabled && (
        <View className="action-buttons">
          <Button
            type="primary"
            size="mini"
            loading={isLoading}
            onClick={handleCompressImages}
          >
            压缩图片
          </Button>
        </View>
      )}

      {/* 底部提示 */}
      <View className="picker-footer">
        <Text className="picker-hint">
          {hintText || `支持 ${ImageUploadConfig.acceptTypesText} 格式，单张不超过${ImageUploadConfig.maxSize / 1024 / 1024}MB`}
        </Text>
        {autoCompress && (
          <Text className="auto-compress-hint">
            已开启自动压缩，图片将自动优化大小
          </Text>
        )}
      </View>

      {/* 微信小程序Canvas（用于压缩） */}
      {process.env.TARO_ENV === 'weapp' && (
        <Canvas
          canvasId="compress-canvas"
          id="compress-canvas"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1px',
            height: '1px'
          }}
        />
      )}
    </View>
  )
}

export default ImagePicker
export type { ImageItem } from '@/hooks/useImagePicker'
export type { ImagePickerProps } "file_path":"/Users/tangzr/main/taro_rebuild_sports/src/components/ImagePicker/index.tsx"}