/**
 * 用户状态选择器
 * 提供对用户状态的各种选择和计算功能
 */

import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'
import { UserPermission, UserStatus } from '@/types'
import { hasPermission, isSessionValid, getDisplayName, getAvatarUrl, isNewUser } from './slices/userSlice'

// 基础选择器
export const selectUserState = (state: RootState) => state.user

// 用户基本信息选择器
export const selectUserInfo = createSelector(
  [selectUserState],
  (userState) => userState.userInfo
)

export const selectIsLoggedIn = createSelector(
  [selectUserState],
  (userState) => userState.isLoggedIn
)

export const selectUserStatus = createSelector(
  [selectUserState],
  (userState) => userState.status
)

export const selectSessionToken = createSelector(
  [selectUserState],
  (userState) => userState.sessionToken
)

export const selectSessionExpiresAt = createSelector(
  [selectUserState],
  (userState) => userState.sessionExpiresAt
)

// 用户设置选择器
export const selectUserSettings = createSelector(
  [selectUserState],
  (userState) => userState.settings
)

export const selectUserTheme = createSelector(
  [selectUserSettings],
  (settings) => settings.theme
)

export const selectUserLanguage = createSelector(
  [selectUserSettings],
  (settings) => settings.language
)

export const selectUserUnits = createSelector(
  [selectUserSettings],
  (settings) => settings.units
)

export const selectUserNotifications = createSelector(
  [selectUserSettings],
  (settings) => settings.notifications
)

export const selectUserPrivacy = createSelector(
  [selectUserSettings],
  (settings) => settings.privacy
)

// 用户统计选择器
export const selectUserStatistics = createSelector(
  [selectUserState],
  (userState) => userState.statistics
)

export const selectTotalRecords = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.totalRecords || 0
)

export const selectTotalDuration = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.totalDuration || 0
)

export const selectTotalDistance = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.totalDistance || 0
)

export const selectTotalCalories = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.totalCalories || 0
)

export const selectThisWeekRecords = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.thisWeekRecords || 0
)

export const selectThisMonthRecords = createSelector(
  [selectUserStatistics],
  (statistics) => statistics?.thisMonthRecords || 0
)

// 用户等级选择器
export const selectUserLevel = createSelector(
  [selectUserState],
  (userState) => userState.level
)

export const selectCurrentLevel = createSelector(
  [selectUserLevel],
  (level) => level?.currentLevel || 1
)

export const selectCurrentExp = createSelector(
  [selectUserLevel],
  (level) => level?.currentExp || 0
)

export const selectTotalExp = createSelector(
  [selectUserLevel],
  (level) => level?.totalExp || 0
)

export const selectLevelName = createSelector(
  [selectUserLevel],
  (level) => level?.levelName || '新手'
)

export const selectLevelIcon = createSelector(
  [selectUserLevel],
  (level) => level?.levelIcon || '🏆1'
)

// 用户成就选择器
export const selectUserAchievements = createSelector(
  [selectUserState],
  (userState) => userState.achievements
)

export const selectCompletedAchievements = createSelector(
  [selectUserAchievements],
  (achievements) => achievements.filter(achievement => achievement.isCompleted)
)

export const selectAchievementCount = createSelector(
  [selectUserAchievements],
  (achievements) => achievements.length
)

export const selectCompletedAchievementCount = createSelector(
  [selectCompletedAchievements],
  (completedAchievements) => completedAchievements.length
)

// 权限选择器
export const selectUserPermissions = createSelector(
  [selectUserState],
  (userState) => userState.permissions
)

export const selectHasPermission = (permission: UserPermission) =>
  createSelector(
    [selectUserPermissions],
    (permissions) => hasPermission(permissions, permission)
  )

// 设备信息选择器
export const selectDeviceInfo = createSelector(
  [selectUserState],
  (userState) => userState.deviceInfo
)

// 计算和派生选择器
export const selectUserDisplayName = createSelector(
  [selectUserInfo],
  (userInfo) => getDisplayName(userInfo)
)

export const selectUserAvatarUrl = createSelector(
  [selectUserInfo],
  (userInfo) => getAvatarUrl(userInfo)
)

export const selectIsNewUser = createSelector(
  [selectUserInfo],
  (userInfo) => isNewUser(userInfo)
)

