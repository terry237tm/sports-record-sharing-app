import { BaseModel } from './BaseModel'

/**
 * 用户性别枚举
 */
export enum UserGender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  COACH = 'coach'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  DELETED = 'deleted'
}

/**
 * 用户数据模型
 * 对应数据库中的用户集合
 */
export interface User extends BaseModel {
  // 基本信息
  openId: string // 微信小程序OpenID
  unionId?: string // 微信UnionID（可选）
  nickName: string // 昵称
  avatarUrl?: string // 头像URL
  gender?: UserGender // 性别
  birthday?: Date // 生日
  height?: number // 身高（cm）
  weight?: number // 体重（kg）

  // 联系信息
  phone?: string // 手机号
  email?: string // 邮箱

  // 角色和权限
  role: UserRole // 用户角色
  status: UserStatus // 用户状态

  // 运动偏好
  favoriteSports?: string[] // 喜爱的运动类型
  fitnessGoals?: string[] // 健身目标
  weeklyGoal?: number // 每周目标运动次数

  // 统计数据
  totalWorkouts: number // 总运动次数
  totalDuration: number // 总运动时长（分钟）
  totalCalories: number // 总消耗卡路里
  totalDistance: number // 总运动距离（公里）
  currentStreak: number // 当前连续运动天数
  longestStreak: number // 最长连续运动天数

  // 社交数据
  followersCount: number // 粉丝数
  followingCount: number // 关注数
  postsCount: number // 动态数

  // 隐私设置
  privacyLevel: 'public' | 'friends' | 'private' // 隐私级别
  allowRecommend: boolean // 是否允许推荐
  allowNotification: boolean // 是否允许通知

  // 认证信息
  lastLoginAt?: Date // 最后登录时间
  loginCount: number // 登录次数
  isVerified: boolean // 是否已验证

  // 会员信息
  membershipLevel: 'free' | 'premium' | 'vip' // 会员等级
  membershipExpiry?: Date // 会员到期时间
}

/**
 * 用户创建数据（用于注册）
 */
export interface CreateUserData {
  openId: string
  unionId?: string
  nickName: string
  avatarUrl?: string
  gender?: UserGender
  birthday?: Date
  height?: number
  weight?: number
  phone?: string
  email?: string
}

/**
 * 用户更新数据
 */
export interface UpdateUserData {
  nickName?: string
  avatarUrl?: string
  gender?: UserGender
  birthday?: Date
  height?: number
  weight?: number
  phone?: string
  email?: string
  favoriteSports?: string[]
  fitnessGoals?: string[]
  weeklyGoal?: number
  privacyLevel?: 'public' | 'friends' | 'private'
  allowRecommend?: boolean
  allowNotification?: boolean
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  totalDistance: number
  currentStreak: number
  longestStreak: number
  followersCount: number
  followingCount: number
  postsCount: number
}

/**
 * 用户隐私设置
 */
export interface UserPrivacy {
  privacyLevel: 'public' | 'friends' | 'private'
  allowRecommend: boolean
  allowNotification: boolean
}