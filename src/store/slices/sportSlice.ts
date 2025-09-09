/**
 * 运动记录状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SportRecord, SportRecordListItem, SportRecordQuery, PaginatedData, SportRecordFormData, SportType } from '@/types'

// 运动记录状态接口
interface SportState {
  // 运动记录列表
  records: SportRecordListItem[]
  recordsLoading: boolean
  recordsError: string | null
  recordsPagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
  
  // 当前运动记录
  currentRecord: SportRecord | null
  currentRecordLoading: boolean
  currentRecordError: string | null
  
  // 运动记录表单
  formData: SportRecordFormData
  formLoading: boolean
  formError: string | null
  
  // 创建/更新状态
  saveLoading: boolean
  saveError: string | null
  
  // 删除状态
  deleteLoading: boolean
  deleteError: string | null
  
  // 查询参数
  query: SportRecordQuery
  
  // 运动类型统计
  sportTypeStats: Record<SportType, number>
}

// 初始状态
const initialState: SportState = {
  records: [],
  recordsLoading: false,
  recordsError: null,
  recordsPagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  },
  
  currentRecord: null,
  currentRecordLoading: false,
  currentRecordError: null,
  
  formData: {
    sportType: SportType.RUNNING,
    duration: '',
    distance: '',
    calories: '',
    heartRate: '',
    steps: '',
    description: '',
    images: [],
    location: undefined
  },
  formLoading: false,
  formError: null,
  
  saveLoading: false,
  saveError: null,
  
  deleteLoading: false,
  deleteError: null,
  
  query: {
    page: 1,
    pageSize: 10
  },
  
  sportTypeStats: {} as Record<SportType, number>
}

// 创建 slice
const sportSlice = createSlice({
  name: 'sport',
  initialState,
  reducers: {
    // 设置运动记录列表
    setRecords: (state, action: PayloadAction<SportRecordListItem[]>) => {
      state.records = action.payload
    },
    
    // 添加运动记录到列表
    addRecords: (state, action: PayloadAction<SportRecordListItem[]>) => {
      state.records = [...state.records, ...action.payload]
    },
    
    // 更新单条记录
    updateRecordInList: (state, action: PayloadAction<SportRecordListItem>) => {
      const index = state.records.findIndex(record => record._id === action.payload._id)
      if (index !== -1) {
        state.records[index] = action.payload
      }
    },
    
    // 从列表中删除记录
    removeRecordFromList: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record._id !== action.payload)
    },
    
    // 设置列表加载状态
    setRecordsLoading: (state, action: PayloadAction<boolean>) => {
      state.recordsLoading = action.payload
    },
    
    // 设置列表错误
    setRecordsError: (state, action: PayloadAction<string | null>) => {
      state.recordsError = action.payload
    },
    
    // 设置分页信息
    setRecordsPagination: (state, action: PayloadAction<Partial<SportState['recordsPagination']>>) => {
      state.recordsPagination = { ...state.recordsPagination, ...action.payload }
    },
    
    // 设置当前运动记录
    setCurrentRecord: (state, action: PayloadAction<SportRecord | null>) => {
      state.currentRecord = action.payload
    },
    
    // 设置当前记录加载状态
    setCurrentRecordLoading: (state, action: PayloadAction<boolean>) => {
      state.currentRecordLoading = action.payload
    },
    
    // 设置当前记录错误
    setCurrentRecordError: (state, action: PayloadAction<string | null>) => {
      state.currentRecordError = action.payload
    },
    
    // 设置表单数据
    setFormData: (state, action: PayloadAction<Partial<SportRecordFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    
    // 重置表单数据
    resetFormData: (state) => {
      state.formData = initialState.formData
    },
    
    // 设置表单加载状态
    setFormLoading: (state, action: PayloadAction<boolean>) => {
      state.formLoading = action.payload
    },
    
    // 设置表单错误
    setFormError: (state, action: PayloadAction<string | null>) => {
      state.formError = action.payload
    },
    
    // 设置保存加载状态
    setSaveLoading: (state, action: PayloadAction<boolean>) => {
      state.saveLoading = action.payload
    },
    
    // 设置保存错误
    setSaveError: (state, action: PayloadAction<string | null>) => {
      state.saveError = action.payload
    },
    
    // 设置删除加载状态
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload
    },
    
    // 设置删除错误
    setDeleteError: (state, action: PayloadAction<string | null>) => {
      state.deleteError = action.payload
    },
    
    // 设置查询参数
    setQuery: (state, action: PayloadAction<Partial<SportRecordQuery>>) => {
      state.query = { ...state.query, ...action.payload }
    },
    
    // 重置查询参数
    resetQuery: (state) => {
      state.query = initialState.query
    },
    
    // 设置运动类型统计
    setSportTypeStats: (state, action: PayloadAction<Record<SportType, number>>) => {
      state.sportTypeStats = action.payload
    },
    
    // 重置所有状态
    resetState: (state) => {
      return initialState
    }
  }
})

// 导出 actions
export const {
  setRecords,
  addRecords,
  updateRecordInList,
  removeRecordFromList,
  setRecordsLoading,
  setRecordsError,
  setRecordsPagination,
  setCurrentRecord,
  setCurrentRecordLoading,
  setCurrentRecordError,
  setFormData,
  resetFormData,
  setFormLoading,
  setFormError,
  setSaveLoading,
  setSaveError,
  setDeleteLoading,
  setDeleteError,
  setQuery,
  resetQuery,
  setSportTypeStats,
  resetState
} = sportSlice.actions

// 导出 reducer
export default sportSlice.reducer

// 导出 selectors（可选，用于在组件中选择状态）
export const selectSportRecords = (state: { sport: SportState }) => state.sport.records
export const selectRecordsLoading = (state: { sport: SportState }) => state.sport.recordsLoading
export const selectRecordsError = (state: { sport: SportState }) => state.sport.recordsError
export const selectCurrentRecord = (state: { sport: SportState }) => state.sport.currentRecord
export const selectFormData = (state: { sport: SportState }) => state.sport.formData
export const selectFormLoading = (state: { sport: SportState }) => state.sport.formLoading
export const selectSaveLoading = (state: { sport: SportState }) => state.sport.saveLoading