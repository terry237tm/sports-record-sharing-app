// 基础模型
export * from './BaseModel'

// 用户模型
export * from './User'

// 运动记录模型
export * from './SportRecord'

// 模型索引
export const ModelNames = {
  USER: 'users',
  SPORT_RECORD: 'records',
  COMMENT: 'comments',
  LIKE: 'likes',
  MEDIA: 'media'
} as const

export type ModelName = typeof ModelNames[keyof typeof ModelNames]