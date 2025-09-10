/**
 * 用户相关的自定义Hooks
 * 提供类型安全的用户状态管理和操作封装
 */

import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { 
  loginUser,
  fetchUserInfo,
  updateUserInfo,
  fetchUserSettings,
  updateUserSettings,
  fetchUserStatistics,
  fetchUserLevel,
  fetchUserAchievements,
  syncWechatUserInfo,
  logoutUser,
  checkSessionValidity,
  refreshUserToken
} from './userThunks'
import userSelectors from './userSelectors'
import { UserSettings, UpdateUserParams, UserPermission } from '@/types'

/**
 * 用户认证Hook
 * 提供用户登录、登出、会话管理等功能
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const isLoggedIn = useAppSelector(userSelectors.selectIsLoggedIn)
  const loginLoading = useAppSelector(userSelectors.selectLoginLoading)
  const loginError = useAppSelector(userSelectors.selectLoginError)
  const sessionToken = useAppSelector(userSelectors.selectSessionToken)
  const sessionExpiresAt = useAppSelector(userSelectors.selectSessionExpiresAt)
  const isSessionValid = useAppSelector(userSelectors.selectIsSessionValid)
  
  // 登录
  const login = useCallback(async (code: string) => {
    return await dispatch(loginUser(code)).unwrap()
  }, [dispatch])
  
  // 登出
  const logout = useCallback(async () => {
    return await dispatch(logoutUser()).unwrap()
  }, [dispatch])
  
  // 检查会话有效性
  const checkSession = useCallback(async () => {
    return await dispatch(checkSessionValidity()).unwrap()
  }, [dispatch])
  
  // 刷新Token
  const refreshToken = useCallback(async () => {
    return await dispatch(refreshUserToken()).unwrap()
  }, [dispatch])
  
  return {
    isLoggedIn,
    loginLoading,
    loginError,
    sessionToken,
    sessionExpiresAt,
    isSessionValid,
    login,
    logout,
    checkSession,
    refreshToken
  }
}

/**
 * 用户信息Hook
 * 提供用户信息的获取、更新等功能
 */
export const useUserInfo = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const userInfo = useAppSelector(userSelectors.selectUserInfo)
  const userInfoLoading = useAppSelector(userSelectors.selectUserInfoLoading)
  const userInfoError = useAppSelector(userSelectors.selectUserInfoError)
  const displayName = useAppSelector(userSelectors.selectUserDisplayName)
  const avatarUrl = useAppSelector(userSelectors.selectUserAvatarUrl)
  const isNewUser = useAppSelector(userSelectors.selectIsNewUser)
  
  // 获取用户信息
  const fetchUser = useCallback(async () => {
    return await dispatch(fetchUserInfo()).unwrap()
  }, [dispatch])
  
  // 更新用户信息
  const updateUser = useCallback(async (params: UpdateUserParams) => {
    return await dispatch(updateUserInfo(params)).unwrap()
  }, [dispatch])
  
  // 同步微信用户信息
  const syncWechatInfo = useCallback(async (wechatUserInfo: any) => {
    return await dispatch(syncWechatUserInfo(wechatUserInfo)).unwrap()
  }, [dispatch])
  
  return {
    userInfo,
    userInfoLoading,
    userInfoError,
    displayName,
    avatarUrl,
    isNewUser,
    fetchUser,
    updateUser,
    syncWechatInfo
  }
}

/**
 * 用户设置Hook
 * 提供用户设置的获取、更新等功能
 */
