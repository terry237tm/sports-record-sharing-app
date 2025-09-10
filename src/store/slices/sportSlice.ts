/**
 * 运动记录状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SportRecord, SportRecordListItem, SportRecordQuery, PaginatedData, SportRecordFormData, SportType } from '@/types'
import { 
  fetchSportRecords, 
  fetchSportRecordById, 
  createSportRecord, 
  updateSportRecord, 
  deleteSportRecord,
  fetchSportTypeStats,
  uploadSportImages
} from '../sportThunks'

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
  },
  extraReducers: (builder) => {
    // 获取运动记录列表
    builder
      .addCase(fetchSportRecords.pending, (state) => {
        state.recordsLoading = true
        state.recordsError = null
      })
      .addCase(fetchSportRecords.fulfilled, (state, action) => {
        state.recordsLoading = false
        state.records = action.payload.list
        state.recordsPagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
          hasMore: action.payload.hasMore
        }
      })
      .addCase(fetchSportRecords.rejected, (state, action) => {
        state.recordsLoading = false
        state.recordsError = action.error.message || '获取运动记录失败'
      })

    // 获取运动记录详情
    builder
      .addCase(fetchSportRecordById.pending, (state) => {
        state.currentRecordLoading = true
        state.currentRecordError = null
      })
      .addCase(fetchSportRecordById.fulfilled, (state, action) => {
        state.currentRecordLoading = false
        state.currentRecord = action.payload
      })
      .addCase(fetchSportRecordById.rejected, (state, action) => {
        state.currentRecordLoading = false
        state.currentRecordError = action.error.message || '获取运动记录详情失败'
      })

    // 创建运动记录
    builder
      .addCase(createSportRecord.pending, (state) => {
        state.saveLoading = true
        state.saveError = null
      })
      .addCase(createSportRecord.fulfilled, (state, action) => {
        state.saveLoading = false
        state.currentRecord = action.payload
        // 将新记录添加到列表开头
        const newListItem: SportRecordListItem = {
          _id: action.payload._id!,
          sportType: action.payload.sportType,
          data: action.payload.data,
          images: action.payload.images,
          description: action.payload.description,
          location: action.payload.location,
          createdAt: action.payload.createdAt.toISOString(),
          relativeTime: '刚刚'
        }
        state.records = [newListItem, ...state.records]
      })
      .addCase(createSportRecord.rejected, (state, action) => {
        state.saveLoading = false
        state.saveError = action.error.message || '创建运动记录失败'
      })

    // 更新运动记录
    builder
      .addCase(updateSportRecord.pending, (state) => {
        state.saveLoading = true
        state.saveError = null
      })
      .addCase(updateSportRecord.fulfilled, (state, action) => {
        state.saveLoading = false
        state.currentRecord = action.payload
        // 更新列表中的记录
        const index = state.records.findIndex(record => record._id === action.payload._id)
        if (index !== -1) {
          const updatedListItem: SportRecordListItem = {
            _id: action.payload._id!,
            sportType: action.payload.sportType,
            data: action.payload.data,
            images: action.payload.images,
            description: action.payload.description,
            location: action.payload.location,
            createdAt: action.payload.createdAt.toISOString(),
            relativeTime: state.records[index].relativeTime
          }
          state.records[index] = updatedListItem
        }
      })
      .addCase(updateSportRecord.rejected, (state, action) => {
        state.saveLoading = false
        state.saveError = action.error.message || '更新运动记录失败'
      })

    // 删除运动记录
    builder
      .addCase(deleteSportRecord.pending, (state) => {
        state.deleteLoading = true
        state.deleteError = null
      })
      .addCase(deleteSportRecord.fulfilled, (state, action) => {
        state.deleteLoading = false
        // 从列表中删除记录
        state.records = state.records.filter(record => record._id !== action.payload)
        // 如果删除的是当前查看的记录，清空当前记录
        if (state.currentRecord && state.currentRecord._id === action.payload) {
          state.currentRecord = null
        }
      })
      .addCase(deleteSportRecord.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError = action.error.message || '删除运动记录失败'
      })

    // 获取运动类型统计
    builder
      .addCase(fetchSportTypeStats.pending, (state) => {
        // 可以添加加载状态如果需要
      })
      .addCase(fetchSportTypeStats.fulfilled, (state, action) => {
        state.sportTypeStats = action.payload as Record<SportType, number>
      })
      .addCase(fetchSportTypeStats.rejected, (state, action) => {
        // 可以处理错误状态如果需要
      })

    // 上传图片
    builder
      .addCase(uploadSportImages.pending, (state) => {
        state.formLoading = true
        state.formError = null
      })
      .addCase(uploadSportImages.fulfilled, (state, action) => {
        state.formLoading = false
        // 将上传的图片URL添加到表单数据中
        state.formData.images = [...state.formData.images, ...action.payload]
      })
      .addCase(uploadSportImages.rejected, (state, action) => {
        state.formLoading = false
        state.formError = action.error.message || '上传图片失败'
      })
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

// 导出类型定义
export type { SportState }