export const selectIsSessionValid = createSelector(
  [selectSessionExpiresAt],
  (expiresAt) => isSessionValid(expiresAt)
)

// 加载状态选择器
export const selectUserInfoLoading = createSelector(
  [selectUserState],
  (userState) => userState.userInfoLoading
)

export const selectLoginLoading = createSelector(
  [selectUserState],
  (userState) => userState.loginLoading
)

export const selectSettingsLoading = createSelector(
  [selectUserState],
  (userState) => userState.settingsLoading
)

export const selectStatisticsLoading = createSelector(
  [selectUserState],
  (userState) => userState.statisticsLoading
)

export const selectLevelLoading = createSelector(
  [selectUserState],
  (userState) => userState.levelLoading
)

export const selectAchievementsLoading = createSelector(
  [selectUserState],
  (userState) => userState.achievementsLoading
)

// 错误状态选择器
export const selectUserInfoError = createSelector(
  [selectUserState],
  (userState) => userState.userInfoError
)

export const selectLoginError = createSelector(
  [selectUserState],
  (userState) => userState.loginError
)

export const selectSettingsError = createSelector(
  [selectUserState],
  (userState) => userState.settingsError
)

export const selectStatisticsError = createSelector(
  [selectUserState],
  (userState) => userState.statisticsError
)

export const selectLevelError = createSelector(
  [selectUserState],
  (userState) => userState.levelError
)

export const selectAchievementsError = createSelector(
  [selectUserState],
  (userState) => userState.achievementsError
)

// 综合错误状态选择器
export const selectUserErrors = createSelector(
  [selectUserState],
  (userState) => ({
    userInfo: userState.userInfoError,
    settings: userState.settingsError,
    statistics: userState.statisticsError,
    achievements: userState.achievementsError,
    level: userState.levelError,
    login: userState.loginError
  })
)

export const selectHasAnyError = createSelector(
  [selectUserErrors],
  (errors) => Object.values(errors).some(error => error !== null)
)

// 综合加载状态选择器
export const selectUserLoadingStates = createSelector(
  [selectUserState],
  (userState) => ({
    userInfo: userState.userInfoLoading,
    settings: userState.settingsLoading,
    statistics: userState.statisticsLoading,
    achievements: userState.achievementsLoading,
    level: userState.levelLoading,
    login: userState.loginLoading
  })
)

export const selectIsAnyLoading = createSelector(
  [selectUserLoadingStates],
  (loadingStates) => Object.values(loadingStates).some(loading => loading)
)

// 用户活动状态选择器
export const selectIsUserActive = createSelector(
  [selectUserStatus],
  (status) => status === UserStatus.ACTIVE
)

export const selectIsUserInactive = createSelector(
  [selectUserStatus],
  (status) => status === UserStatus.INACTIVE
)

export const selectIsUserSuspended = createSelector(
  [selectUserStatus],
  (status) => status === UserStatus.SUSPENDED
)

// 用户偏好设置派生选择器
export const selectIsDarkTheme = createSelector(
  [selectUserTheme],
  (theme) => theme === 'dark'
)

export const selectIsAutoTheme = createSelector(
  [selectUserTheme],
  (theme) => theme === 'auto'
)

export const selectAreNotificationsEnabled = createSelector(
  [selectUserNotifications],
  (notifications) => notifications.enabled
)

export const selectIsShareReminderEnabled = createSelector(
  [selectUserNotifications],
  (notifications) => notifications.shareReminder
)

export const selectIsAchievementReminderEnabled = createSelector(
  [selectUserNotifications],
  (notifications) => notifications.achievementReminder
)

export const selectIsLocationSharingEnabled = createSelector(
  [selectUserPrivacy],
  (privacy) => privacy.shareLocation
)

export const selectAreStatisticsAllowed = createSelector(
  [selectUserPrivacy],
  (privacy) => privacy.allowStatistics
)

// 用户统计派生选择器
export const selectUserStatsSummary = createSelector(
  [selectUserStatistics],
  (statistics) => {
    if (!statistics) return null
    
    return {
      totalRecords: statistics.totalRecords,
      totalDuration: statistics.totalDuration,
      totalDistance: statistics.totalDistance,
      totalCalories: statistics.totalCalories,
      thisWeekRecords: statistics.thisWeekRecords,
      thisMonthRecords: statistics.thisMonthRecords,
      longestDuration: statistics.longestDuration,
      longestDistance: statistics.longestDistance,
      favoriteSportType: statistics.favoriteSportType
    }
  }
)

