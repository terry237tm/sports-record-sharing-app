/**
 * 图片选择Hook
 * 提供图片选择、验证、压缩等功能的统一接口
 */

import { useState, useCallback, useRef } from 'react'
import Taro from '@tarojs/taro'
import { ImageUploadConfig } from '@/types/sport'
import { 
  validateImageFile, 
  validateWechatImage,
  validateImageCount,
  ImageValidationResult 
} from '@/utils/imageValidation'
import { 
  compressImage, 
  compressImages,
  CompressionResult,
  DEFAULT_COMPRESSION_CONFIG 
} from '@/utils/imageCompression'
import { showToast } from '@/utils/ui'

/**
 * 图片项接口
 */
export interface ImageItem {
  id: string
  file?: File
  tempFilePath?: string
  url: string
  status: 'pending' | 'compressing' | 'compressed' | 'error'
  error?: string
  originalSize?: number
  compressedSize?: number
}

/**
 * Hook配置选项
 */
export interface UseImagePickerOptions {
  maxCount?: number
  maxSize?: number
  compressionConfig?: typeof DEFAULT_COMPRESSION_CONFIG
  onError?: (error: string) => void
  onSuccess?: (images: ImageItem[]) => void
}

/**
 * Hook返回结果
 */
export interface UseImagePickerReturn {
  images: ImageItem[]
  isLoading: boolean
  selectImages: () => Promise<void>
  removeImage: (id: string) => void
  compressImages: () => Promise<void>
  clearImages: () => void
}

/**
 * 生成唯一ID
 */
function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 微信小程序选择图片
 */
async function chooseWechatImages(count: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Taro.chooseImage({
      count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (error) => {
        reject(new Error(`选择图片失败: ${error.errMsg}`))
      }
    })
  })
}

/**
 * H5平台选择图片
 */
async function chooseH5Images(count: number): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ImageUploadConfig.acceptTypes.join(',')
    input.multiple = count > 1
    input.max = count.toString()
    
    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || [])
      resolve(files)
    }
    
    input.click()
  })
}

/**
 * 验证并添加图片
 */
async function validateAndAddImage(
  file: File | string,
  isWechat: boolean
): Promise<ImageItem | null> {
  try {
    const imageItem: ImageItem = {
      id: generateImageId(),
      url: '',
      status: 'pending'
    }
    
    if (isWechat && typeof file === 'string') {
      // 微信小程序图片
      imageItem.tempFilePath = file
      imageItem.url = file
      
      // 验证图片
      const validationResult = await validateWechatImage(file)
      if (!validationResult.valid) {
        imageItem.status = 'error'
        imageItem.error = validationResult.error
        return imageItem
      }
      
      // 获取文件大小
      const fileInfo = await Taro.getFileInfo({ filePath: file })
      imageItem.originalSize = fileInfo.size
      
    } else if (file instanceof File) {
      // H5平台图片
      imageItem.file = file
      imageItem.url = URL.createObjectURL(file)
      
      // 验证图片
      const validationResult = await validateImageFile(file)
      if (!validationResult.valid) {
        imageItem.status = 'error'
        imageItem.error = validationResult.error
        return imageItem
      }
      
      imageItem.originalSize = file.size
    }
    
    return imageItem
  } catch (error) {
    return {
      id: generateImageId(),
      url: '',
      status: 'error',
      error: `图片处理失败: ${error}`
    }
  }
}

/**
 * 压缩单个图片
 */
async function compressSingleImage(
  imageItem: ImageItem,
  config: typeof DEFAULT_COMPRESSION_CONFIG
): Promise<ImageItem> {
  try {
    imageItem.status = 'compressing'
    
    let fileToCompress: File | string
    
    if (imageItem.file) {
      fileToCompress = imageItem.file
    } else if (imageItem.tempFilePath) {
      fileToCompress = imageItem.tempFilePath
    } else {
      throw new Error('没有可用的图片文件')
    }
    
    const compressionResult = await compressImage(fileToCompress, config)
    
    // 更新图片项
    imageItem.status = 'compressed'
    imageItem.compressedSize = compressionResult.compressedSize
    
    if (compressionResult.file instanceof File) {
      // H5平台：更新File对象和URL
      imageItem.file = compressionResult.file
      imageItem.url = URL.createObjectURL(compressionResult.file)
    } else if (compressionResult.file instanceof Blob) {
      // 微信小程序压缩后返回的是Blob，需要创建新的临时文件
      // 注意：这里需要处理微信小程序的特殊情况
      if (imageItem.tempFilePath) {
        // 保持原有的临时文件路径，因为压缩函数内部已经处理了文件转换
        // 压缩后的blob可以用于上传，但预览URL保持不变
        imageItem.url = imageItem.tempFilePath
      }
    }
    
    return imageItem
  } catch (error) {
    imageItem.status = 'error'
    imageItem.error = `压缩失败: ${error}`
    return imageItem
  }
}

