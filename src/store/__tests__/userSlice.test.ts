/**
 * 用户状态Slice测试
 * 测试用户相关的状态管理功能
 */

import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../slices/userSlice'
import { UserStatus, UserPermission } from '@/types'
import { DefaultUserSettings } from '@/types/user'

describe('用户状态管理', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer
      }
    })
  })

  describe('用户登录状态管理', () => {
    it('应该初始化用户状态', () => {
      const state = store.getState().user
      
      expect(state.isLoggedIn).toBe(false)
      expect(state.userInfo).toBeNull()
      expect(state.status).toBe(UserStatus.INACTIVE)
      expect(state.sessionToken).toBeNull()
      expect(state.sessionExpiresAt).toBeNull()
    })

    it('应该能够设置用户信息', () => {
      const mockUserInfo = {
        openid: 'test_openid',
        nickname: 'TestUser',
        avatar: '/test-avatar.png'
      }

      store.dispatch({
        type: 'user/setUserInfo',
        payload: mockUserInfo
      })

      const state = store.getState().user
      expect(state.userInfo).toEqual(mockUserInfo)
      expect(state.isLoggedIn).toBe(true)
      expect(state.status).toBe(UserStatus.ACTIVE)
    })

    it('应该能够登出用户', () => {
      // 先设置用户信息
      store.dispatch({
        type: 'user/setUserInfo',
        payload: {
          openid: 'test_openid',
          nickname: 'TestUser',
          avatar: '/test-avatar.png'
        }
      })

      // 然后登出
      store.dispatch({ type: 'user/logout' })

      const state = store.getState().user
      expect(state.userInfo).toBeNull()
      expect(state.isLoggedIn).toBe(false)
      expect(state.status).toBe(UserStatus.INACTIVE)
      expect(state.sessionToken).toBeNull()
      expect(state.sessionExpiresAt).toBeNull()
    })
  })

  describe('用户设置管理', () => {
    it('应该初始化用户设置', () => {
      const state = store.getState().user
      expect(state.settings).toEqual(DefaultUserSettings)
    })

    it('应该能够更新用户设置', () => {
      const newSettings = {
        theme: 'dark' as const,
        language: 'en-US' as const,
        units: {
          distance: 'mile' as const,
          weight: 'lb' as const
        },
        notifications: {
          enabled: false,
          shareReminder: false,
          achievementReminder: false
        },
        privacy: {
          shareLocation: false,
          allowStatistics: false
        }
      }

      store.dispatch({
        type: 'user/setSettings',
        payload: newSettings
      })

      const state = store.getState().user
      expect(state.settings).toEqual(newSettings)
    })

    it('应该能够部分更新用户设置', () => {
      store.dispatch({
        type: 'user/updateSettings',
        payload: {
          theme: 'dark'
        }
      })

      const state = store.getState().user
      expect(state.settings.theme).toBe('dark')
      expect(state.settings.language).toBe('zh-CN') // 其他设置保持不变
    })
  })

  describe('用户统计管理', () => {
    it('应该初始化用户统计为null', () => {
      const state = store.getState().user
      expect(state.statistics).toBeNull()
    })

    it('应该能够设置用户统计', () => {
      const mockStatistics = {
        totalRecords: 10,
        totalDuration: 300,
        totalDistance: 50,
        totalCalories: 5000,
        thisWeekRecords: 3,
        thisMonthRecords: 8,
        longestDuration: 60,
        longestDistance: 15,
        favoriteSportType: '跑步'
      }

      store.dispatch({
        type: 'user/setStatistics',
        payload: mockStatistics
      })

      const state = store.getState().user
      expect(state.statistics).toEqual(mockStatistics)
    })
  })

  describe('用户等级管理', () => {
    it('应该初始化用户等级为null', () => {
      const state = store.getState().user
      expect(state.level).toBeNull()
    })

    it('应该能够设置用户等级', () => {
      const mockLevel = {
        currentLevel: 5,
        currentExp: 250,
        nextLevelExp: 500,
        totalExp: 1250,
        levelName: '专业',
        levelIcon: '🏆5'
      }

      store.dispatch({
        type: 'user/setLevel',
        payload: mockLevel
      })

      const state = store.getState().user
      expect(state.level).toEqual(mockLevel)
    })
  })

  describe('用户成就管理', () => {
    it('应该初始化用户成就为空数组', () => {
      const state = store.getState().user
      expect(state.achievements).toEqual([])
    })

    it('应该能够设置用户成就', () => {
      const mockAchievements = [
        {
          id: 'achievement_1',
          title: '初次运动',
          description: '完成第一次运动记录',
          icon: '🏃',
          progress: 1,
          target: 1,
          isCompleted: true,
          completedAt: '2024-01-01T00:00:00Z'
        }
      ]

      store.dispatch({
        type: 'user/setAchievements',
        payload: mockAchievements
      })

      const state = store.getState().user
      expect(state.achievements).toEqual(mockAchievements)
    })
  })

  describe('会话管理', () => {
    it('应该能够设置会话信息', () => {
      const sessionInfo = {
        token: 'test_token',
        expiresAt: '2024-12-31T23:59:59Z'
      }

      store.dispatch({
        type: 'user/setSession',
        payload: sessionInfo
      })

      const state = store.getState().user
      expect(state.sessionToken).toBe('test_token')
      expect(state.sessionExpiresAt).toBe('2024-12-31T23:59:59Z')
    })

    it('应该能够清除会话信息', () => {
      // 先设置会话
      store.dispatch({
        type: 'user/setSession',
        payload: {
          token: 'test_token',
          expiresAt: '2024-12-31T23:59:59Z'
        }
      })

      // 然后清除会话
      store.dispatch({ type: 'user/clearSession' })

      const state = store.getState().user
      expect(state.sessionToken).toBeNull()
      expect(state.sessionExpiresAt).toBeNull()
    })
  })

  describe('权限管理', () => {
    it('应该初始化权限为空数组', () => {
      const state = store.getState().user
      expect(state.permissions).toEqual([])
    })

    it('应该能够设置用户权限', () => {
      const permissions = [
        UserPermission.CREATE_RECORD,
        UserPermission.UPDATE_RECORD,
        UserPermission.DELETE_RECORD
      ]

      store.dispatch({
        type: 'user/setPermissions',
        payload: permissions
      })

      const state = store.getState().user
      expect(state.permissions).toEqual(permissions)
    })
  })

  describe('加载状态管理', () => {
    it('应该能够设置用户信息加载状态', () => {
      store.dispatch({
        type: 'user/setUserInfoLoading',
        payload: true
      })

      const state = store.getState().user
      expect(state.userInfoLoading).toBe(true)
    })

    it('应该能够设置登录加载状态', () => {
      store.dispatch({
        type: 'user/setLoginLoading',
        payload: true
      })

      const state = store.getState().user
      expect(state.loginLoading).toBe(true)
    })
  })

  describe('错误状态管理', () => {
    it('应该能够设置用户信息错误', () => {
      store.dispatch({
        type: 'user/setUserInfoError',
        payload: '获取用户信息失败'
      })

      const state = store.getState().user
      expect(state.userInfoError).toBe('获取用户信息失败')
    })

    it('应该能够清除用户信息错误', () => {
      // 先设置错误
      store.dispatch({
        type: 'user/setUserInfoError',
        payload: '获取用户信息失败'
      })

      // 然后清除错误
      store.dispatch({
        type: 'user/setUserInfoError',
        payload: null
      })

      const state = store.getState().user
      expect(state.userInfoError).toBeNull()
    })
  })

  describe('状态重置', () => {
    it('应该能够重置所有状态', () => {
      // 先设置一些状态
      store.dispatch({
        type: 'user/setUserInfo',
        payload: {
          openid: 'test_openid',
          nickname: 'TestUser',
          avatar: '/test-avatar.png'
        }
      })
      store.dispatch({
        type: 'user/setStatistics',
        payload: { totalRecords: 10 }
      })

      // 然后重置状态
      store.dispatch({ type: 'user/resetState' })

      const state = store.getState().user
      expect(state.userInfo).toBeNull()
      expect(state.isLoggedIn).toBe(false)
      expect(state.statistics).toBeNull()
      expect(state.settings).toEqual(DefaultUserSettings)
    })
  })
})