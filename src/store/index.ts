/**
 * Redux store 配置
 * 使用 Redux Toolkit 进行状态管理
 * 提供完整的 TypeScript 类型支持
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import sportReducer from './slices/sportSlice'
import shareReducer from './slices/shareSlice'
import userReducer from './slices/userSlice'
import uiReducer from './slices/uiSlice'

// 配置 Redux store
export const store = configureStore({
  reducer: {
    sport: sportReducer, // 运动记录状态
    share: shareReducer, // 分享功能状态
    user: userReducer, // 用户状态
    ui: uiReducer // UI状态
  },
  // 开发环境下开启 Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
  // 中间件配置
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些 action 类型的序列化检查
        ignoredActions: ['sport/setCurrentRecord', 'share/setCanvas'],
        // 忽略某些 state 路径的序列化检查
        ignoredPaths: ['sport.currentRecord', 'share.canvas']
      },
      // 启用不可变检查
      immutableCheck: {
        ignoredPaths: ['sport.currentRecord', 'share.canvas']
      }
    })
})

// 导出 RootState 类型
export type RootState = ReturnType<typeof store.getState>

// 导出 AppDispatch 类型
export type AppDispatch = typeof store.dispatch

// 导出 AppThunk 类型
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

// 导出 store 实例
export default store