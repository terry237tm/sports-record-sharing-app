/**
 * 图片验证工具函数
 * 提供图片格式、大小等验证功能
 */

import { ImageUploadConfig } from '@/types/sport'
import Taro from '@tarojs/taro'

/**
 * 支持的图片格式
 */
export const SUPPORTED_FORMATS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg', 
  'image/png': '.png'
} as const

export type SupportedFormat = keyof typeof SUPPORTED_FORMATS

/**
 * 图片验证结果
 */
export interface ImageValidationResult {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * 验证图片格式
 * @param fileType - 文件MIME类型
 * @returns 验证结果
 */
export function validateImageFormat(fileType: string): ImageValidationResult {
  if (!SUPPORTED_FORMATS[fileType as SupportedFormat]) {
    return {
      valid: false,
      error: `不支持的图片格式，请使用 ${ImageUploadConfig.acceptTypesText} 格式`
    }
  }
  
  return { valid: true }
}

/**
 * 验证图片文件大小
 * @param fileSize - 文件大小（字节）
 * @param maxSize - 最大允许大小（字节）
 * @returns 验证结果
 */
export function validateImageSize(
  fileSize: number, 
  maxSize: number = ImageUploadConfig.maxSize
): ImageValidationResult {
  if (fileSize > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `图片大小不能超过 ${sizeInMB}MB`
    }
  }
  
  return { valid: true }
}

/**
 * 验证图片数量和总大小
 * @param currentCount - 当前图片数量
 * @param newCount - 新增图片数量
 * @param maxCount - 最大允许数量
 * @returns 验证结果
 */
export function validateImageCount(
  currentCount: number,
  newCount: number,
  maxCount: number = ImageUploadConfig.maxCount
): ImageValidationResult {
  if (currentCount + newCount > maxCount) {
    return {
      valid: false,
      error: `最多只能上传 ${maxCount} 张图片，当前已选择 ${currentCount} 张`
    }
  }
  
  return { valid: true }
}

/**
 * 获取图片文件信息（微信小程序）
 * @param filePath - 图片文件路径
 * @returns 文件信息
 */
export async function getImageFileInfo(filePath: string): Promise<{
  size: number
  type: string
}> {
  try {
    const fileInfo = await Taro.getFileInfo({ filePath })
    
    // 通过微信小程序API获取图片信息来确定格式
    let imageType = 'image/jpeg' // 默认格式
    try {
      const imageInfo = await Taro.getImageInfo({ src: filePath })
      // 根据图片信息推断格式，如果type字段存在则使用，否则根据路径推断
      if (imageInfo.type) {
        imageType = `image/${imageInfo.type}`
      } else if (filePath.toLowerCase().includes('.png')) {
        imageType = 'image/png'
      } else if (filePath.toLowerCase().includes('.jpg') || filePath.toLowerCase().includes('.jpeg')) {
        imageType = 'image/jpeg'
      }
    } catch {
      // 如果获取图片信息失败，继续使用默认格式
    }
    
    return {
      size: fileInfo.size,
      type: imageType
    }
  } catch (error) {
    throw new Error(`获取文件信息失败: ${error}`)
  }
}

/**
 * 验证图片尺寸
 * @param width - 图片宽度
 * @param height - 图片高度
 * @param maxWidth - 最大允许宽度
 * @param maxHeight - 最大允许高度
 * @returns 验证结果
 */
export function validateImageDimensions(
  width: number,
  height: number,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): ImageValidationResult {
  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      error: `图片尺寸过大，最大支持 ${maxWidth}x${maxHeight} 像素`
    }
  }
  
  if (width < 100 || height < 100) {
    return {
      valid: false,
      error: '图片尺寸过小，最小支持 100x100 像素'
    }
  }
  
  return { valid: true }
}

/**
 * 综合验证图片文件
 * @param file - 图片文件
 * @param options - 验证选项
 * @returns 验证结果
 */
export async function validateImageFile(
  file: File,
  options?: {
    maxSize?: number
    maxWidth?: number
    maxHeight?: number
    skipDimensionCheck?: boolean // 是否跳过尺寸检查（用于性能优化）
  }
): Promise<ImageValidationResult> {
  // 验证格式
  const formatResult = validateImageFormat(file.type)
  if (!formatResult.valid) {
    return formatResult
  }
  
  // 验证大小
  const sizeResult = validateImageSize(file.size, options?.maxSize)
  if (!sizeResult.valid) {
    return sizeResult
  }
  
  // 如果跳过尺寸检查，直接返回成功
  if (options?.skipDimensionCheck) {
    return { valid: true }
  }
  
  // 验证尺寸（如果可能）
  try {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    return new Promise((resolve) => {
      // 设置超时，防止大尺寸图片加载过慢
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
        resolve({ 
          valid: false, 
          error: '图片加载超时，请检查文件是否过大或损坏',
          warning: '建议压缩图片后再上传'
        })
      }, 10000) // 10秒超时
      
      img.onload = () => {
        clearTimeout(timeoutId)
        URL.revokeObjectURL(objectUrl)
        const dimensionResult = validateImageDimensions(
          img.width,
          img.height,
          options?.maxWidth,
          options?.maxHeight
        )
        resolve(dimensionResult)
      }
      
      img.onerror = () => {
        clearTimeout(timeoutId)
        URL.revokeObjectURL(objectUrl)
        resolve({ 
          valid: false, 
          error: '无法读取图片信息，请检查文件是否损坏' 
        })
      }
      
      img.src = objectUrl
    })
  } catch (error) {
    return {
      valid: false,
      error: `图片验证失败: ${error}`
    }
  }
}

/**
 * 验证微信小程序选择的图片
 * @param tempFilePath - 临时文件路径
 * @param options - 验证选项
 * @returns 验证结果
 */
export async function validateWechatImage(
  tempFilePath: string,
  options?: {
    maxSize?: number
    maxWidth?: number
    maxHeight?: number
    skipDimensionCheck?: boolean // 是否跳过尺寸检查（用于性能优化）
  }
): Promise<ImageValidationResult> {
  try {
    // 验证文件路径
    if (!tempFilePath || typeof tempFilePath !== 'string') {
      return {
        valid: false,
        error: '无效的文件路径'
      }
    }
    
    // 验证文件是否存在
    try {
      await Taro.getFileSystemManager().access({
        path: tempFilePath
      })
    } catch {
      return {
        valid: false,
        error: '文件不存在或无法访问'
      }
    }
    
    const fileInfo = await getImageFileInfo(tempFilePath)
    
    // 验证格式
    const formatResult = validateImageFormat(fileInfo.type)
    if (!formatResult.valid) {
      return formatResult
    }
    
    // 验证大小
    const sizeResult = validateImageSize(fileInfo.size, options?.maxSize)
    if (!sizeResult.valid) {
      return sizeResult
    }
    
    // 如果跳过尺寸检查，直接返回成功
    if (options?.skipDimensionCheck) {
      return { valid: true }
    }
    
    // 验证尺寸（微信小程序）
    try {
      const imageInfo = await Taro.getImageInfo({ src: tempFilePath })
      const dimensionResult = validateImageDimensions(
        imageInfo.width,
        imageInfo.height,
        options?.maxWidth,
        options?.maxHeight
      )
      return dimensionResult
    } catch (error) {
      return {
        valid: false,
        error: `无法获取图片尺寸信息: ${error}`
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: `图片验证失败: ${error}`
    }
  }
}