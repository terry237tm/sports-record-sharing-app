/**
 * useSportForm Hook 测试
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { useSportForm } from '../useSportForm'
import { SportType } from '../../types/sport'

// 模拟验证函数
jest.mock('../../utils/sportFormValidation', () => ({
  validateSportForm: jest.fn((field, value) => {
    // 模拟验证逻辑
    if (field === 'duration' && (!value || value === '')) {
      return '此字段为必填项'
    }
    if (field === 'calories' && (!value || value === '')) {
      return '此字段为必填项'
    }
    return ''
  }),
  formatFormData: jest.fn((formData) => ({
    sportType: formData.sportType,
    data: {
      duration: parseInt(formData.duration) || 0,
      calories: parseInt(formData.calories) || 0
    },
    images: [],
    description: formData.description || ''
  }))
}))

describe('useSportForm Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('应该返回正确的初始状态', () => {
    const { result } = renderHook(() => useSportForm())

    expect(result.current.state.data.sportType).toBe(SportType.RUNNING)
    expect(result.current.state.data.duration).toBe('')
    expect(result.current.state.data.calories).toBe('')
    expect(result.current.state.data.description).toBe('')
    expect(result.current.state.data.images).toEqual([])
    expect(result.current.state.data.location).toBeUndefined()

    expect(result.current.state.errors).toEqual({})
    expect(result.current.state.isDirty).toBe(false)
    expect(result.current.state.isValid).toBe(false)
    expect(result.current.state.isSubmitting).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.submitCount).toBe(0)
    expect(result.current.state.submitError).toBeNull()
    expect(result.current.state.submitSuccess).toBe(false)
  })

  test('updateField 应该正确更新字段值', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.updateField('duration', '30')
    })

    expect(result.current.state.data.duration).toBe('30')
    expect(result.current.state.isDirty).toBe(true)
  })

  test('updateField 应该清除字段错误', () => {
    const { result } = renderHook(() => useSportForm())

    // 先设置一个错误
    act(() => {
      result.current.actions.updateField('duration', '')
      result.current.actions.validateField('duration')
    })

    // 更新字段值
    act(() => {
      result.current.actions.updateField('duration', '30')
    })

    expect(result.current.state.errors.duration).toBe('')
  })

  test('updateLocation 应该正确更新位置信息', () => {
    const { result } = renderHook(() => useSportForm())
    const location = {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区'
    }

    act(() => {
      result.current.actions.updateLocation(location)
    })

    expect(result.current.state.data.location).toEqual(location)
    expect(result.current.state.isDirty).toBe(true)
  })

  test('addImage 应该正确添加图片', () => {
    const { result } = renderHook(() => useSportForm())
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    act(() => {
      result.current.actions.addImage(mockFile)
    })

    expect(result.current.state.data.images).toHaveLength(1)
    expect(result.current.state.data.images[0]).toBe(mockFile)
    expect(result.current.state.isDirty).toBe(true)
  })

  test('addImage 应该限制图片数量', () => {
    const { result } = renderHook(() => useSportForm())
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    // 添加9张图片（最大值）
    act(() => {
      for (let i = 0; i < 9; i++) {
        result.current.actions.addImage(mockFile)
      }
    })

    expect(result.current.state.data.images).toHaveLength(9)

    // 尝试添加第10张图片
    act(() => {
      result.current.actions.addImage(mockFile)
    })

    expect(result.current.state.data.images).toHaveLength(9) // 数量不变
    expect(result.current.state.errors.images).toBe('最多只能上传9张图片')
  })

  test('removeImage 应该正确移除图片', () => {
    const { result } = renderHook(() => useSportForm())
    const mockFile1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
    const mockFile2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })

    // 添加两张图片
    act(() => {
      result.current.actions.addImage(mockFile1)
      result.current.actions.addImage(mockFile2)
    })

    expect(result.current.state.data.images).toHaveLength(2)

    // 移除第一张图片
    act(() => {
      result.current.actions.removeImage(0)
    })

    expect(result.current.state.data.images).toHaveLength(1)
    expect(result.current.state.data.images[0]).toBe(mockFile2)
    expect(result.current.state.isDirty).toBe(true)
  })

  test('validateField 应该正确验证字段', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.updateField('duration', '')
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.actions.validateField('duration')
    })

    expect(result.current.state.errors.duration).toBe('此字段为必填项')
    expect(isValid!).toBe(false)
  })

  test('validateForm 应该正确验证整个表单', () => {
    const { result } = renderHook(() => useSportForm())

    // 设置无效数据
    act(() => {
      result.current.actions.updateField('duration', '')
      result.current.actions.updateField('calories', '')
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.actions.validateForm()
    })

    expect(result.current.state.errors.duration).toBe('此字段为必填项')
    expect(result.current.state.errors.calories).toBe('此字段为必填项')
    expect(result.current.state.isValid).toBe(false)
    expect(isValid!).toBe(false)
  })

  test('validateForm 应该返回true当所有字段都有效', () => {
    const { result } = renderHook(() => useSportForm())

    // 设置有效数据
    act(() => {
      result.current.actions.updateField('duration', '30')
      result.current.actions.updateField('calories', '300')
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.actions.validateForm()
    })

    expect(result.current.state.isValid).toBe(true)
    expect(isValid!).toBe(true)
  })

  test('resetForm 应该重置所有状态', () => {
    const { result } = renderHook(() => useSportForm())

    // 修改状态
    act(() => {
      result.current.actions.updateField('duration', '30')
      result.current.actions.updateField('calories', '300')
      result.current.actions.setSubmitting(true)
      result.current.actions.setLoading(true)
      result.current.actions.incrementSubmitCount()
      result.current.actions.setSubmitError('提交失败')
    })

    // 重置表单
    act(() => {
      result.current.actions.resetForm()
    })

    expect(result.current.state.data.duration).toBe('')
    expect(result.current.state.data.calories).toBe('')
    expect(result.current.state.isDirty).toBe(false)
    expect(result.current.state.isValid).toBe(false)
    expect(result.current.state.isSubmitting).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.submitCount).toBe(0)
    expect(result.current.state.submitError).toBeNull()
    expect(result.current.state.submitSuccess).toBe(false)
  })

  test('setSubmitting 应该正确设置提交状态', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.setSubmitting(true)
    })

    expect(result.current.state.isSubmitting).toBe(true)

    act(() => {
      result.current.actions.setSubmitting(false)
    })

    expect(result.current.state.isSubmitting).toBe(false)
  })

  test('setLoading 应该正确设置加载状态', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.setLoading(true)
    })

    expect(result.current.state.isLoading).toBe(true)

    act(() => {
      result.current.actions.setLoading(false)
    })

    expect(result.current.state.isLoading).toBe(false)
  })

  test('setSubmitError 应该正确设置提交错误', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.setSubmitError('网络错误')
    })

    expect(result.current.state.submitError).toBe('网络错误')
    expect(result.current.state.submitSuccess).toBe(false)
  })

  test('setSubmitSuccess 应该正确设置提交成功', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.setSubmitSuccess(true)
    })

    expect(result.current.state.submitSuccess).toBe(true)
    expect(result.current.state.submitError).toBeNull()
  })

  test('incrementSubmitCount 应该正确增加提交次数', () => {
    const { result } = renderHook(() => useSportForm())

    expect(result.current.state.submitCount).toBe(0)

    act(() => {
      result.current.actions.incrementSubmitCount()
    })

    expect(result.current.state.submitCount).toBe(1)

    act(() => {
      result.current.actions.incrementSubmitCount()
    })

    expect(result.current.state.submitCount).toBe(2)
  })

  test('应该提供格式化数据', () => {
    const { result } = renderHook(() => useSportForm())

    act(() => {
      result.current.actions.updateField('duration', '30')
      result.current.actions.updateField('calories', '300')
    })

    expect(result.current.state.formattedData).toBeDefined()
    expect(result.current.state.formattedData.sportType).toBe(SportType.RUNNING)
    expect(result.current.state.formattedData.data.duration).toBe(30)
    expect(result.current.state.formattedData.data.calories).toBe(300)
  })

  test('应该处理复杂的使用场景', () => {
    const { result } = renderHook(() => useSportForm())

    // 模拟用户填写表单的过程
    act(() => {
      result.current.actions.updateField('duration', '45')
      result.current.actions.updateField('calories', '400')
      result.current.actions.updateField('description', '今天跑了5公里，感觉很棒！')
      
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      result.current.actions.addImage(mockFile)
      
      const location = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区'
      }
      result.current.actions.updateLocation(location)
    })

    // 验证表单
    let isValid: boolean
    act(() => {
      isValid = result.current.actions.validateForm()
    })

    expect(isValid!).toBe(true)
    expect(result.current.state.isValid).toBe(true)
    expect(result.current.state.isDirty).toBe(true)
    expect(result.current.state.errors).toEqual({})
  })
})