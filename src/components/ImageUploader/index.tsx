/**
 * ImageUploader 图片上传组件
 * 提供图片选择和预览功能
 */

import React, { useState, useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ImageUploadConfig } from '@/types/sport'
import { showToast } from '@/utils/ui'
import './index.scss'

interface ImageUploaderProps {
  /** 当前图片文件列表 */
  images: File[]
  /** 图片变化回调 */
  onChange: (images: File[]) => void
  /** 最大上传数量 */
  maxCount?: number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxCount = ImageUploadConfig.maxCount,
  className = '',
  style
}) => {
  const [previewIndex, setPreviewIndex] = useState(-1)

  /**
   * 转换路径为File对象
   */
  const convertPathToFile = async (path: string): Promise<File | null> => {
    try {
      // 这里需要根据实际的Taro API来实现文件转换
      // 由于Taro的限制，这里返回一个模拟的File对象
      const response = await fetch(path)
      const blob = await response.blob()
      
      return new File([blob], `image_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })
    } catch (error) {
      console.error('转换文件失败:', error)
      return null
    }
  }

  /**
   * 选择图片
   */
  const handleChooseImage = useCallback(async () => {
    if (images.length >= maxCount) {
      showToast({
        title: `最多只能上传${maxCount}张图片`,
        icon: 'none'
      })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: maxCount - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      // 验证文件大小
      const validFiles: File[] = []
      for (const path of res.tempFilePaths) {
        const fileInfo = await Taro.getFileInfo({ filePath: path })
        
        if (fileInfo.size > ImageUploadConfig.maxSize) {
          showToast({
            title: '图片大小不能超过2MB',
            icon: 'none'
          })
          continue
        }

        // 转换路径为File对象（这里简化处理，实际需要根据Taro的API调整）
        const file = await convertPathToFile(path)
        if (file) {
          validFiles.push(file)
        }
      }

      if (validFiles.length > 0) {
        onChange([...images, ...validFiles])
      }

    } catch (error) {
      console.error('选择图片失败:', error)
      showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  }, [images, maxCount, onChange])

  /**
   * 删除图片
   */
  const handleRemoveImage = useCallback((index: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const newImages = images.filter((_, i) => i !== index)
          onChange(newImages)
        }
      }
    })
  }, [images, onChange])

  /**
   * 预览图片
   */
  const handlePreviewImage = useCallback((index: number) => {
    const urls = images.map(file => URL.createObjectURL(file))
    
    Taro.previewImage({
      urls,
      current: urls[index]
    })

    setPreviewIndex(index)
  }, [images])

  /**
   * 渲染图片项
   */
  const renderImageItem = (file: File, index: number) => {
    const imageUrl = URL.createObjectURL(file)
    
    return (
      <View className="image-item" key={index}>
        <Image
          className="image-preview"
          src={imageUrl}
          mode="aspectFill"
          onClick={() => handlePreviewImage(index)}
        />
        <View
          className="remove-btn"
          onClick={() => handleRemoveImage(index)}
        >
          <Text className="remove-icon">×</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`image-uploader ${className}`} style={style}>
      <View className="uploader-header">
        <Text className="uploader-title">运动照片</Text>
        <Text className="uploader-count">{images.length}/{maxCount}</Text>
      </View>
      
      <View className="image-grid">
        {images.map((file, index) => renderImageItem(file, index))}
        
        {images.length < maxCount && (
          <View className="upload-btn" onClick={handleChooseImage}>
            <View className="upload-icon">+</View>
            <Text className="upload-text">上传照片</Text>
          </View>
        )}
      </View>
      
      <View className="uploader-footer">
        <Text className="uploader-hint">
          支持 {ImageUploadConfig.acceptTypesText} 格式，单张不超过2MB
        </Text>
      </View>
    </View>
  )
}

export default ImageUploader