export const useUserSettings = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const settings = useAppSelector(userSelectors.selectUserSettings)
  const theme = useAppSelector(userSelectors.selectUserTheme)
  const language = useAppSelector(userSelectors.selectUserLanguage)
  const units = useAppSelector(userSelectors.selectUserUnits)
  const notifications = useAppSelector(userSelectors.selectUserNotifications)
  const privacy = useAppSelector(userSelectors.selectUserPrivacy)
  const settingsLoading = useAppSelector(userSelectors.selectSettingsLoading)
  const settingsError = useAppSelector(userSelectors.selectSettingsError)
  
  // 主题相关
  const isDarkTheme = useAppSelector(userSelectors.selectIsDarkTheme)
  const isAutoTheme = useAppSelector(userSelectors.selectIsAutoTheme)
  
  // 通知相关
  const areNotificationsEnabled = useAppSelector(userSelectors.selectAreNotificationsEnabled)
  const isShareReminderEnabled = useAppSelector(userSelectors.selectIsShareReminderEnabled)
  const isAchievementReminderEnabled = useAppSelector(userSelectors.selectIsAchievementReminderEnabled)
  
  // 隐私相关
  const isLocationSharingEnabled = useAppSelector(userSelectors.selectIsLocationSharingEnabled)
  const areStatisticsAllowed = useAppSelector(userSelectors.selectAreStatisticsAllowed)
  
  // 获取用户设置
  const fetchSettings = useCallback(async () => {
    return await dispatch(fetchUserSettings()).unwrap()
  }, [dispatch])
  
  // 更新用户设置
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    return await dispatch(updateUserSettings(newSettings)).unwrap()
  }, [dispatch])
  
  return {
    settings,
    theme,
    language,
    units,
    notifications,
    privacy,
    settingsLoading,
    settingsError,
    isDarkTheme,
    isAutoTheme,
    areNotificationsEnabled,
    isShareReminderEnabled,
    isAchievementReminderEnabled,
    isLocationSharingEnabled,
    areStatisticsAllowed,
    fetchSettings,
    updateSettings
  }
}

/**
 * 用户统计Hook
 * 提供用户运动统计数据的获取等功能
 */
export const useUserStatistics = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const statistics = useAppSelector(userSelectors.selectUserStatistics)
  const statisticsLoading = useAppSelector(userSelectors.selectStatisticsLoading)
  const statisticsError = useAppSelector(userSelectors.selectStatisticsError)
  
  // 统计数据
  const totalRecords = useAppSelector(userSelectors.selectTotalRecords)
  const totalDuration = useAppSelector(userSelectors.selectTotalDuration)
  const totalDistance = useAppSelector(userSelectors.selectTotalDistance)
  const totalCalories = useAppSelector(userSelectors.selectTotalCalories)
  const thisWeekRecords = useAppSelector(userSelectors.selectThisWeekRecords)
  const thisMonthRecords = useAppSelector(userSelectors.selectThisMonthRecords)
  const statsSummary = useAppSelector(userSelectors.selectUserStatsSummary)
  
  // 获取用户统计
  const fetchStatistics = useCallback(async () => {
    return await dispatch(fetchUserStatistics()).unwrap()
  }, [dispatch])
  
  return {
    statistics,
    statisticsLoading,
    statisticsError,
    totalRecords,
    totalDuration,
    totalDistance,
    totalCalories,
    thisWeekRecords,
    thisMonthRecords,
    statsSummary,
    fetchStatistics
  }
}

/**
 * 用户等级Hook
 * 提供用户等级和经验值相关功能
 */
export const useUserLevel = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const level = useAppSelector(userSelectors.selectUserLevel)
  const currentLevel = useAppSelector(userSelectors.selectCurrentLevel)
  const currentExp = useAppSelector(userSelectors.selectCurrentExp)
  const totalExp = useAppSelector(userSelectors.selectTotalExp)
  const levelName = useAppSelector(userSelectors.selectLevelName)
  const levelIcon = useAppSelector(userSelectors.selectLevelIcon)
  const levelLoading = useAppSelector(userSelectors.selectLevelLoading)
  const levelError = useAppSelector(userSelectors.selectLevelError)
  const levelProgress = useAppSelector(userSelectors.selectLevelProgress)
  
  // 获取用户等级
  const fetchLevel = useCallback(async () => {
    return await dispatch(fetchUserLevel()).unwrap()
  }, [dispatch])
  
  return {
    level,
    currentLevel,
    currentExp,
    totalExp,
    levelName,
    levelIcon,
    levelLoading,
    levelError,
    levelProgress,
    fetchLevel
  }
}

/**
 * 用户成就Hook
 * 提供用户成就相关功能
 */
