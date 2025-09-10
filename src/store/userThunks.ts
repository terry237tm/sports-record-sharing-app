/**
 * 用户相关异步操作
 * 使用 createAsyncThunk 创建异步操作，处理用户登录、注册、信息更新等
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { 
  UserInfo, 
  UserSettings, 
  UserStatistics, 
  UserLevel, 
  UserAchievement, 
  LoginResponse,
  UpdateUserParams,
  UserQueryParams,
  WechatUserInfo
} from '@/types'
import { cloudbaseService } from '@/services/cloudbase'
import { ApiResponse, PaginatedApiResponse } from '@/types'

/**
 * 用户登录
 * 使用微信code进行登录，获取用户信息
 */
export const loginUser = createAsyncThunk(
  'user/login',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('loginUser', { code })
      
      if (response.success && response.data) {
        return response.data as LoginResponse
      } else {
        return rejectWithValue(response.message || '登录失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '登录失败')
    }
  }
)

/**
 * 获取用户信息
 * 获取当前登录用户的详细信息
 */
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUserInfo', {})
      
      if (response.success && response.data) {
        return response.data as UserInfo
      } else {
        return rejectWithValue(response.message || '获取用户信息失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户信息失败')
    }
  }
)

/**
 * 更新用户信息
 * 更新用户的昵称、头像等基本信息
 */
export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async (params: UpdateUserParams, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('updateUserInfo', params)
      
      if (response.success && response.data) {
        return response.data as UserInfo
      } else {
        return rejectWithValue(response.message || '更新用户信息失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新用户信息失败')
    }
  }
)

/**
 * 获取用户设置
 * 获取用户的个性化设置
 */
export const fetchUserSettings = createAsyncThunk(
  'user/fetchUserSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUserSettings', {})
      
      if (response.success && response.data) {
        return response.data as UserSettings
      } else {
        return rejectWithValue(response.message || '获取用户设置失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户设置失败')
    }
  }
)

/**
 * 更新用户设置
 * 更新用户的主题、语言、通知等设置
 */
export const updateUserSettings = createAsyncThunk(
  'user/updateUserSettings',
  async (settings: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('updateUserSettings', { settings })
      
      if (response.success && response.data) {
        return response.data as UserSettings
      } else {
        return rejectWithValue(response.message || '更新用户设置失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新用户设置失败')
    }
  }
)

/**
 * 获取用户统计
 * 获取用户的运动统计数据
 */
export const fetchUserStatistics = createAsyncThunk(
  'user/fetchUserStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUserStatistics', {})
      
      if (response.success && response.data) {
        return response.data as UserStatistics
      } else {
        return rejectWithValue(response.message || '获取用户统计失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户统计失败')
    }
  }
)

/**
 * 获取用户等级
 * 获取用户的等级和经验值信息
 */
export const fetchUserLevel = createAsyncThunk(
  'user/fetchUserLevel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUserLevel', {})
      
      if (response.success && response.data) {
        return response.data as UserLevel
      } else {
        return rejectWithValue(response.message || '获取用户等级失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户等级失败')
    }
  }
)

/**
 * 获取用户成就
 * 获取用户获得的成就列表
 */
export const fetchUserAchievements = createAsyncThunk(
  'user/fetchUserAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUserAchievements', {})
      
      if (response.success && response.data) {
        return response.data as UserAchievement[]
      } else {
        return rejectWithValue(response.message || '获取用户成就失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户成就失败')
    }
  }
)

/**
 * 同步微信用户信息
 * 将微信用户信息同步到服务器
 */
export const syncWechatUserInfo = createAsyncThunk(
  'user/syncWechatUserInfo',
  async (wechatUserInfo: WechatUserInfo, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('syncWechatUserInfo', wechatUserInfo)
      
      if (response.success && response.data) {
        return response.data as UserInfo
      } else {
        return rejectWithValue(response.message || '同步微信用户信息失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '同步微信用户信息失败')
    }
  }
)

/**
 * 用户登出
 * 清除用户会话信息
 */
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('logoutUser', {})
      
      if (response.success) {
        return true
      } else {
        return rejectWithValue(response.message || '登出失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '登出失败')
    }
  }
)

/**
 * 检查用户会话有效性
 * 验证当前用户的会话是否仍然有效
 */
export const checkSessionValidity = createAsyncThunk(
  'user/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('checkSession', {})
      
      if (response.success && response.data) {
        return response.data as { valid: boolean; expiresAt?: string }
      } else {
        return rejectWithValue(response.message || '检查会话失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '检查会话失败')
    }
  }
)

/**
 * 获取用户列表（管理员功能）
 * 获取所有用户的列表，支持分页和搜索
 */
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: UserQueryParams, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('getUsers', params)
      
      if (response.success && response.data) {
        return response.data as PaginatedApiResponse<UserInfo>
      } else {
        return rejectWithValue(response.message || '获取用户列表失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户列表失败')
    }
  }
)

/**
 * 刷新用户Token
 * 刷新用户的访问令牌
 */
export const refreshUserToken = createAsyncThunk(
  'user/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('refreshToken', {})
      
      if (response.success && response.data) {
        return response.data as { token: string; expiresAt: string }
      } else {
        return rejectWithValue(response.message || '刷新Token失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '刷新Token失败')
    }
  }
)

/**
 * 记录用户行为
 * 记录用户的操作行为，用于分析和统计
 */
export const logUserBehavior = createAsyncThunk(
  'user/logBehavior',
  async (params: {
    action: string
    target?: string
    data?: any
    duration?: number
  }, { rejectWithValue }) => {
    try {
      const response = await cloudbaseService.callFunction('logUserBehavior', params)
      
      if (response.success) {
        return true
      } else {
        return rejectWithValue(response.message || '记录用户行为失败')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '记录用户行为失败')
    }
  }
)