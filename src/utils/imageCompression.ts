/**
 * 图片压缩工具函数
 * 提供Canvas-based图片压缩功能，支持微信小程序和H5平台
 */

import Taro from '@tarojs/taro'

/**
 * 压缩配置
 */
export interface CompressionConfig {
  maxWidth: number        // 最大宽度
  maxHeight: number       // 最大高度  
  quality: number         // 压缩质量 (0-1)
  maxSize: number         // 最大文件大小 (字节)
  format: 'jpeg' | 'png'  // 输出格式
}

/**
 * 默认压缩配置
 */
export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  maxSize: 2 * 1024 * 1024, // 2MB
  format: 'jpeg'
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  file: File | Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  width: number
  height: number
}

/**
 * 获取图片信息
 */
async function getImageInfo(src: string): Promise<{
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    
    img.onerror = () => {
      reject(new Error('无法加载图片'))
    }
    
    img.src = src
  })
}

/**
 * 计算缩放尺寸
 */
function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }
  
  // 如果图片尺寸已经在限制范围内，直接返回
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  
  // 计算缩放比例
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const ratio = Math.min(widthRatio, heightRatio)
  
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  }
}

/**
 * 使用Canvas压缩图片 (H5平台)
 */
async function compressWithCanvas(
  file: File,
  config: CompressionConfig
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let canvas: HTMLCanvasElement | null = null
    let objectUrl: string | null = null
    
    // 清理函数
    const cleanup = () => {
      if (canvas) {
        // 清理Canvas上下文
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        // 移除Canvas元素
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas)
        }
        canvas = null
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
    }
    
    reader.onload = async (e) => {
      try {
        const img = new Image()
        
        img.onload = async () => {
          try {
            // 计算缩放尺寸
            const scaled = calculateScaledDimensions(
              img.width,
              img.height,
              config.maxWidth,
              config.maxHeight
            )
            
            // 创建Canvas
            canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              cleanup()
              throw new Error('无法创建Canvas上下文')
            }
            
            canvas.width = scaled.width
            canvas.height = scaled.height
            
            // 设置图片质量增强
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
            
            // 转换为Blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  cleanup()
                  reject(new Error('图片压缩失败'))
                  return
                }
                
                // 如果压缩后的大小仍然超过限制，继续压缩
                if (blob.size > config.maxSize) {
                  // 降低质量重新压缩
                  const newQuality = Math.max(0.1, config.quality - 0.1)
                  canvas!.toBlob(
                    (newBlob) => {
                      cleanup()
                      if (!newBlob) {
                        reject(new Error('图片压缩失败'))
                        return
                      }
                      
                      resolve({
                        file: newBlob,
                        originalSize: file.size,
                        compressedSize: newBlob.size,
                        compressionRatio: (file.size - newBlob.size) / file.size,
                        width: scaled.width,
                        height: scaled.height
                      })
                    },
                    `image/${config.format}`,
                    newQuality
                  )
                } else {
                  cleanup()
                  resolve({
                    file: blob,
                    originalSize: file.size,
                    compressedSize: blob.size,
                    compressionRatio: (file.size - blob.size) / file.size,
                    width: scaled.width,
                    height: scaled.height
                  })
                }
              },
              `image/${config.format}`,
              config.quality
            )
          } catch (error) {
            cleanup()
            reject(error)
          }
        }
        
        img.onerror = () => {
          cleanup()
          reject(new Error('无法加载图片'))
        }
        
        objectUrl = e.target?.result as string
        img.src = objectUrl
      } catch (error) {
        cleanup()
        reject(error)
      }
    }
    
    reader.onerror = () => {
      cleanup()
      reject(new Error('无法读取文件'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 微信小程序图片压缩
 */
async function compressWechatImage(
  tempFilePath: string,
  config: CompressionConfig
): Promise<CompressionResult> {
  try {
    // 验证文件路径
    if (!tempFilePath || typeof tempFilePath !== 'string') {
      throw new Error('无效的文件路径')
    }
    
    // 验证文件是否存在
    try {
      await Taro.getFileSystemManager().access({
        path: tempFilePath
      })
    } catch {
      throw new Error('文件不存在或无法访问')
    }
    
    // 获取原始文件信息
    const originalFileInfo = await Taro.getFileInfo({ filePath: tempFilePath })
    
    // 获取图片信息
    const imageInfo = await Taro.getImageInfo({ src: tempFilePath })
    
    // 计算缩放尺寸
    const scaled = calculateScaledDimensions(
      imageInfo.width,
      imageInfo.height,
      config.maxWidth,
      config.maxHeight
    )
    
    // 如果图片已经在限制范围内，直接返回原始文件
    if (imageInfo.width <= config.maxWidth && 
        imageInfo.height <= config.maxHeight && 
        originalFileInfo.size <= config.maxSize) {
      
      // 转换为File对象
      const base64 = await Taro.getFileSystemManager().readFile({
        filePath: tempFilePath,
        encoding: 'base64'
      })
      
      const blob = base64ToBlob(base64.data, `image/${config.format}`)
      return {
        file: blob,
        originalSize: originalFileInfo.size,
        compressedSize: originalFileInfo.size,
        compressionRatio: 0,
        width: imageInfo.width,
        height: imageInfo.height
      }
    }
    
    // 使用Canvas进行压缩
    return new Promise((resolve, reject) => {
      const query = Taro.createSelectorQuery()
      
      query.select('#compress-canvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0]) {
            reject(new Error('无法获取Canvas节点'))
            return
          }
          
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          canvas.width = scaled.width
          canvas.height = scaled.height
          
          // 设置图片质量
          ctx.imageSmoothingEnabled = true
          
          const img = canvas.createImage()
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
            
            // 导出为临时文件
            Taro.canvasToTempFilePath({
              canvas,
              fileType: config.format,
              quality: config.quality,
              success: async (result) => {
                try {
                  // 获取压缩后的文件信息
                  const compressedFileInfo = await Taro.getFileInfo({
                    filePath: result.tempFilePath
                  })
                  
                  // 如果仍然超过大小限制，继续压缩
                  if (compressedFileInfo.size > config.maxSize) {
                    // 递归压缩，降低质量
                    const newConfig = {
                      ...config,
                      quality: Math.max(0.1, config.quality - 0.1)
                    }
                    
                    // 避免无限递归，设置最小质量限制
                    if (newConfig.quality >= 0.1) {
                      try {
                        const recursiveResult = await compressWechatImage(tempFilePath, newConfig)
                        resolve(recursiveResult)
                      } catch (recursiveError) {
                        // 如果递归压缩失败，使用当前结果
                        const base64 = await Taro.getFileSystemManager().readFile({
                          filePath: result.tempFilePath,
                          encoding: 'base64'
                        })
                        
                        const blob = base64ToBlob(base64.data, `image/${config.format}`)
                        resolve({
                          file: blob,
                          originalSize: originalFileInfo.size,
                          compressedSize: compressedFileInfo.size,
                          compressionRatio: (originalFileInfo.size - compressedFileInfo.size) / originalFileInfo.size,
                          width: scaled.width,
                          height: scaled.height
                        })
                      }
                    } else {
                      // 质量已经最低，返回当前结果
                      const base64 = await Taro.getFileSystemManager().readFile({
                        filePath: result.tempFilePath,
                        encoding: 'base64'
                      })
                      
                      const blob = base64ToBlob(base64.data, `image/${config.format}`)
                      resolve({
                        file: blob,
                        originalSize: originalFileInfo.size,
                        compressedSize: compressedFileInfo.size,
                        compressionRatio: (originalFileInfo.size - compressedFileInfo.size) / originalFileInfo.size,
                        width: scaled.width,
                        height: scaled.height
                      })
                    }
                  } else {
                    // 转换为File对象
                    const base64 = await Taro.getFileSystemManager().readFile({
                      filePath: result.tempFilePath,
                      encoding: 'base64'
                    })
                    
                    const blob = base64ToBlob(base64.data, `image/${config.format}`)
                    resolve({
                      file: blob,
                      originalSize: originalFileInfo.size,
                      compressedSize: compressedFileInfo.size,
                      compressionRatio: (originalFileInfo.size - compressedFileInfo.size) / originalFileInfo.size,
                      width: scaled.width,
                      height: scaled.height
                    })
                  }
                } catch (error) {
                  reject(error)
                }
              },
              fail: reject
            })
          }
          
          img.onerror = () => {
            reject(new Error('无法加载图片'))
          }
          
          img.src = tempFilePath
        })
    })
  } catch (error) {
    throw new Error(`微信小程序图片压缩失败: ${error}`)
  }
}

