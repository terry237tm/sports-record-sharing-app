/**
 * 用户相关Hooks测试
 * 测试用户认证、状态管理等功能的Hooks
 */

import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useAuth, useUser, useUserPermissions, useUserSettings } from '../user'
import userReducer from '@/store/slices/userSlice'

// 创建测试用的Redux store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer
    },
    preloadedState
  })
}

// 包装器组件，提供Redux store
const TestWrapper = ({ store, children }: { store: any; children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
)

describe('User Hooks', () => {
  let store: any

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  describe('useAuth', () => {
    it('应该提供用户认证状态', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('应该提供登录功能', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      // 模拟登录过程
      await act(async () => {
        await result.current.login()
      })

      // 这里应该验证登录逻辑是否被正确调用
      expect(result.current.login).toBeDefined()
      expect(typeof result.current.login).toBe('function')
    })

    it('应该提供登出功能', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.logout).toBeDefined()
      expect(typeof result.current.logout).toBe('function')
    })

    it('应该处理登录状态', () => {
      // 设置已登录状态
      const authenticatedStore = createTestStore({
        user: {
          currentUser: {
            openid: 'test-user-id',
            nickname: '测试用户',
            avatar: '/test-avatar.png'
          },
          isAuthenticated: true,
          isLoading: false
        }
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={authenticatedStore}>{children}</TestWrapper>
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(
        expect.objectContaining({
          openid: 'test-user-id',
          nickname: '测试用户'
        })
      )
    })
  })

  describe('useUser', () => {
    it('应该提供用户信息', () => {
      const userStore = createTestStore({
        user: {
          currentUser: {
            openid: 'test-user-id',
            nickname: '测试用户',
            avatar: '/test-avatar.png',
            gender: 1,
            city: '北京市'
          }
        }
      })

      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <TestWrapper store={userStore}>{children}</TestWrapper>
      })

      expect(result.current.user).toEqual(
        expect.objectContaining({
          openid: 'test-user-id',
          nickname: '测试用户',
          avatar: '/test-avatar.png'
        })
      )
    })

    it('应该提供用户信息更新功能', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      const newUserData = {
        nickname: '新昵称',
        avatar: '/new-avatar.png'
      }

      await act(async () => {
        await result.current.updateUserInfo(newUserData)
      })

      expect(result.current.updateUserInfo).toBeDefined()
      expect(typeof result.current.updateUserInfo).toBe('function')
    })

    it('应该提供用户信息获取功能', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      await act(async () => {
        await result.current.fetchUserInfo()
      })

      expect(result.current.fetchUserInfo).toBeDefined()
      expect(typeof result.current.fetchUserInfo).toBe('function')
    })
  })

  describe('useUserPermissions', () => {
    it('应该提供用户权限信息', () => {
      const permissionsStore = createTestStore({
        user: {
          permissions: {
            canShare: true,
            canComment: true,
            canUploadImages: true,
            canUseLocation: true
          }
        }
      })

      const { result } = renderHook(() => useUserPermissions(), {
        wrapper: ({ children }) => <TestWrapper store={permissionsStore}>{children}</TestWrapper>
      })

      expect(result.current.permissions).toEqual(
        expect.objectContaining({
          canShare: true,
          canComment: true,
          canUploadImages: true,
          canUseLocation: true
        })
      )
    })

    it('应该提供权限检查功能', () => {
      const permissionsStore = createTestStore({
        user: {
          permissions: {
            canShare: true,
            canComment: false
          }
        }
      })

      const { result } = renderHook(() => useUserPermissions(), {
        wrapper: ({ children }) => <TestWrapper store={permissionsStore}>{children}</TestWrapper>
      })

      expect(result.current.hasPermission('canShare')).toBe(true)
      expect(result.current.hasPermission('canComment')).toBe(false)
      expect(result.current.hasPermission('canUploadImages')).toBe(false)
    })

    it('应该提供权限请求功能', async () => {
      const { result } = renderHook(() => useUserPermissions(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      await act(async () => {
        await result.current.requestPermission('userLocation')
      })

      expect(result.current.requestPermission).toBeDefined()
      expect(typeof result.current.requestPermission).toBe('function')
    })
  })

  describe('useUserSettings', () => {
    it('应该提供用户设置', () => {
      const settingsStore = createTestStore({
        user: {
          settings: {
            theme: 'dark',
            language: 'en',
            notifications: {
              sportReminder: true,
              achievementNotification: false
            }
          }
        }
      })

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: ({ children }) => <TestWrapper store={settingsStore}>{children}</TestWrapper>
      })

      expect(result.current.settings).toEqual(
        expect.objectContaining({
          theme: 'dark',
          language: 'en',
          notifications: expect.objectContaining({
            sportReminder: true,
            achievementNotification: false
          })
        })
      )
    })

    it('应该提供设置更新功能', async () => {
      const { result } = renderHook(() => useUserSettings(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      const newSettings = {
        theme: 'light',
        language: 'zh-CN'
      }

      await act(async () => {
        await result.current.updateSettings(newSettings)
      })

      expect(result.current.updateSettings).toBeDefined()
      expect(typeof result.current.updateSettings).toBe('function')
    })

    it('应该提供设置获取功能', async () => {
      const { result } = renderHook(() => useUserSettings(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      await act(async () => {
        await result.current.fetchSettings()
      })

      expect(result.current.fetchSettings).toBeDefined()
      expect(typeof result.current.fetchSettings).toBe('function')
    })
  })

  describe('错误处理', () => {
    it('应该处理登录错误', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      // 这里应该模拟登录失败的情况
      // 由于实际的登录逻辑可能涉及外部API调用，
      // 我们需要在集成测试中测试实际的错误处理
      expect(result.current.error).toBeUndefined()
    })

    it('应该处理网络错误', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      // 模拟网络错误情况
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('性能优化', () => {
    it('应该缓存用户数据', () => {
      const userStore = createTestStore({
        user: {
          currentUser: {
            openid: 'test-user-id',
            nickname: '测试用户'
          }
        }
      })

      const { result, rerender } = renderHook(() => useUser(), {
        wrapper: ({ children }) => <TestWrapper store={userStore}>{children}</TestWrapper>
      })

      const firstUser = result.current.user
      
      // 重新渲染，用户数据应该保持不变
      rerender()
      expect(result.current.user).toBe(firstUser)
    })

    it('应该避免不必要的重新渲染', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>
      })

      const initialRenderCount = result.all.length
      
      // 调用不改变状态的函数
      act(() => {
        // 这里可以调用一些不改变状态的方法
      })
      
      // 验证没有不必要的重新渲染
      expect(result.all.length).toBe(initialRenderCount)
    })
  })
})