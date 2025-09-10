/**
 * 运动记录异步操作
 * 使用 createAsyncThunk 创建异步操作，处理与后端的交互
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { 
  SportRecord, 
  SportRecordListItem, 
  SportRecordQuery, 
  CreateSportRecordParams, 
  UpdateSportRecordParams,
  PaginatedApiResponse,
  ApiResponse
} from '@/types'
import { cloudbaseService } from '@/services/cloudbase'

/**
 * 获取运动记录列表
 * 支持分页和筛选条件
 */
export const fetchSportRecords = createAsyncThunk(
  'sport/fetchRecords',
  async (query: SportRecordQuery) => {
    try {
      const response = await cloudbaseService.callFunction('getSportRecords', query)
      
      if (response.success && response.data) {
        return response.data as PaginatedApiResponse<SportRecordListItem>
      } else {
        throw new Error(response.message || '获取运动记录失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取运动记录失败')
    }
  }
)

/**
 * 获取运动记录详情
 */
export const fetchSportRecordById = createAsyncThunk(
  'sport/fetchRecordById',
  async (id: string) => {
    try {
      const response = await cloudbaseService.callFunction('getSportRecordById', { id })
      
      if (response.success && response.data) {
        return response.data as SportRecord
      } else {
        throw new Error(response.message || '获取运动记录详情失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取运动记录详情失败')
    }
  }
)

/**
 * 创建运动记录
 */
export const createSportRecord = createAsyncThunk(
  'sport/createRecord',
  async (params: CreateSportRecordParams) => {
    try {
      const response = await cloudbaseService.callFunction('createSportRecord', params)
      
      if (response.success && response.data) {
        return response.data as SportRecord
      } else {
        throw new Error(response.message || '创建运动记录失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '创建运动记录失败')
    }
  }
)

/**
 * 更新运动记录
 */
export const updateSportRecord = createAsyncThunk(
  'sport/updateRecord',
  async (params: UpdateSportRecordParams) => {
    try {
      const response = await cloudbaseService.callFunction('updateSportRecord', params)
      
      if (response.success && response.data) {
        return response.data as SportRecord
      } else {
        throw new Error(response.message || '更新运动记录失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '更新运动记录失败')
    }
  }
)

/**
 * 删除运动记录
 */
export const deleteSportRecord = createAsyncThunk(
  'sport/deleteRecord',
  async (id: string) => {
    try {
      const response = await cloudbaseService.callFunction('deleteSportRecord', { id })
      
      if (response.success) {
        return id
      } else {
        throw new Error(response.message || '删除运动记录失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '删除运动记录失败')
    }
  }
)

/**
 * 获取运动类型统计
 */
export const fetchSportTypeStats = createAsyncThunk(
  'sport/fetchSportTypeStats',
  async () => {
    try {
      const response = await cloudbaseService.callFunction('getSportTypeStats', {})
      
      if (response.success && response.data) {
        return response.data as Record<string, number>
      } else {
        throw new Error(response.message || '获取运动类型统计失败')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取运动类型统计失败')
    }
  }
)

/**
 * 上传运动记录图片
 */
export const uploadSportImages = createAsyncThunk(
  'sport/uploadImages',
  async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const response = await cloudbaseService.uploadFile(file, `sport-images/${Date.now()}-${file.name}`)
        
        if (response.success && response.data) {
          return response.data.fileID
        } else {
          throw new Error(response.message || '上传图片失败')
        }
      })
      
      const uploadedUrls = await Promise.all(uploadPromises)
      return uploadedUrls
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '上传图片失败')
    }
  }
)