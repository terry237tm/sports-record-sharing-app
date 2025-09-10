/**
 * Redux hooks 类型安全封装
 * 提供类型安全的 useAppDispatch 和 useAppSelector
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// 在整个应用中使用，而不是简单的 `useDispatch` 和 `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector