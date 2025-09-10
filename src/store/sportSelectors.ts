/**
 * 运动记录状态选择器
 * 提供高效的状态选择功能，支持记忆化和复杂查询
 */

import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'
import { SportType, SportRecordListItem, SportRecord } from '@/types'

// 基础选择器
export const selectSportState = (state: RootState) => state.sport

// 运动记录列表相关选择器
export const selectSportRecords = createSelector(
  [selectSportState],
  (sportState) => sportState.records
)

export const selectRecordsLoading = createSelector(
  [selectSportState],
  (sportState) => sportState.recordsLoading
)

export const selectRecordsError = createSelector(
  [selectSportState],
  (sportState) => sportState.recordsError
)

export const selectRecordsPagination = createSelector(
  [selectSportState],
  (sportState) => sportState.recordsPagination
)

export const selectHasMoreRecords = createSelector(
  [selectRecordsPagination],
  (pagination) => pagination.hasMore
)

export const selectCurrentPage = createSelector(
  [selectRecordsPagination],
  (pagination) => pagination.page
)

export const selectTotalRecords = createSelector(
  [selectRecordsPagination],
  (pagination) => pagination.total
)

// 当前运动记录相关选择器
export const selectCurrentRecord = createSelector(
  [selectSportState],
  (sportState) => sportState.currentRecord
)

export const selectCurrentRecordLoading = createSelector(
  [selectSportState],
  (sportState) => sportState.currentRecordLoading
)

export const selectCurrentRecordError = createSelector(
  [selectSportState],
  (sportState) => sportState.currentRecordError
)

// 表单相关选择器
export const selectFormData = createSelector(
  [selectSportState],
  (sportState) => sportState.formData
)

export const selectFormLoading = createSelector(
  [selectSportState],
  (sportState) => sportState.formLoading
)

export const selectFormError = createSelector(
  [selectSportState],
  (sportState) => sportState.formError
)

// 操作状态选择器
export const selectSaveLoading = createSelector(
  [selectSportState],
  (sportState) => sportState.saveLoading
)

export const selectSaveError = createSelector(
  [selectSportState],
  (sportState) => sportState.saveError
)

export const selectDeleteLoading = createSelector(
  [selectSportState],
  (sportState) => sportState.deleteLoading
)

export const selectDeleteError = createSelector(
  [selectSportState],
  (sportState) => sportState.deleteError
)

// 查询参数选择器
export const selectQuery = createSelector(
  [selectSportState],
  (sportState) => sportState.query
)

export const selectQuerySportType = createSelector(
  [selectQuery],
  (query) => query.sportType
)

export const selectQueryKeyword = createSelector(
  [selectQuery],
  (query) => query.keyword
)

export const selectQueryDateRange = createSelector(
  [selectQuery],
  (query) => ({
    startDate: query.startDate,
    endDate: query.endDate
  })
)

// 运动类型统计选择器
export const selectSportTypeStats = createSelector(
  [selectSportState],
  (sportState) => sportState.sportTypeStats
)

// 复合选择器 - 按运动类型筛选记录
export const selectRecordsBySportType = createSelector(
  [selectSportRecords, selectQuerySportType],
  (records, sportType) => {
    if (!sportType) return records
    return records.filter(record => record.sportType === sportType)
  }
)

// 复合选择器 - 按关键词筛选记录
export const selectRecordsByKeyword = createSelector(
  [selectSportRecords, selectQueryKeyword],
  (records, keyword) => {
    if (!keyword) return records
    const lowerKeyword = keyword.toLowerCase()
    return records.filter(record => 
      record.description.toLowerCase().includes(lowerKeyword) ||
      record.sportType.toLowerCase().includes(lowerKeyword)
    )
  }
)

// 复合选择器 - 按日期范围筛选记录
export const selectRecordsByDateRange = createSelector(
  [selectSportRecords, selectQueryDateRange],
  (records, dateRange) => {
    const { startDate, endDate } = dateRange
    if (!startDate && !endDate) return records
    
    return records.filter(record => {
      const recordDate = new Date(record.createdAt)
      
      if (startDate) {
        const start = new Date(startDate)
        if (recordDate < start) return false
      }
      
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // 包含结束日期的整天
        if (recordDate > end) return false
      }
      
      return true
    })
  }
)

// 复合选择器 - 综合筛选记录
export const selectFilteredRecords = createSelector(
  [selectRecordsBySportType, selectRecordsByKeyword, selectRecordsByDateRange],
  (byType, byKeyword, byDateRange) => {
    // 取三个筛选结果的交集
    const typeIds = new Set(byType.map(r => r._id))
    const keywordIds = new Set(byKeyword.map(r => r._id))
    const dateIds = new Set(byDateRange.map(r => r._id))
    
    return byType.filter(record => 
      keywordIds.has(record._id) && dateIds.has(record._id)
    )
  }
)

// 复合选择器 - 获取特定运动类型的记录数量
export const selectRecordCountBySportType = createSelector(
  [selectSportRecords],
  (records) => {
    const counts: Record<SportType, number> = {} as Record<SportType, number>
    
    Object.values(SportType).forEach(type => {
      counts[type] = records.filter(record => record.sportType === type).length
    })
    
    return counts
  }
)

// 复合选择器 - 获取最近的运动记录
export const selectRecentRecords = createSelector(
  [selectSportRecords, (state: RootState, limit: number = 5) => limit],
  (records, limit) => {
    return [...records]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }
)

// 复合选择器 - 获取运动数据统计
export const selectSportDataStats = createSelector(
  [selectSportRecords],
  (records) => {
    if (records.length === 0) {
      return {
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0,
        totalSteps: 0,
        averageDuration: 0,
        averageDistance: 0,
        averageCalories: 0,
        recordCount: 0
      }
    }
    
    const stats = records.reduce(
      (acc, record) => ({
        totalDuration: acc.totalDuration + record.data.duration,
        totalDistance: acc.totalDistance + (record.data.distance || 0),
        totalCalories: acc.totalCalories + record.data.calories,
        totalSteps: acc.totalSteps + (record.data.steps || 0),
        count: acc.count + 1
      }),
      { totalDuration: 0, totalDistance: 0, totalCalories: 0, totalSteps: 0, count: 0 }
    )
    
    return {
      totalDuration: stats.totalDuration,
      totalDistance: stats.totalDistance,
      totalCalories: stats.totalCalories,
      totalSteps: stats.totalSteps,
      averageDuration: Math.round(stats.totalDuration / stats.count),
      averageDistance: Math.round((stats.totalDistance / stats.count) * 100) / 100,
      averageCalories: Math.round(stats.totalCalories / stats.count),
      recordCount: stats.count
    }
  }
)

// 复合选择器 - 检查是否有正在进行的操作
export const selectIsAnyLoading = createSelector(
  [selectRecordsLoading, selectCurrentRecordLoading, selectFormLoading, selectSaveLoading, selectDeleteLoading],
  (recordsLoading, currentRecordLoading, formLoading, saveLoading, deleteLoading) => {
    return recordsLoading || currentRecordLoading || formLoading || saveLoading || deleteLoading
  }
)

// 复合选择器 - 获取所有错误信息
export const selectAllErrors = createSelector(
  [selectSportState],
  (sportState) => ({
    recordsError: sportState.recordsError,
    currentRecordError: sportState.currentRecordError,
    formError: sportState.formError,
    saveError: sportState.saveError,
    deleteError: sportState.deleteError
  })
)

// 复合选择器 - 检查是否有错误
export const selectHasAnyError = createSelector(
  [selectAllErrors],
  (errors) => {
    return Object.values(errors).some(error => error !== null)
  }
)