/**
 * 用户状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserInfo, UserSettings, UserStatistics, UserLevel, UserAchievement, UserPermission, UserStatus } from '@/types'
import { 
  loginUser, 
  fetchUserInfo, 
  updateUserInfo as updateUserInfoThunk, 
  fetchUserSettings, 
  updateUserSettings as updateUserSettingsThunk,
  fetchUserStatistics,
  fetchUserLevel,
  fetchUserAchievements,
  syncWechatUserInfo,
  logoutUser,
  checkSessionValidity,
  refreshUserToken
} from '../userThunks'

// 用户状态接口
interface UserState {
  // 用户信息
  userInfo: UserInfo | null
  userInfoLoading: boolean
  userInfoError: string | null
  
  // 用户设置
  settings: UserSettings
  settingsLoading: boolean
  settingsError: string | null
  
  // 用户统计
  statistics: UserStatistics | null
  statisticsLoading: boolean
  statisticsError: string | null
  
  // 用户等级
  level: UserLevel | null
  levelLoading: boolean
  levelError: string | null
  
  // 用户成就
  achievements: UserAchievement[]
  achievementsLoading: boolean
  achievementsError: string | null
  
  // 登录状态
  isLoggedIn: boolean
  loginLoading: boolean
  loginError: string | null
  
  // 权限
  permissions: UserPermission[]
  
  // 用户状态
  status: UserStatus
  
  // 会话信息
  sessionToken: string | null
  sessionExpiresAt: string | null
  
  // 设备信息
  deviceInfo: {
    platform: string
    system: string
    version: string
  } | null
}

// 初始设置
const initialSettings: UserSettings = {
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
}

// 初始状态
const initialState: UserState = {
  userInfo: null,
  userInfoLoading: false,
  userInfoError: null,
  
  settings: initialSettings,
  settingsLoading: false,
  settingsError: null,
  
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
  
  level: null,
  levelLoading: false,
  levelError: null,
  
  achievements: [],
  achievementsLoading: false,
  achievementsError: null,
  
  isLoggedIn: false,
  loginLoading: false,
  loginError: null,
  
  permissions: [],
  status: UserStatus.INACTIVE,
  
  sessionToken: null,
  sessionExpiresAt: null,
  
  deviceInfo: null
}

// 创建 slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 设置用户信息
    setUserInfo: (state, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload
      state.isLoggedIn = !!action.payload
      state.status = action.payload ? UserStatus.ACTIVE : UserStatus.INACTIVE
    },
    
    // 设置用户信息加载状态
    setUserInfoLoading: (state, action: PayloadAction<boolean>) => {
      state.userInfoLoading = action.payload
    },
    
    // 设置用户信息错误
    setUserInfoError: (state, action: PayloadAction<string | null>) => {
      state.userInfoError = action.payload
    },
    
    // 更新用户信息
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload }
      }
    },
    
    // 设置用户设置
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload
    },
    
    // 更新用户设置
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    
    // 设置设置加载状态
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.settingsLoading = action.payload
    },
    
    // 设置设置错误
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.settingsError = action.payload
    },
    
    // 设置用户统计
    setStatistics: (state, action: PayloadAction<UserStatistics | null>) => {
      state.statistics = action.payload
    },
    
    // 更新用户统计
    updateStatistics: (state, action: PayloadAction<Partial<UserStatistics>>) => {
      if (state.statistics) {
        state.statistics = { ...state.statistics, ...action.payload }
      }
    },
    
    // 设置统计加载状态
    setStatisticsLoading: (state, action: PayloadAction<boolean>) => {
      state.statisticsLoading = action.payload
    },
    
    // 设置统计错误
    setStatisticsError: (state, action: PayloadAction<string | null>) => {
      state.statisticsError = action.payload
    },
    
    // 设置用户等级
    setLevel: (state, action: PayloadAction<UserLevel | null>) => {
      state.level = action.payload
    },
    
    // 设置等级加载状态
    setLevelLoading: (state, action: PayloadAction<boolean>) => {
      state.levelLoading = action.payload
    },
    
    // 设置等级错误
    setLevelError: (state, action: PayloadAction<string | null>) => {
      state.levelError = action.payload
    },
    
    // 设置用户成就
    setAchievements: (state, action: PayloadAction<UserAchievement[]>) => {
      state.achievements = action.payload
    },
    
    // 更新单个成就
    updateAchievement: (state, action: PayloadAction<{ id: string; achievement: Partial<UserAchievement> }>) => {
      const index = state.achievements.findIndex(a => a.id === action.payload.id)
      if (index !== -1) {
        state.achievements[index] = { ...state.achievements[index], ...action.payload.achievement }
      }
    },
    
    // 设置成就加载状态
    setAchievementsLoading: (state, action: PayloadAction<boolean>) => {
      state.achievementsLoading = action.payload
    },
    
    // 设置成就错误
    setAchievementsError: (state, action: PayloadAction<string | null>) => {
      state.achievementsError = action.payload
    },
    
    // 设置登录加载状态
    setLoginLoading: (state, action: PayloadAction<boolean>) => {
      state.loginLoading = action.payload
    },
    
    // 设置登录错误
    setLoginError: (state, action: PayloadAction<string | null>) => {
      state.loginError = action.payload
    },
    
    // 设置权限
    setPermissions: (state, action: PayloadAction<UserPermission[]>) => {
      state.permissions = action.payload
    },
    
    // 设置用户状态
    setStatus: (state, action: PayloadAction<UserStatus>) => {
      state.status = action.payload
    },
    
    // 设置会话信息
    setSession: (state, action: PayloadAction<{ token: string; expiresAt: string }>) => {
      state.sessionToken = action.payload.token
      state.sessionExpiresAt = action.payload.expiresAt
    },
    
    // 清除会话信息
    clearSession: (state) => {
      state.sessionToken = null
      state.sessionExpiresAt = null
    },
    
    // 设置设备信息
    setDeviceInfo: (state, action: PayloadAction<UserState['deviceInfo']>) => {
      state.deviceInfo = action.payload
    },
    
    // 登出
    logout: (state) => {
      state.userInfo = null
      state.isLoggedIn = false
      state.status = UserStatus.INACTIVE
      state.permissions = []
      state.sessionToken = null
      state.sessionExpiresAt = null
    },
    
    // 重置所有状态
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // 用户登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true
        state.loginError = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false
        state.userInfo = action.payload.userInfo
        state.isLoggedIn = true
        state.status = UserStatus.ACTIVE
        state.sessionToken = action.payload.token
        state.sessionExpiresAt = action.payload.expiresAt
        state.permissions = [UserPermission.CREATE_RECORD, UserPermission.UPDATE_RECORD, UserPermission.DELETE_RECORD, UserPermission.SHARE_RECORD, UserPermission.VIEW_STATISTICS, UserPermission.MANAGE_SETTINGS]
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload as string
        state.isLoggedIn = false
        state.userInfo = null
        state.status = UserStatus.INACTIVE
      })

    // 获取用户信息
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.userInfoLoading = true
        state.userInfoError = null
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userInfoLoading = false
        state.userInfo = action.payload
        state.isLoggedIn = true
        state.status = UserStatus.ACTIVE
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.userInfoLoading = false
        state.userInfoError = action.payload as string
      })

    // 更新用户信息
    builder
      .addCase(updateUserInfoThunk.pending, (state) => {
        state.userInfoLoading = true
        state.userInfoError = null
      })
      .addCase(updateUserInfoThunk.fulfilled, (state, action) => {
        state.userInfoLoading = false
        state.userInfo = action.payload
      })
      .addCase(updateUserInfoThunk.rejected, (state, action) => {
        state.userInfoLoading = false
        state.userInfoError = action.payload as string
      })

    // 获取用户设置
    builder
      .addCase(fetchUserSettings.pending, (state) => {
        state.settingsLoading = true
        state.settingsError = null
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.settingsLoading = false
        state.settings = action.payload
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.settingsLoading = false
        state.settingsError = action.payload as string
      })

    // 更新用户设置
    builder
      .addCase(updateUserSettingsThunk.pending, (state) => {
        state.settingsLoading = true
        state.settingsError = null
      })
      .addCase(updateUserSettingsThunk.fulfilled, (state, action) => {
        state.settingsLoading = false
        state.settings = action.payload
      })
      .addCase(updateUserSettingsThunk.rejected, (state, action) => {
        state.settingsLoading = false
        state.settingsError = action.payload as string
      })

    // 获取用户统计
    builder
      .addCase(fetchUserStatistics.pending, (state) => {
        state.statisticsLoading = true
        state.statisticsError = null
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false
        state.statistics = action.payload
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.statisticsLoading = false
        state.statisticsError = action.payload as string
      })

    // 获取用户等级
    builder
      .addCase(fetchUserLevel.pending, (state) => {
        state.levelLoading = true
        state.levelError = null
      })
      .addCase(fetchUserLevel.fulfilled, (state, action) => {
        state.levelLoading = false
        state.level = action.payload
      })
      .addCase(fetchUserLevel.rejected, (state, action) => {
        state.levelLoading = false
        state.levelError = action.payload as string
      })

    // 获取用户成就
    builder
      .addCase(fetchUserAchievements.pending, (state) => {
        state.achievementsLoading = true
        state.achievementsError = null
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.achievementsLoading = false
        state.achievements = action.payload
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.achievementsLoading = false
        state.achievementsError = action.payload as string
      })

    // 同步微信用户信息
    builder
      .addCase(syncWechatUserInfo.pending, (state) => {
        state.userInfoLoading = true
        state.userInfoError = null
      })
      .addCase(syncWechatUserInfo.fulfilled, (state, action) => {
        state.userInfoLoading = false
        state.userInfo = action.payload
      })
      .addCase(syncWechatUserInfo.rejected, (state, action) => {
        state.userInfoLoading = false
        state.userInfoError = action.payload as string
      })

    // 用户登出
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loginLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loginLoading = false
        state.userInfo = null
        state.isLoggedIn = false
        state.status = UserStatus.INACTIVE
        state.permissions = []
        state.sessionToken = null
        state.sessionExpiresAt = null
        state.statistics = null
        state.level = null
        state.achievements = []
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload as string
      })

    // 检查会话有效性
    builder
      .addCase(checkSessionValidity.pending, () => {
        // 可以添加会话检查加载状态
      })
      .addCase(checkSessionValidity.fulfilled, (state, action) => {
        if (!action.payload.valid) {
          // 会话无效，清除登录状态
          state.isLoggedIn = false
          state.userInfo = null
          state.status = UserStatus.INACTIVE
          state.sessionToken = null
          state.sessionExpiresAt = null
        }
      })
      .addCase(checkSessionValidity.rejected, (state, action) => {
        // 检查失败，可以记录错误但不改变登录状态
        console.error('会话检查失败:', action.payload)
      })

    // 刷新用户Token
    builder
      .addCase(refreshUserToken.pending, () => {
        // 可以添加token刷新加载状态
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.sessionToken = action.payload.token
        state.sessionExpiresAt = action.payload.expiresAt
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        console.error('Token刷新失败:', action.payload)
        // Token刷新失败，可能需要重新登录
        state.isLoggedIn = false
        state.sessionToken = null
        state.sessionExpiresAt = null
      })
  }
})

// 导出 actions
export const {
  setUserInfo,
  setUserInfoLoading,
  setUserInfoError,
  updateUserInfo,
  setSettings,
  updateSettings,
  setSettingsLoading,
  setSettingsError,
  setStatistics,
  updateStatistics,
  setStatisticsLoading,
  setStatisticsError,
  setLevel,
  setLevelLoading,
  setLevelError,
  setAchievements,
  updateAchievement,
  setAchievementsLoading,
  setAchievementsError,
  setLoginLoading,
  setLoginError,
  setPermissions,
  setStatus,
  setSession,
  clearSession,
  setDeviceInfo,
  logout,
  resetState
} = userSlice.actions

// 导出 reducer
export default userSlice.reducer

// 导出 selectors
export const selectUserInfo = (state: { user: UserState }) => state.user.userInfo
export const selectIsLoggedIn = (state: { user: UserState }) => state.user.isLoggedIn
export const selectUserSettings = (state: { user: UserState }) => state.user.settings
export const selectUserStatistics = (state: { user: UserState }) => state.user.statistics
export const selectUserLevel = (state: { user: UserState }) => state.user.level
export const selectUserAchievements = (state: { user: UserState }) => state.user.achievements
export const selectLoginLoading = (state: { user: UserState }) => state.user.loginLoading
export const selectUserPermissions = (state: { user: UserState }) => state.user.permissions
export const selectSessionToken = (state: { user: UserState }) => state.user.sessionToken
export const selectUserStatus = (state: { user: UserState }) => state.user.status
export const selectDeviceInfo = (state: { user: UserState }) => state.user.deviceInfo
export const selectUserLoading = (state: { user: UserState }) => state.user.userInfoLoading
export const selectUserError = (state: { user: UserState }) => state.user.userInfoError
export const selectSettingsLoading = (state: { user: UserState }) => state.user.settingsLoading
export const selectStatisticsLoading = (state: { user: UserState }) => state.user.statisticsLoading
export const selectAchievementsLoading = (state: { user: UserState }) => state.user.achievementsLoading
export const selectLevelLoading = (state: { user: UserState }) => state.user.levelLoading
export const selectUserErrors = (state: { user: UserState }) => ({
  userInfo: state.user.userInfoError,
  settings: state.user.settingsError,
  statistics: state.user.statisticsError,
  achievements: state.user.achievementsError,
  level: state.user.levelError,
  login: state.user.loginError
}) as const

// 计算用户经验值
export const calculateExpGained = (record: any): number => {
  let exp = 0
  
  // 基础经验：时长 * 1
  exp += record.duration || 0
  
  // 距离经验：每公里 * 10
  if (record.distance) {
    exp += record.distance * 10
  }
  
  // 卡路里经验：每10卡路里 * 1
  if (record.calories) {
    exp += Math.floor(record.calories / 10)
  }
  
  // 图片奖励
  if (record.images && record.images.length > 0) {
    exp += record.images.length * 5
  }
  
  // 描述奖励
  if (record.description && record.description.length > 10) {
    exp += 10
  }
  
  return Math.floor(exp)
}

// 根据经验值计算等级
export const calculateLevelFromExp = (totalExp: number): UserLevel => {
  const levelThresholds = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
    5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000
  ]
  
  let currentLevel = 1
  let currentExp = 0
  let nextLevelExp = levelThresholds[1]
  
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (totalExp >= levelThresholds[i] && totalExp < levelThresholds[i + 1]) {
      currentLevel = i + 1
      currentExp = totalExp - levelThresholds[i]
      nextLevelExp = levelThresholds[i + 1] - levelThresholds[i]
      break
    }
  }
  
  // 如果超过最高等级
  if (totalExp >= levelThresholds[levelThresholds.length - 1]) {
    currentLevel = levelThresholds.length
    currentExp = totalExp - levelThresholds[levelThresholds.length - 1]
    nextLevelExp = 2000 // 每级增加2000经验
  }
  
  const levelNames = [
    '新手', '初级', '入门', '进阶', '熟练', '专业', '专家', '大师', '宗师', '传奇',
    '史诗', '神话', '传说', '不朽', '永恒', '至尊', '无敌', '超凡', '入圣', '封神'
  ]
  
  return {
    currentLevel,
    currentExp,
    nextLevelExp,
    totalExp,
    levelName: levelNames[Math.min(currentLevel - 1, levelNames.length - 1)],
    levelIcon: `🏆${currentLevel}`
  }
}

// 检查用户权限
export const hasPermission = (permissions: UserPermission[], permission: UserPermission): boolean => {
  return permissions.includes(permission)
}

// 检查用户是否登录且会话有效
export const isSessionValid = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false
  return new Date(expiresAt) > new Date()
}

// 获取用户显示名称
export const getDisplayName = (userInfo: UserInfo | null): string => {
  if (!userInfo) return '游客'
  return userInfo.nickname || '用户'
}

// 获取用户头像
export const getAvatarUrl = (userInfo: UserInfo | null): string => {
  if (!userInfo || !userInfo.avatar) {
    return '/assets/images/default-avatar.png'
  }
  return userInfo.avatar
}

// 检查是否为新用户
export const isNewUser = (userInfo: UserInfo | null): boolean => {
  if (!userInfo) return false
  // 这里可以根据业务逻辑判断新用户
  // 例如：没有昵称或头像，或者注册时间在24小时内
  return !userInfo.nickname || !userInfo.avatar
}

// 导出常用的用户相关工具函数
export const userUtils = {
  calculateExpGained,
  calculateLevelFromExp,
  hasPermission,
  isSessionValid,
  getDisplayName,
  getAvatarUrl,
  isNewUser
} as const

export type UserUtils = typeof userUtils

// 重新导出所有用户相关类型
export type {
  UserInfo as TUserInfo,
  UserSettings as TUserSettings,
  UserStatistics as TUserStatistics,
  UserLevel as TUserLevel,
  UserAchievement as TUserAchievement,
  UserPermission as TUserPermission,
  UserStatus as TUserStatus,
  UserDevice as TUserDevice,
  UserBehaviorLog as TUserBehaviorLog,
  UserFeedback as TUserFeedback,
  UserFavorite as TUserFavorite,
  UserMessage as TUserMessage
} from '@/types/user'