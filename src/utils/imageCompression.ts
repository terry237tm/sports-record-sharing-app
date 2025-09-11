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
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              throw new Error('无法创建Canvas上下文')
            }
            
            canvas.width = scaled.width
            canvas.height = scaled.height
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
            
            // 转换为Blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('图片压缩失败'))
                  return
                }
                
                // 如果压缩后的大小仍然超过限制，继续压缩
                if (blob.size > config.maxSize) {
                  // 降低质量重新压缩
                  const newQuality = Math.max(0.1, config.quality - 0.1)
                  canvas.toBlob(
                    (newBlob) => {
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
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('无法加载图片'))
        }
        
        img.src = e.target?.result as string
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
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
    // 获取图片信息
    const imageInfo = await Taro.getImageInfo({ src: tempFilePath })
    
    // 计算缩放尺寸
    const scaled = calculateScaledDimensions(
      imageInfo.width,
      imageInfo.height,
      config.maxWidth,
      config.maxHeight
    )
    
    // 使用Canvas进行压缩
    return new Promise((resolve, reject) => {
      const query = Taro.createSelectorQuery()
      
      query.select('#compress-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) {
            reject(new Error('无法获取Canvas节点'))
            return
          }
          
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          canvas.width = scaled.width
          canvas.height = scaled.height
          
          const img = canvas.createImage()
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
            
            // 导出为临时文件
            Taro.canvasToTempFilePath({
              canvas,
              fileType: config.format,
              quality: config.quality,
              success: (result) => {
                // 获取压缩后的文件信息
                Taro.getFileInfo({
                  filePath: result.tempFilePath,
                  success: (fileInfo) => {
                    // 如果仍然超过大小限制，继续压缩
                    if (fileInfo.size > config.maxSize) {
                      // 递归压缩，降低质量
                      const newConfig = {
                        ...config,
                        quality: Math.max(0.1, config.quality - 0.1)
                      }
                      compressWechatImage(tempFilePath, newConfig)
                        .then(resolve)
                        .catch(reject)
                    } else {
                      // 转换为File对象
                      Taro.getFileSystemManager().readFile({
                        filePath: result.tempFilePath,
                        encoding: 'base64',
                        success: (base64) => {
                          const blob = base64ToBlob(base64.data, `image/${config.format}`)
                          resolve({
                            file: blob,
                            originalSize: fileInfo.size, // 这里用压缩后的大小作为原始大小
                            compressedSize: fileInfo.size,
                            compressionRatio: 0,
                            width: scaled.width,
                            height: scaled.height
                          })
                        },
                        fail: reject
                      })
                    }
                  },
                  fail: reject
                })
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