// 等级进度选择器
export const selectLevelProgress = createSelector(
  [selectUserLevel],
  (level) => {
    if (!level) return { progress: 0, percentage: 0 }
    
    const progress = level.currentExp
    const total = level.nextLevelExp
    const percentage = total > 0 ? Math.floor((progress / total) * 100) : 0
    
    return { progress, total, percentage }
  }
)

// 成就统计选择器
export const selectAchievementStats = createSelector(
  [selectUserAchievements, selectCompletedAchievements],
  (allAchievements, completedAchievements) => {
    const total = allAchievements.length
    const completed = completedAchievements.length
    const inProgress = allAchievements.filter(a => !a.isCompleted && a.progress > 0).length
    const notStarted = total - completed - inProgress
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? Math.floor((completed / total) * 100) : 0
    }
  }
)

// 用户完整信息选择器（用于用户资料页面）
export const selectUserProfile = createSelector(
  [
    selectUserInfo,
    selectUserDisplayName,
    selectUserAvatarUrl,
    selectUserLevel,
    selectUserStatistics,
    selectUserAchievements,
    selectIsNewUser,
    selectUserPermissions
  ],
  (userInfo, displayName, avatarUrl, level, statistics, achievements, isNewUser, permissions) => {
    return {
      userInfo,
      displayName,
      avatarUrl,
      level,
      statistics,
      achievements,
      isNewUser,
      permissions,
      achievementCount: achievements.length,
      completedAchievementCount: achievements.filter(a => a.isCompleted).length
    }
  }
)

// 默认导出所有选择器
export default {
  // 基础选择器
  selectUserState,
  selectUserInfo,
  selectIsLoggedIn,
  selectUserStatus,
  selectSessionToken,
  selectSessionExpiresAt,
  
  // 设置选择器
  selectUserSettings,
  selectUserTheme,
  selectUserLanguage,
  selectUserUnits,
  selectUserNotifications,
  selectUserPrivacy,
  
  // 统计选择器
  selectUserStatistics,
  selectTotalRecords,
  selectTotalDuration,
  selectTotalDistance,
  selectTotalCalories,
  selectThisWeekRecords,
  selectThisMonthRecords,
  
  // 等级选择器
  selectUserLevel,
  selectCurrentLevel,
  selectCurrentExp,
  selectTotalExp,
  selectLevelName,
  selectLevelIcon,
  
  // 成就选择器
  selectUserAchievements,
  selectCompletedAchievements,
  selectAchievementCount,
  selectCompletedAchievementCount,
  
  // 权限选择器
  selectUserPermissions,
  selectHasPermission,
  
  // 设备信息选择器
  selectDeviceInfo,
  
  // 计算和派生选择器
  selectUserDisplayName,
  selectUserAvatarUrl,
  selectIsNewUser,
  selectIsSessionValid,
  
  // 加载状态选择器
  selectUserInfoLoading,
  selectLoginLoading,
  selectSettingsLoading,
  selectStatisticsLoading,
  selectLevelLoading,
  selectAchievementsLoading,
  selectUserLoadingStates,
  selectIsAnyLoading,
  
  // 错误状态选择器
  selectUserInfoError,
  selectLoginError,
  selectSettingsError,
  selectStatisticsError,
  selectLevelError,
  selectAchievementsError,
  selectUserErrors,
  selectHasAnyError,
  
  // 活动状态选择器
  selectIsUserActive,
  selectIsUserInactive,
  selectIsUserSuspended,
  
  // 偏好设置派生选择器
  selectIsDarkTheme,
  selectIsAutoTheme,
  selectAreNotificationsEnabled,
  selectIsShareReminderEnabled,
  selectIsAchievementReminderEnabled,
  selectIsLocationSharingEnabled,
  selectAreStatisticsAllowed,
  
  // 统计派生选择器
  selectUserStatsSummary,
  selectLevelProgress,
  selectAchievementStats,
  
  // 用户完整信息选择器
  selectUserProfile
} as const