/**
 * Base64转Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64)
  const arrayBuffer = new ArrayBuffer(bytes.length)
  const uint8Array = new Uint8Array(arrayBuffer)
  
  for (let i = 0; i < bytes.length; i++) {
    uint8Array[i] = bytes.charCodeAt(i)
  }
  
  return new Blob([arrayBuffer], { type: mimeType })
}

/**
 * 压缩图片（自动判断平台）
 */
export async function compressImage(
  file: File | string, // File对象（H5）或临时文件路径（微信小程序）
  config: Partial<CompressionConfig> = {}
): Promise<CompressionResult> {
  const finalConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config }
  
  try {
    // 判断平台
    const isWechat = process.env.TARO_ENV === 'weapp'
    
    if (isWechat && typeof file === 'string') {
      // 微信小程序压缩
      return await compressWechatImage(file, finalConfig)
    } else if (file instanceof File) {
      // H5平台压缩
      return await compressWithCanvas(file, finalConfig)
    } else {
      throw new Error('不支持的文件类型或平台')
    }
  } catch (error) {
    throw new Error(`图片压缩失败: ${error}`)
  }
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  files: (File | string)[],
  config: Partial<CompressionConfig> = {}
): Promise<CompressionResult[]> {
  const promises = files.map(file => compressImage(file, config))
  return Promise.all(promises)
}

/**
 * 获取压缩建议
 */
export function getCompressionSuggestion(
  originalSize: number,
  targetSize: number = DEFAULT_COMPRESSION_CONFIG.maxSize
): {
  quality: number
  maxWidth: number
  maxHeight: number
} {
  const ratio = targetSize / originalSize
  
  if (ratio >= 0.8) {
    // 轻微压缩
    return {
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1920
    }
  } else if (ratio >= 0.5) {
    // 中等压缩
    return {
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280
    }
  } else if (ratio >= 0.3) {
    // 较强压缩
    return {
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024
    }
  } else {
    // 强力压缩
    return {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800
    }
  }
}