export const useUserAchievements = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const achievements = useAppSelector(userSelectors.selectUserAchievements)
  const completedAchievements = useAppSelector(userSelectors.selectCompletedAchievements)
  const achievementCount = useAppSelector(userSelectors.selectAchievementCount)
  const completedAchievementCount = useAppSelector(userSelectors.selectCompletedAchievementCount)
  const achievementsLoading = useAppSelector(userSelectors.selectAchievementsLoading)
  const achievementsError = useAppSelector(userSelectors.selectAchievementsError)
  const achievementStats = useAppSelector(userSelectors.selectAchievementStats)
  
  // 获取用户成就
  const fetchAchievements = useCallback(async () => {
    return await dispatch(fetchUserAchievements()).unwrap()
  }, [dispatch])
  
  return {
    achievements,
    completedAchievements,
    achievementCount,
    completedAchievementCount,
    achievementsLoading,
    achievementsError,
    achievementStats,
    fetchAchievements
  }
}

/**
 * 用户权限Hook
 * 提供用户权限检查功能
 */
export const useUserPermissions = () => {
  const permissions = useAppSelector(userSelectors.selectUserPermissions)
  
  // 检查特定权限
  const hasPermission = useCallback((permission: UserPermission) => {
    return permissions.includes(permission)
  }, [permissions])
  
  // 检查多个权限
  const hasPermissions = useCallback((requiredPermissions: UserPermission[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission))
  }, [permissions])
  
  // 检查任意权限
  const hasAnyPermission = useCallback((requiredPermissions: UserPermission[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission))
  }, [permissions])
  
  return {
    permissions,
    hasPermission,
    hasPermissions,
    hasAnyPermission
  }
}

/**
 * 用户设备信息Hook
 * 提供用户设备相关信息
 */
export const useUserDevice = () => {
  const deviceInfo = useAppSelector(userSelectors.selectDeviceInfo)
  
  return {
    deviceInfo,
    platform: deviceInfo?.platform,
    system: deviceInfo?.system,
    version: deviceInfo?.version
  }
}

/**
 * 用户完整资料Hook
 * 提供用户完整资料的获取功能
 */
export const useUserProfile = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const userProfile = useAppSelector(userSelectors.selectUserProfile)
  const isLoggedIn = useAppSelector(userSelectors.selectIsLoggedIn)
  const userStatus = useAppSelector(userSelectors.selectUserStatus)
  const isUserActive = useAppSelector(userSelectors.selectIsUserActive)
  
  // 加载状态
  const isAnyLoading = useAppSelector(userSelectors.selectIsAnyLoading)
  const hasAnyError = useAppSelector(userSelectors.selectHasAnyError)
  const userErrors = useAppSelector(userSelectors.selectUserErrors)
  
  // 获取完整用户资料
  const fetchUserProfile = useCallback(async () => {
    // 并行获取所有用户相关数据
    const promises = [
      dispatch(fetchUserInfo()),
      dispatch(fetchUserSettings()),
      dispatch(fetchUserStatistics()),
      dispatch(fetchUserLevel()),
      dispatch(fetchUserAchievements())
    ]
    
    const results = await Promise.allSettled(promises)
    
    // 检查是否有失败的操作
    const failedResults = results.filter(result => result.status === 'rejected')
    if (failedResults.length > 0) {
      console.warn('部分用户数据获取失败:', failedResults)
    }
    
    return results
  }, [dispatch])
  
  return {
    userProfile,
    isLoggedIn,
    userStatus,
    isUserActive,
    isAnyLoading,
    hasAnyError,
    userErrors,
    fetchUserProfile
  }
}

/**
 * 用户状态Hook
 * 提供用户状态的实时监控
 */
export const useUserState = () => {
  // 选择器
  const isLoggedIn = useAppSelector(userSelectors.selectIsLoggedIn)
  const userStatus = useAppSelector(userSelectors.selectUserStatus)
  const isUserActive = useAppSelector(userSelectors.selectIsUserActive)
  const isUserInactive = useAppSelector(userSelectors.selectIsUserInactive)
  const isUserSuspended = useAppSelector(userSelectors.selectIsUserSuspended)
  const isSessionValid = useAppSelector(userSelectors.selectIsSessionValid)
  
  // 计算状态
  const isReady = useMemo(() => {
    return isLoggedIn && isUserActive && isSessionValid
  }, [isLoggedIn, isUserActive, isSessionValid])
  
  const needsLogin = useMemo(() => {
    return !isLoggedIn || !isSessionValid
  }, [isLoggedIn, isSessionValid])
  
  return {
    isLoggedIn,
    userStatus,
    isUserActive,
    isUserInactive,
    isUserSuspended,
    isSessionValid,
    isReady,
    needsLogin
  }
}