/**
 * 图片选择Hook
 */
export function useImagePicker(
  options: UseImagePickerOptions = {}
): UseImagePickerReturn {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const compressionConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...options.compressionConfig }
  
  const maxCount = options.maxCount || ImageUploadConfig.maxCount
  const maxSize = options.maxSize || ImageUploadConfig.maxSize
  
  /**
   * 选择图片
   */
  const selectImages = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 验证数量
      const countResult = validateImageCount(images.length, 1, maxCount)
      if (!countResult.valid) {
        showToast({ title: countResult.error!, icon: 'none' })
        return
      }
      
      // 判断平台
      const isWechat = process.env.TARO_ENV === 'weapp'
      const remainingCount = maxCount - images.length
      
      let selectedFiles: (File | string)[] = []
      
      if (isWechat) {
        // 微信小程序
        const tempFilePaths = await chooseWechatImages(remainingCount)
        selectedFiles = tempFilePaths
      } else {
        // H5平台
        const files = await chooseH5Images(remainingCount)
        selectedFiles = files
      }
      
      // 验证并添加图片
      const newImagePromises = selectedFiles.map(file => 
        validateAndAddImage(file, isWechat)
      )
      
      const newImages = await Promise.all(newImagePromises)
      const validImages = newImages.filter(Boolean) as ImageItem[]
      
      if (validImages.length === 0) {
        showToast({ title: '没有有效的图片被选择', icon: 'none' })
        return
      }
      
      // 更新状态
      const updatedImages = [...images, ...validImages]
      setImages(updatedImages)
      
      // 自动压缩（可选）
      const hasValidImages = validImages.some(img => img.status !== 'error')
      if (hasValidImages) {
        showToast({ 
          title: `已选择 ${validImages.length} 张图片`, 
          icon: 'success' 
        })
      }
      
      // 调用成功回调
      options.onSuccess?.(updatedImages)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '选择图片失败'
      showToast({ title: errorMessage, icon: 'none' })
      options.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [images, maxCount, options])
  
  /**
   * 移除图片
   */
  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove?.url?.startsWith('blob:')) {
        // 释放blob URL
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter(img => img.id !== id)
    })
  }, [])
  
  /**
   * 压缩图片
   */
  const compressImages = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const pendingImages = images.filter(img => img.status === 'pending')
      if (pendingImages.length === 0) {
        showToast({ title: '没有需要压缩的图片', icon: 'none' })
        return
      }
      
      showToast({ title: '开始压缩图片...', icon: 'loading' })
      
      // 并行压缩
      const compressionPromises = pendingImages.map(image =>
        compressSingleImage(image, compressionConfig)
      )
      
      const compressedImages = await Promise.all(compressionPromises)
      
      // 更新状态
      const imageMap = new Map(images.map(img => [img.id, img]))
      compressedImages.forEach(compressed => {
        imageMap.set(compressed.id, compressed)
      })
      
      setImages(Array.from(imageMap.values()))
      
      const successCount = compressedImages.filter(img => img.status === 'compressed').length
      const errorCount = compressedImages.filter(img => img.status === 'error').length
      
      if (errorCount > 0) {
        showToast({ 
          title: `压缩完成，${successCount}张成功，${errorCount}张失败`, 
          icon: 'none' 
        })
      } else {
        showToast({ 
          title: `成功压缩 ${successCount} 张图片`, 
          icon: 'success' 
        })
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '压缩失败'
      showToast({ title: errorMessage, icon: 'none' })
      options.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [images, compressionConfig, options])
  
  /**
   * 清空图片
   */
  const clearImages = useCallback(() => {
    // 释放所有blob URL
    images.forEach(image => {
      if (image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
    })
    setImages([])
  }, [images])
  
  return {
    images,
    isLoading,
    selectImages,
    removeImage,
    compressImages,
    clearImages
  }
}

export default useImagePicker