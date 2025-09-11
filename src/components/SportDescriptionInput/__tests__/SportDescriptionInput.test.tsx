/**
 * SportDescriptionInput组件测试
 * 测试运动描述输入组件的渲染和交互
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import SportDescriptionInput from '../index'
import { SportDataValidationRules } from '@/types/sport'

describe('SportDescriptionInput组件', () => {
  const mockOnChange = jest.fn()
  const mockOnValidationChange = jest.fn()

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onValidationChange: mockOnValidationChange,
    maxLength: SportDataValidationRules.description.max
  }

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnValidationChange.mockClear()
  })

  describe('基本渲染', () => {
    it('应该正确渲染运动描述输入组件', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      expect(screen.getByText('运动描述')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')).toBeInTheDocument()
    })

    it('应该显示字数限制信息', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      expect(screen.getByText('0/500')).toBeInTheDocument()
    })

    it('应该显示正确的初始状态', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      expect(textarea).toHaveValue('')
      expect(textarea).not.toBeDisabled()
    })
  })

  describe('文本输入', () => {
    it('应该处理文本输入', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      fireEvent.input(textarea, { target: { value: '今天跑步感觉很棒！' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('今天跑步感觉很棒！')
      })
    })

    it('应该处理多行文本输入', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      const multiLineText = '今天跑步感觉很棒！\n路线：从家到公园\n用时：30分钟'
      
      fireEvent.input(textarea, { target: { value: multiLineText } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(multiLineText)
      })
    })

    it('应该处理空文本输入', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      fireEvent.input(textarea, { target: { value: '' } })
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('')
      })
    })
  })

  describe('字数限制', () => {
    it('应该正确计算字数', () => {
      const propsWithValue = {
        ...defaultProps,
        value: '今天跑步'
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByText('4/500')).toBeInTheDocument()
    })

    it('应该限制最大字数', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      const longText = 'a'.repeat(510) // 超过500字限制
      
      fireEvent.input(textarea, { target: { value: longText } })
      
      // 应该被截断到500字
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('a'.repeat(500))
      })
    })

    it('应该正确处理中文字符', () => {
      const chineseText = '今天天气真好，适合户外运动'
      const propsWithValue = {
        ...defaultProps,
        value: chineseText
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByText(`${chineseText.length}/500`)).toBeInTheDocument()
    })

    it('应该正确处理emoji字符', () => {
      const emojiText = '今天跑步🏃‍♂️感觉很棒！'
      const propsWithValue = {
        ...defaultProps,
        value: emojiText
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByText(`${emojiText.length}/500`)).toBeInTheDocument()
    })
  })

  describe('验证功能', () => {
    it('应该验证字数限制', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      const longText = 'a'.repeat(501) // 超过限制
      
      fireEvent.input(textarea, { target: { value: longText } })
      
      await waitFor(() => {
        expect(screen.getByText('运动描述最多500字')).toBeInTheDocument()
      })
    })

    it('应该在字数接近限制时显示警告', () => {
      const nearLimitText = 'a'.repeat(480) // 接近500字限制
      const propsWithValue = {
        ...defaultProps,
        value: nearLimitText
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByText('480/500')).toHaveClass('warning')
    })

    it('应该在字数超出时显示错误', () => {
      const overLimitText = 'a'.repeat(501) // 超出限制
      const propsWithValue = {
        ...defaultProps,
        value: overLimitText
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByText('501/500')).toHaveClass('error')
    })

    it('应该调用验证状态回调', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      // 输入有效文本
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      fireEvent.input(textarea, { target: { value: '今天跑步感觉很棒！' } })
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(true)
      })
    })

    it('应该在验证失败时调用回调', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      // 输入超出限制的文本
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      const longText = 'a'.repeat(501)
      fireEvent.input(textarea, { target: { value: longText } })
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('初始值显示', () => {
    it('应该显示传入的初始值', () => {
      const initialText = '今天跑步30分钟，感觉很棒！'
      const propsWithValue = {
        ...defaultProps,
        value: initialText
      }
      
      render(<SportDescriptionInput {...propsWithValue} />)
      
      expect(screen.getByDisplayValue(initialText)).toBeInTheDocument()
      expect(screen.getByText(`${initialText.length}/500`)).toBeInTheDocument()
    })
  })

  describe('自定义属性', () => {
    it('应该支持自定义类名', () => {
      const { container } = render(
        <SportDescriptionInput 
          {...defaultProps}
          className="custom-input"
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-input')
    })

    it('应该支持自定义样式', () => {
      const customStyle = { marginTop: '20px' }
      const { container } = render(
        <SportDescriptionInput 
          {...defaultProps}
          style={customStyle}
        />
      )
      
      expect(container.firstChild).toHaveStyle('margin-top: 20px')
    })

    it('应该支持自定义最大长度', () => {
      render(
        <SportDescriptionInput 
          {...defaultProps}
          maxLength={200}
        />
      )
      
      expect(screen.getByText('0/200')).toBeInTheDocument()
    })

    it('应该支持禁用状态', () => {
      render(
        <SportDescriptionInput 
          {...defaultProps}
          disabled
        />
      )
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      expect(textarea).toBeDisabled()
    })

    it('应该支持只读状态', () => {
      render(
        <SportDescriptionInput 
          {...defaultProps}
          readOnly
        />
      )
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('应该支持占位符文本', () => {
      const customPlaceholder = '请输入您的运动描述'
      render(
        <SportDescriptionInput 
          {...defaultProps}
          placeholder={customPlaceholder}
        />
      )
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
    })

    it('应该支持标签文本', () => {
      const customLabel = '运动心得'
      render(
        <SportDescriptionInput 
          {...defaultProps}
          label={customLabel}
        />
      )
      
      expect(screen.getByText(customLabel)).toBeInTheDocument()
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的文本域结构', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label', '运动描述')
      expect(textarea).toHaveAttribute('aria-multiline', 'true')
    })

    it('应该支持最大长度属性', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxlength', '500')
    })

    it('应该支持错误提示', () => {
      const overLimitText = 'a'.repeat(501)
      const propsWithError = {
        ...defaultProps,
        value: overLimitText
      }
      
      render(<SportDescriptionInput {...propsWithError} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toHaveAttribute('aria-describedby', 'description-error')
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('应该支持键盘导航', () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByRole('textbox')
      textarea.focus()
      
      expect(document.activeElement).toBe(textarea)
    })
  })

  describe('实时更新', () => {
    it('应该实时更新字数统计', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      
      fireEvent.input(textarea, { target: { value: '今天' } })
      expect(screen.getByText('2/500')).toBeInTheDocument()
      
      fireEvent.input(textarea, { target: { value: '今天跑步' } })
      expect(screen.getByText('4/500')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的值', () => {
      const propsWithInvalidValue = {
        ...defaultProps,
        value: null as any
      }
      
      // 不应该抛出错误
      expect(() => {
        render(<SportDescriptionInput {...propsWithInvalidValue} />)
      }).not.toThrow()
    })

    it('应该处理onChange回调错误', () => {
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error')
      })
      
      // 不应该抛出错误到组件层面
      expect(() => {
        render(
          <SportDescriptionInput 
            {...defaultProps}
            onChange={errorOnChange}
          />
        )
        const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
        fireEvent.input(textarea, { target: { value: 'test' } })
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染描述输入组件', () => {
      const startTime = performance.now()
      
      render(<SportDescriptionInput {...defaultProps} />)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // 100ms内渲染
    })

    it('应该快速处理大量文本输入', async () => {
      render(<SportDescriptionInput {...defaultProps} />)
      
      const textarea = screen.getByPlaceholderText('分享你的运动感受、心得、路线等...')
      const largeText = 'a'.repeat(400) // 大量文本
      
      const startTime = performance.now()
      fireEvent.input(textarea, { target: { value: largeText } })
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 50ms内处理
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(largeText)
      })
    })
  })
})