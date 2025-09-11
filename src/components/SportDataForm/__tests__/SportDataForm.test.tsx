/**
 * SportDataForm组件测试
 * 测试运动数据输入表单组件的渲染和交互
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import SportDataForm from '../index'
import { SportDataValidationRules } from '@/types/sport'

describe('SportDataForm组件', () => {
  const mockOnChange = jest.fn()
  const mockOnValidationChange = jest.fn()

  const defaultProps = {
    values: {
      duration: '',
      distance: '',
      calories: '',
      heartRate: '',
      steps: ''
    },
    onChange: mockOnChange,
    onValidationChange: mockOnValidationChange
  }

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnValidationChange.mockClear()
  })

  describe('基本渲染', () => {
    it('应该正确渲染运动数据表单', () => {
      render(<SportDataForm {...defaultProps} />)
      
      expect(screen.getByText('运动时长（分钟）')).toBeInTheDocument()
      expect(screen.getByText('运动距离（公里）')).toBeInTheDocument()
      expect(screen.getByText('消耗卡路里')).toBeInTheDocument()
      expect(screen.getByText('心率（次/分钟）')).toBeInTheDocument()
      expect(screen.getByText('步数')).toBeInTheDocument()
    })

    it('应该显示所有输入字段', () => {
      render(<SportDataForm {...defaultProps} />)
      
      expect(screen.getByPlaceholderText('请输入运动时长')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入运动距离')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入消耗卡路里')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入心率')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入步数')).toBeInTheDocument()
    })

    it('应该显示必填字段标记', () => {
      render(<SportDataForm {...defaultProps} />)
      
      const labels = screen.getAllByText('*')
      expect(labels.length).toBeGreaterThanOrEqual(2) // 时长和卡路里是必填的
    })
  })

  describe('数据输入', () => {
    it('应该处理时长输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: '30' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('duration', '30')
      })
    })

    it('应该处理距离输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const distanceInput = screen.getByPlaceholderText('请输入运动距离')
      fireEvent.input(distanceInput, { target: { value: '5.2' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('distance', '5.2')
      })
    })

    it('应该处理卡路里输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const caloriesInput = screen.getByPlaceholderText('请输入消耗卡路里')
      fireEvent.input(caloriesInput, { target: { value: '300' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('calories', '300')
      })
    })

    it('应该处理心率输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const heartRateInput = screen.getByPlaceholderText('请输入心率')
      fireEvent.input(heartRateInput, { target: { value: '120' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('heartRate', '120')
      })
    })

    it('应该处理步数输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const stepsInput = screen.getByPlaceholderText('请输入步数')
      fireEvent.input(stepsInput, { target: { value: '5200' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('steps', '5200')
      })
    })

    it('应该处理多个字段的连续输入', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const inputs = [
        { placeholder: '请输入运动时长', field: 'duration', value: '45' },
        { placeholder: '请输入运动距离', field: 'distance', value: '8.5' },
        { placeholder: '请输入消耗卡路里', field: 'calories', value: '450' }
      ]

      for (const input of inputs) {
        const element = screen.getByPlaceholderText(input.placeholder)
        fireEvent.input(element, { target: { value: input.value } })
        
        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith(input.field, input.value)
        })
      }
    })
  })

  describe('初始值显示', () => {
    it('应该显示传入的初始值', () => {
      const propsWithValues = {
        ...defaultProps,
        values: {
          duration: '60',
          distance: '10.5',
          calories: '500',
          heartRate: '130',
          steps: '10000'
        }
      }
      
      render(<SportDataForm {...propsWithValues} />)
      
      expect(screen.getByDisplayValue('60')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10.5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('500')).toBeInTheDocument()
      expect(screen.getByDisplayValue('130')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10000')).toBeInTheDocument()
    })
  })

  describe('验证功能', () => {
    it('应该验证必填字段', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      // 不输入任何内容，直接提交
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.blur(durationInput)
      
      await waitFor(() => {
        expect(screen.getByText('运动时长不能为空')).toBeInTheDocument()
      })
    })

    it('应该验证时长范围', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: '0' } })
      fireEvent.blur(durationInput)
      
      await waitFor(() => {
        expect(screen.getByText('运动时长应在1-1440分钟之间')).toBeInTheDocument()
      })
    })

    it('应该验证距离范围', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const distanceInput = screen.getByPlaceholderText('请输入运动距离')
      fireEvent.input(distanceInput, { target: { value: '300' } })
      fireEvent.blur(distanceInput)
      
      await waitFor(() => {
        expect(screen.getByText('运动距离应在0.1-200公里之间')).toBeInTheDocument()
      })
    })

    it('应该验证卡路里范围', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const caloriesInput = screen.getByPlaceholderText('请输入消耗卡路里')
      fireEvent.input(caloriesInput, { target: { value: '5' } })
      fireEvent.blur(caloriesInput)
      
      await waitFor(() => {
        expect(screen.getByText('消耗卡路里应在10-5000之间')).toBeInTheDocument()
      })
    })

    it('应该验证心率范围', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const heartRateInput = screen.getByPlaceholderText('请输入心率')
      fireEvent.input(heartRateInput, { target: { value: '300' } })
      fireEvent.blur(heartRateInput)
      
      await waitFor(() => {
        expect(screen.getByText('心率应在40-220之间')).toBeInTheDocument()
      })
    })

    it('应该验证步数范围', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const stepsInput = screen.getByPlaceholderText('请输入步数')
      fireEvent.input(stepsInput, { target: { value: '200000' } })
      fireEvent.blur(stepsInput)
      
      await waitFor(() => {
        expect(screen.getByText('步数应在1-100000之间')).toBeInTheDocument()
      })
    })

    it('应该验证数字格式', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: 'abc' } })
      fireEvent.blur(durationInput)
      
      await waitFor(() => {
        expect(screen.getByText('请输入有效的数字')).toBeInTheDocument()
      })
    })

    it('应该调用验证状态回调', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      // 输入有效值
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: '30' } })
      fireEvent.blur(durationInput)
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith('duration', true)
      })
    })

    it('应该在验证失败时调用回调', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      // 输入无效值
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: '0' } })
      fireEvent.blur(durationInput)
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith('duration', false)
      })
    })
  })

  describe('自定义属性', () => {
    it('应该支持自定义类名', () => {
      const { container } = render(
        <SportDataForm 
          {...defaultProps}
          className="custom-form"
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-form')
    })

    it('应该支持自定义样式', () => {
      const customStyle = { marginTop: '20px' }
      const { container } = render(
        <SportDataForm 
          {...defaultProps}
          style={customStyle}
        />
      )
      
      expect(container.firstChild).toHaveStyle('margin-top: 20px')
    })

    it('应该支持禁用状态', () => {
      render(
        <SportDataForm 
          {...defaultProps}
          disabled
        />
      )
      
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的表单结构', () => {
      render(<SportDataForm {...defaultProps} />)
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-label', '运动数据输入表单')
    })

    it('应该支持标签关联', () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      expect(durationInput).toHaveAttribute('aria-label', '运动时长（分钟）')
    })

    it('应该支持错误提示', () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      fireEvent.input(durationInput, { target: { value: '0' } })
      fireEvent.blur(durationInput)
      
      waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的值', () => {
      const propsWithInvalidValues = {
        ...defaultProps,
        values: {
          duration: 'invalid',
          distance: 'invalid',
          calories: 'invalid',
          heartRate: 'invalid',
          steps: 'invalid'
        }
      }
      
      // 不应该抛出错误
      expect(() => {
        render(<SportDataForm {...propsWithInvalidValues} />)
      }).not.toThrow()
    })

    it('应该处理onChange回调错误', () => {
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error')
      })
      
      // 不应该抛出错误到组件层面
      expect(() => {
        render(<SportDataForm {...defaultProps} onChange={errorOnChange} />)
        const durationInput = screen.getByPlaceholderText('请输入运动时长')
        fireEvent.input(durationInput, { target: { value: '30' } })
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染表单', () => {
      const startTime = performance.now()
      
      render(<SportDataForm {...defaultProps} />)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // 100ms内渲染
    })

    it('应该快速处理输入事件', async () => {
      render(<SportDataForm {...defaultProps} />)
      
      const durationInput = screen.getByPlaceholderText('请输入运动时长')
      const startTime = performance.now()
      
      fireEvent.input(durationInput, { target: { value: '30' } })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50) // 50ms内处理
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('duration', '30')
      })
    })
  })
})