/**
 * 用户主题Hook
 * 提供主题切换和管理功能
 */
export const useUserTheme = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const theme = useAppSelector(userSelectors.selectUserTheme)
  const isDarkTheme = useAppSelector(userSelectors.selectIsDarkTheme)
  const isAutoTheme = useAppSelector(userSelectors.selectIsAutoTheme)
  
  // 切换主题
  const toggleTheme = useCallback(async (newTheme?: 'light' | 'dark') => {
    const targetTheme = newTheme || (isDarkTheme ? 'light' : 'dark')
    await dispatch(updateUserSettings({ theme: targetTheme })).unwrap()
    return targetTheme
  }, [dispatch, isDarkTheme])
  
  // 设置为自动主题
  const setAutoTheme = useCallback(async () => {
    await dispatch(updateUserSettings({ theme: 'auto' })).unwrap()
  }, [dispatch])
  
  return {
    theme,
    isDarkTheme,
    isAutoTheme,
    toggleTheme,
    setAutoTheme
  }
}

/**
 * 用户通知Hook
 * 提供通知设置管理功能
 */
export const useUserNotifications = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const notifications = useAppSelector(userSelectors.selectUserNotifications)
  const areNotificationsEnabled = useAppSelector(userSelectors.selectAreNotificationsEnabled)
  const isShareReminderEnabled = useAppSelector(userSelectors.selectIsShareReminderEnabled)
  const isAchievementReminderEnabled = useAppSelector(userSelectors.selectIsAchievementReminderEnabled)
  
  // 切换通知开关
  const toggleNotifications = useCallback(async (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !areNotificationsEnabled
    await dispatch(updateUserSettings({ 
      notifications: { ...notifications, enabled: newState }
    })).unwrap()
    return newState
  }, [dispatch, notifications, areNotificationsEnabled])
  
  // 切换分享提醒
  const toggleShareReminder = useCallback(async (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !isShareReminderEnabled
    await dispatch(updateUserSettings({ 
      notifications: { ...notifications, shareReminder: newState }
    })).unwrap()
    return newState
  }, [dispatch, notifications, isShareReminderEnabled])
  
  // 切换成就提醒
  const toggleAchievementReminder = useCallback(async (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !isAchievementReminderEnabled
    await dispatch(updateUserSettings({ 
      notifications: { ...notifications, achievementReminder: newState }
    })).unwrap()
    return newState
  }, [dispatch, notifications, isAchievementReminderEnabled])
  
  return {
    notifications,
    areNotificationsEnabled,
    isShareReminderEnabled,
    isAchievementReminderEnabled,
    toggleNotifications,
    toggleShareReminder,
    toggleAchievementReminder
  }
}

/**
 * 用户隐私Hook
 * 提供隐私设置管理功能
 */
export const useUserPrivacy = () => {
  const dispatch = useAppDispatch()
  
  // 选择器
  const privacy = useAppSelector(userSelectors.selectUserPrivacy)
  const isLocationSharingEnabled = useAppSelector(userSelectors.selectIsLocationSharingEnabled)
  const areStatisticsAllowed = useAppSelector(userSelectors.selectAreStatisticsAllowed)
  
  // 切换位置分享
  const toggleLocationSharing = useCallback(async (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !isLocationSharingEnabled
    await dispatch(updateUserSettings({ 
      privacy: { ...privacy, shareLocation: newState }
    })).unwrap()
    return newState
  }, [dispatch, privacy, isLocationSharingEnabled])
  
  // 切换统计权限
  const toggleStatisticsPermission = useCallback(async (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !areStatisticsAllowed
    await dispatch(updateUserSettings({ 
      privacy: { ...privacy, allowStatistics: newState }
    })).unwrap()
    return newState
  }, [dispatch, privacy, areStatisticsAllowed])
  
  return {
    privacy,
    isLocationSharingEnabled,
    areStatisticsAllowed,
    toggleLocationSharing,
    toggleStatisticsPermission
  }
}

// 默认导出所有用户Hooks
export default {
  useAuth,
  useUserInfo,
  useUserSettings,
  useUserStatistics,
  useUserLevel,
  useUserAchievements,
  useUserPermissions,
  useUserDevice,
  useUserProfile,
  useUserState,
  useUserTheme,
  useUserNotifications,
  useUserPrivacy
} as const