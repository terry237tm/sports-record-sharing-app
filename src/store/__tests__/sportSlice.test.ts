/**
 * 运动记录状态管理测试
 */

import sportReducer, {
  setRecords,
  addRecords,
  updateRecordInList,
  removeRecordFromList,
  setRecordsLoading,
  setRecordsError,
  setCurrentRecord,
  setFormData,
  resetFormData,
  setSaveLoading,
  setQuery,
  resetQuery,
  selectSportRecords,
  selectRecordsLoading,
  selectCurrentRecord,
  selectFormData,
  selectSaveLoading
} from '../slices/sportSlice'

import { SportType, SportRecord, SportRecordListItem } from '@/types'

describe('运动记录状态管理', () => {
  const mockSportRecord: SportRecord = {
    _id: 'test-id',
    openid: 'test-openid',
    sportType: SportType.RUNNING,
    data: {
      duration: 30,
      distance: 5.2,
      calories: 300
    },
    images: ['image1.jpg', 'image2.jpg'],
    description: '今天跑步感觉很棒！',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  }

  const mockSportRecordListItem: SportRecordListItem = {
    _id: 'test-id',
    sportType: SportType.RUNNING,
    data: {
      duration: 30,
      distance: 5.2,
      calories: 300
    },
    images: ['image1.jpg', 'image2.jpg'],
    description: '今天跑步感觉很棒！',
    createdAt: '2024-01-01T10:00:00Z',
    relativeTime: '2小时前'
  }

  describe('运动记录列表管理', () => {
    it('应该能够设置运动记录列表', () => {
      const initialState = sportReducer(undefined, { type: '' })
      const records = [mockSportRecordListItem]
      
      const newState = sportReducer(initialState, setRecords(records))
      
      expect(newState.records).toHaveLength(1)
      expect(newState.records[0]).toEqual(mockSportRecordListItem)
    })

    it('应该能够添加运动记录到列表', () => {
      const initialState = sportReducer(undefined, { type: '' })
      const records = [mockSportRecordListItem]
      
      // 先设置一个记录
      let state = sportReducer(initialState, setRecords(records))
      
      // 再添加一个记录
      const newRecord = { ...mockSportRecordListItem, _id: 'new-id' }
      state = sportReducer(state, addRecords([newRecord]))
      
      expect(state.records).toHaveLength(2)
      expect(state.records[1]._id).toBe('new-id')
    })

    it('应该能够更新列表中的单条记录', () => {
      const initialState = sportReducer(undefined, { type: '' })
      const records = [mockSportRecordListItem]
      
      let state = sportReducer(initialState, setRecords(records))
      
      const updatedRecord = { 
        ...mockSportRecordListItem, 
        description: '更新后的描述' 
      }
      state = sportReducer(state, updateRecordInList(updatedRecord))
      
      expect(state.records[0].description).toBe('更新后的描述')
    })

    it('应该能够从列表中删除记录', () => {
      const initialState = sportReducer(undefined, { type: '' })
      const records = [
        mockSportRecordListItem,
        { ...mockSportRecordListItem, _id: 'id-to-delete' }
      ]
      
      let state = sportReducer(initialState, setRecords(records))
      expect(state.records).toHaveLength(2)
      
      state = sportReducer(state, removeRecordFromList('id-to-delete'))
      expect(state.records).toHaveLength(1)
      expect(state.records[0]._id).toBe('test-id')
    })

    it('应该能够设置列表加载状态', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const loadingState = sportReducer(initialState, setRecordsLoading(true))
      expect(loadingState.recordsLoading).toBe(true)
      
      const loadedState = sportReducer(loadingState, setRecordsLoading(false))
      expect(loadedState.recordsLoading).toBe(false)
    })

    it('应该能够设置列表错误信息', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const errorState = sportReducer(initialState, setRecordsError('加载失败'))
      expect(errorState.recordsError).toBe('加载失败')
      
      const clearedState = sportReducer(errorState, setRecordsError(null))
      expect(clearedState.recordsError).toBe(null)
    })
  })

  describe('当前运动记录管理', () => {
    it('应该能够设置当前运动记录', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const state = sportReducer(initialState, setCurrentRecord(mockSportRecord))
      expect(state.currentRecord).toEqual(mockSportRecord)
    })

    it('应该能够清除当前运动记录', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      let state = sportReducer(initialState, setCurrentRecord(mockSportRecord))
      expect(state.currentRecord).not.toBe(null)
      
      state = sportReducer(state, setCurrentRecord(null))
      expect(state.currentRecord).toBe(null)
    })
  })

  describe('表单数据管理', () => {
    it('应该能够设置表单数据', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const formData = {
        sportType: SportType.CYCLING,
        duration: '60',
        calories: '500'
      }
      
      const state = sportReducer(initialState, setFormData(formData))
      expect(state.formData.sportType).toBe(SportType.CYCLING)
      expect(state.formData.duration).toBe('60')
      expect(state.formData.calories).toBe('500')
    })

    it('应该能够重置表单数据', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      // 先修改表单数据
      let state = sportReducer(initialState, setFormData({
        sportType: SportType.CYCLING,
        duration: '60'
      }))
      
      // 重置表单数据
      state = sportReducer(state, resetFormData())
      
      expect(state.formData.sportType).toBe(SportType.RUNNING)
      expect(state.formData.duration).toBe('')
    })

    it('应该能够设置表单加载状态', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const loadingState = sportReducer(initialState, setFormLoading(true))
      expect(loadingState.formLoading).toBe(true)
      
      const loadedState = sportReducer(loadingState, setFormLoading(false))
      expect(loadedState.formLoading).toBe(false)
    })
  })

  describe('保存状态管理', () => {
    it('应该能够设置保存加载状态', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const loadingState = sportReducer(initialState, setSaveLoading(true))
      expect(loadingState.saveLoading).toBe(true)
      
      const savedState = sportReducer(loadingState, setSaveLoading(false))
      expect(savedState.saveLoading).toBe(false)
    })
  })

  describe('查询参数管理', () => {
    it('应该能够设置查询参数', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      const queryParams = {
        page: 2,
        pageSize: 20,
        sportType: SportType.CYCLING
      }
      
      const state = sportReducer(initialState, setQuery(queryParams))
      expect(state.query.page).toBe(2)
      expect(state.query.pageSize).toBe(20)
      expect(state.query.sportType).toBe(SportType.CYCLING)
    })

    it('应该能够重置查询参数', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      // 先设置查询参数
      let state = sportReducer(initialState, setQuery({
        page: 5,
        sportType: SportType.SWIMMING
      }))
      
      // 重置查询参数
      state = sportReducer(state, resetQuery())
      
      expect(state.query.page).toBe(1)
      expect(state.query.pageSize).toBe(10)
      expect(state.query.sportType).toBeUndefined()
    })
  })

  describe('Selectors', () => {
    const mockState = {
      sport: {
        records: [mockSportRecordListItem],
        recordsLoading: false,
        currentRecord: mockSportRecord,
        formData: {
          sportType: SportType.RUNNING,
          duration: '30',
          distance: '5.2',
          calories: '300'
        },
        saveLoading: false
      }
    }

    it('selectSportRecords 应该返回运动记录列表', () => {
      const records = selectSportRecords(mockState)
      expect(records).toEqual([mockSportRecordListItem])
    })

    it('selectRecordsLoading 应该返回列表加载状态', () => {
      const loading = selectRecordsLoading(mockState)
      expect(loading).toBe(false)
    })

    it('selectCurrentRecord 应该返回当前运动记录', () => {
      const record = selectCurrentRecord(mockState)
      expect(record).toEqual(mockSportRecord)
    })

    it('selectFormData 应该返回表单数据', () => {
      const formData = selectFormData(mockState)
      expect(formData.sportType).toBe(SportType.RUNNING)
      expect(formData.duration).toBe('30')
    })

    it('selectSaveLoading 应该返回保存加载状态', () => {
      const loading = selectSaveLoading(mockState)
      expect(loading).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该能够处理各种错误状态', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      // 设置各种错误
      let state = sportReducer(initialState, setRecordsError('列表加载失败'))
      expect(state.recordsError).toBe('列表加载失败')
      
      let state2 = sportReducer(initialState, setCurrentRecordError('详情加载失败'))
      expect(state2.currentRecordError).toBe('详情加载失败')
      
      let state3 = sportReducer(initialState, setFormError('表单验证失败'))
      expect(state3.formError).toBe('表单验证失败')
      
      let state4 = sportReducer(initialState, setSaveError('保存失败'))
      expect(state4.saveError).toBe('保存失败')
    })
  })

  describe('加载状态管理', () => {
    it('应该能够管理各种加载状态', () => {
      const initialState = sportReducer(undefined, { type: '' })
      
      // 设置各种加载状态
      let state = sportReducer(initialState, setRecordsLoading(true))
      expect(state.recordsLoading).toBe(true)
      
      let state2 = sportReducer(initialState, setCurrentRecordLoading(true))
      expect(state2.currentRecordLoading).toBe(true)
      
      let state3 = sportReducer(initialState, setFormLoading(true))
      expect(state3.formLoading).toBe(true)
      
      let state4 = sportReducer(initialState, setSaveLoading(true))
      expect(state4.saveLoading).toBe(true)
    })
  })
})