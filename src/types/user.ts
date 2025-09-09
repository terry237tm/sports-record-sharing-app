/**
 * 用户相关类型定义
 */

// 用户基础信息
export interface UserInfo {
  openid: string // 用户唯一标识
  nickname: string // 用户昵称
  avatar: string // 用户头像URL
  gender?: number // 性别 0-未知 1-男 2-女
  city?: string // 城市
  province?: string // 省份
  country?: string // 国家
  language?: string // 语言
}

// 微信用户信息（从微信API获取）
export interface WechatUserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  city: string
  province: string
  country: string
  language: string
}

// 用户配置
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto' // 主题设置
  language: 'zh-CN' | 'en-US' // 语言设置
  units: {
    distance: 'km' | 'mile' // 距离单位
    weight: 'kg' | 'lb' // 重量单位
  }
  notifications: {
    enabled: boolean // 是否启用通知
    shareReminder: boolean // 分享提醒
    achievementReminder: boolean // 成就提醒
  }
  privacy: {
    shareLocation: boolean // 是否分享位置
    allowStatistics: boolean // 是否允许统计
  }
}

// 用户统计数据
export interface UserStatistics {
  totalRecords: number // 总运动记录数
  totalDuration: number // 总运动时长（分钟）
  totalDistance: number // 总运动距离（公里）
  totalCalories: number // 总消耗卡路里
  thisWeekRecords: number // 本周记录数
  thisMonthRecords: number // 本月记录数
  longestDuration: number // 最长运动时长
  longestDistance: number // 最长运动距离
  favoriteSportType: string // 最喜欢的运动类型
}

// 用户成就
export interface UserAchievement {
  id: string // 成就ID
  title: string // 成就标题
  description: string // 成就描述
  icon: string // 成就图标
  progress: number // 当前进度
  target: number // 目标值
  isCompleted: boolean // 是否已完成
  completedAt?: string // 完成时间
  reward?: {
    type: 'points' | 'badge' | 'title' // 奖励类型
    value: string | number // 奖励值
  }
}

// 用户等级
export interface UserLevel {
  currentLevel: number // 当前等级
  currentExp: number // 当前经验值
  nextLevelExp: number // 下一级所需经验值
  totalExp: number // 总经验值
  levelName: string // 等级名称
  levelIcon: string // 等级图标
}

// 用户会话
export interface UserSession {
  openid: string
  sessionKey: string
  unionid?: string
  expiresIn: number
  createTime: number
  lastActiveTime: number
}

// 用户登录响应
export interface LoginResponse {
  success: boolean
  userInfo: UserInfo
  session: UserSession
  token: string // JWT token
  expiresAt: string // token过期时间
  isNewUser: boolean // 是否新用户
}

// 用户更新参数
export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  settings?: Partial<UserSettings>
}

// 用户查询参数
export interface UserQueryParams {
  openid?: string
  keyword?: string // 搜索关键词
  page?: number
  pageSize?: number
}

// 默认用户设置
export const DefaultUserSettings: UserSettings = {
  theme: 'auto',
  language: 'zh-CN',
  units: {
    distance: 'km',
    weight: 'kg'
  },
  notifications: {
    enabled: true,
    shareReminder: true,
    achievementReminder: true
  },
  privacy: {
    shareLocation: true,
    allowStatistics: true
  }
} as const

// 用户权限
export enum UserPermission {
  CREATE_RECORD = 'create_record', // 创建记录
  UPDATE_RECORD = 'update_record', // 更新记录
  DELETE_RECORD = 'delete_record', // 删除记录
  SHARE_RECORD = 'share_record', // 分享记录
  VIEW_STATISTICS = 'view_statistics', // 查看统计
  MANAGE_SETTINGS = 'manage_settings' // 管理设置
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'active', // 活跃
  INACTIVE = 'inactive', // 非活跃
  SUSPENDED = 'suspended', // 暂停
  DELETED = 'deleted' // 已删除
}

// 用户设备信息
export interface UserDevice {
  platform: 'weapp' | 'h5' | 'rn' // 平台
  system: string // 系统信息
  version: string // 版本信息
  model?: string // 设备型号
  screenWidth: number // 屏幕宽度
  screenHeight: number // 屏幕高度
  pixelRatio: number // 像素比
}

// 用户行为日志
export interface UserBehaviorLog {
  id: string
  openid: string
  action: string // 行为类型
  target?: string // 目标对象
  data?: any // 相关数据
  timestamp: string // 时间戳
  device?: UserDevice // 设备信息
  duration?: number // 行为持续时间（毫秒）
}

// 用户反馈
export interface UserFeedback {
  id: string
  openid: string
  type: 'bug' | 'feature' | 'suggestion' | 'complaint' // 反馈类型
  content: string // 反馈内容
  images?: string[] // 相关图片
  contact?: string // 联系方式
  status: 'pending' | 'processed' | 'resolved' // 处理状态
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

// 用户收藏
export interface UserFavorite {
  id: string
  openid: string
  type: 'record' | 'template' | 'achievement' // 收藏类型
  targetId: string // 目标ID
  createdAt: string // 收藏时间
}

// 用户消息
export interface UserMessage {
  id: string
  openid: string
  title: string // 消息标题
  content: string // 消息内容
  type: 'system' | 'achievement' | 'share' | 'reminder' // 消息类型
  isRead: boolean // 是否已读
  data?: any // 附加数据
  createdAt: string // 创建时间
  expiresAt?: string // 过期时间
}