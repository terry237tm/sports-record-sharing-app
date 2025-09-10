/**
 * 分享功能相关类型定义
 * 包含分享图片生成、Canvas绘制、平台配置等相关接口和枚举
 */

/**
 * 分享图片配置
 * 分享图片的基本尺寸和样式配置
 */
export interface ShareImageConfig {
  width: number // 图片宽度
  height: number // 图片高度
  backgroundColor: string // 背景颜色
  padding: number // 内边距
  borderRadius: number // 圆角
}

/**
 * 分享图片数据
 * 用于生成分享图片的数据结构
 */
export interface ShareImageData {
  userInfo: {
    avatar: string // 用户头像URL
    nickname: string // 用户昵称
  }
  sportRecord: {
    sportType: string // 运动类型
    sportTypeIcon: string // 运动类型图标
    data: {
      duration: number // 运动时长
      distance?: number // 运动距离
      calories: number // 消耗卡路里
    }
    description: string // 运动描述
    location?: string // 位置信息
    createdAt: string // 创建时间
  }
  images: string[] // 要展示的图片URLs
}

/**
 * Canvas绘制配置
 * Canvas绘制时的字体、颜色、间距等配置选项
 */
export interface CanvasDrawConfig {
  fontSize: {
    title: number // 标题字体大小
    subtitle: number // 副标题字体大小
    content: number // 正文字体大小
    small: number // 小字体大小
  }
  colors: {
    primary: string // 主色调
    secondary: string // 辅助色
    text: string // 文字颜色
    textSecondary: string // 次要文字颜色
    background: string // 背景色
    border: string // 边框色
  }
  spacing: {
    small: number // 小间距
    medium: number // 中等间距
    large: number // 大间距
  }
}

/**
 * 分享图片样式配置
 * 默认的分享图片样式配置常量
 */
export const ShareImageStyles: CanvasDrawConfig = {
  fontSize: {
    title: 32,
    subtitle: 24,
    content: 20,
    small: 16
  },
  colors: {
    primary: '#FF6B35', // 活力橙色
    secondary: '#4ECDC4', // 青绿色
    text: '#333333', // 主文字色
    textSecondary: '#666666', // 次要文字色
    background: '#FFFFFF', // 白色背景
    border: '#E5E5E5' // 边框色
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  }
}

/**
 * 分享平台枚举
 * 支持的分享目标平台
 */
export enum SharePlatform {
  WECHAT = 'wechat', // 微信好友
  MOMENTS = 'moments', // 微信朋友圈
  SAVE = 'save' // 保存到相册
}

/**
 * 分享平台配置
 * 各分享平台的显示配置信息
 */
export const SharePlatformConfig = {
  [SharePlatform.WECHAT]: {
    name: '微信好友',
    icon: '💬',
    description: '分享给微信好友'
  },
  [SharePlatform.MOMENTS]: {
    name: '朋友圈',
    icon: '📱',
    description: '分享到微信朋友圈'
  },
  [SharePlatform.SAVE]: {
    name: '保存图片',
    icon: '💾',
    description: '保存图片到相册'
  }
} as const

/**
 * 分享结果
 * 分享操作的结果反馈
 */
export interface ShareResult {
  success: boolean
  platform: SharePlatform
  error?: string
  imagePath?: string // 生成的图片路径（保存时）
}

/**
 * Canvas绘制结果
 * Canvas绘制操作的执行结果
 */
export interface CanvasDrawResult {
  success: boolean
  canvas?: HTMLCanvasElement
  dataURL?: string
  error?: string
}

/**
 * 图片处理配置
 * 图片处理时的压缩和质量配置
 */
export interface ImageProcessConfig {
  maxWidth: number // 最大宽度
  maxHeight: number // 最大高度
  quality: number // 图片质量 0-1
  format: 'image/jpeg' | 'image/png' // 输出格式
}

/**
 * 默认图片处理配置
 * 默认的图片处理配置常量
 */
export const DefaultImageProcessConfig: ImageProcessConfig = {
  maxWidth: 750,
  maxHeight: 1334,
  quality: 0.8,
  format: 'image/jpeg'
}

/**
 * 分享图片尺寸配置
 * 分享图片的标准尺寸配置
 */
export const ShareImageDimensions = {
  width: 750,
  height: 1334,
  ratio: 2 // 2倍清晰度导出
} as const

/**
 * 分享模板类型
 * 支持的分享图片模板类型
 */
export enum ShareTemplateType {
  STANDARD = 'standard', // 标准模板
  MINIMAL = 'minimal', // 简约模板
  CARD = 'card', // 卡片模板
  POSTER = 'poster' // 海报模板
}

/**
 * 分享模板配置
 * 分享模板的配置信息
 */
export interface ShareTemplateConfig {
  type: ShareTemplateType
  name: string
  description: string
  preview: string // 预览图URL
  layout: 'vertical' | 'horizontal' | 'card' // 布局方式
}

/**
 * 可用分享模板
 * 系统预设的可用分享模板列表
 */
export const AvailableShareTemplates: ShareTemplateConfig[] = [
  {
    type: ShareTemplateType.STANDARD,
    name: '标准模板',
    description: '经典布局，信息完整展示',
    preview: '/assets/templates/standard.png',
    layout: 'vertical'
  },
  {
    type: ShareTemplateType.MINIMAL,
    name: '简约模板',
    description: '简洁设计，突出核心数据',
    preview: '/assets/templates/minimal.png',
    layout: 'vertical'
  },
  {
    type: ShareTemplateType.CARD,
    name: '卡片模板',
    description: '卡片式设计，现代感强',
    preview: '/assets/templates/card.png',
    layout: 'card'
  }
]

/**
 * 分享统计
 * 分享功能的使用统计数据
 */
export interface ShareStatistics {
  totalShares: number // 总分享次数
  platformShares: Record<SharePlatform, number> // 各平台分享次数
  dailyShares: number // 今日分享次数
  weeklyShares: number // 本周分享次数
}

/**
 * 分享API响应
 * 生成分享图片后的API响应数据
 */
export interface ShareImageGenerateResponse {
  imageUrl: string // 生成的图片URL
  shareId: string // 分享记录ID
  expireTime?: string // 过期时间（如果有）
}