/**
 * SportTypeSelector组件测试
 * 测试运动类型选择组件的渲染和交互
 */

import React from 'react'
import { render, screen, fireEvent } from '@/utils/test-utils'
import SportTypeSelector from '../index'
import { SportType } from '@/types/sport'

describe('SportTypeSelector组件', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('基本渲染', () => {
    it('应该正确渲染运动类型选择器', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      expect(screen.getByText('选择运动类型')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('应该显示所有可用的运动类型', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      expect(screen.getByText('跑步')).toBeInTheDocument()
      expect(screen.getByText('骑行')).toBeInTheDocument()
      expect(screen.getByText('游泳')).toBeInTheDocument()
      expect(screen.getByText('健身')).toBeInTheDocument()
      expect(screen.getByText('徒步')).toBeInTheDocument()
      expect(screen.getByText('篮球')).toBeInTheDocument()
      expect(screen.getByText('足球')).toBeInTheDocument()
      expect(screen.getByText('羽毛球')).toBeInTheDocument()
      expect(screen.getByText('网球')).toBeInTheDocument()
      expect(screen.getByText('其他')).toBeInTheDocument()
    })

    it('应该显示正确的运动图标', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      expect(screen.getByText('🏃‍♂️')).toBeInTheDocument() // 跑步
      expect(screen.getByText('🚴‍♂️')).toBeInTheDocument() // 骑行
      expect(screen.getByText('🏊‍♂️')).toBeInTheDocument() // 游泳
      expect(screen.getByText('💪')).toBeInTheDocument() // 健身
    })
  })

  describe('选中状态', () => {
    it('应该显示当前选中的运动类型', () => {
      render(<SportTypeSelector value={SportType.RUNNING} onChange={mockOnChange} />)
      
      const runningOption = screen.getByText('跑步').closest('.sport-type-item')
      expect(runningOption).toHaveClass('selected')
    })

    it('应该显示其他选中的运动类型', () => {
      render(<SportTypeSelector value={SportType.CYCLING} onChange={mockOnChange} />)
      
      const cyclingOption = screen.getByText('骑行').closest('.sport-type-item')
      expect(cyclingOption).toHaveClass('selected')
    })
  })

  describe('交互事件', () => {
    it('应该处理运动类型选择事件', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByText('跑步'))
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(SportType.RUNNING)
    })

    it('应该处理所有运动类型的选择', () => {
      const { container } = render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const sportTypes = [
        { label: '跑步', value: SportType.RUNNING },
        { label: '骑行', value: SportType.CYCLING },
        { label: '游泳', value: SportType.SWIMMING },
        { label: '健身', value: SportType.FITNESS }
      ]

      sportTypes.forEach(({ label, value }) => {
        fireEvent.click(screen.getByText(label))
        expect(mockOnChange).toHaveBeenCalledWith(value)
      })
      
      expect(mockOnChange).toHaveBeenCalledTimes(4)
    })

    it('应该允许多次选择不同的运动类型', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByText('跑步'))
      fireEvent.click(screen.getByText('骑行'))
      fireEvent.click(screen.getByText('游泳'))
      
      expect(mockOnChange).toHaveBeenCalledTimes(3)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, SportType.RUNNING)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, SportType.CYCLING)
      expect(mockOnChange).toHaveBeenNthCalledWith(3, SportType.SWIMMING)
    })
  })

  describe('自定义属性', () => {
    it('应该支持自定义类名', () => {
      const { container } = render(
        <SportTypeSelector 
          value="" 
          onChange={mockOnChange} 
          className="custom-selector"
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-selector')
    })

    it('应该支持自定义样式', () => {
      const customStyle = { marginTop: '20px' }
      const { container } = render(
        <SportTypeSelector 
          value="" 
          onChange={mockOnChange} 
          style={customStyle}
        />
      )
      
      expect(container.firstChild).toHaveStyle('margin-top: 20px')
    })

    it('应该支持禁用状态', () => {
      render(
        <SportTypeSelector 
          value="" 
          onChange={mockOnChange} 
          disabled
        />
      )
      
      const options = container.querySelectorAll('.sport-type-item')
      options.forEach(option => {
        expect(option).toHaveClass('disabled')
      })
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的列表结构', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', '运动类型选择')
    })

    it('应该支持键盘导航', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const firstOption = screen.getByText('跑步').parentElement
      firstOption?.focus()
      
      fireEvent.keyDown(firstOption!, { key: 'Enter' })
      expect(mockOnChange).toHaveBeenCalledWith(SportType.RUNNING)
    })

    it('应该具有正确的按钮角色', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const options = screen.getAllByRole('listitem')
      expect(options.length).toBeGreaterThan(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的运动类型值', () => {
      // 不应该抛出错误
      expect(() => {
        render(<SportTypeSelector value="invalid" onChange={mockOnChange} />)
      }).not.toThrow()
    })

    it('应该处理onChange回调错误', () => {
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error')
      })
      
      // 不应该抛出错误到组件层面
      expect(() => {
        render(<SportTypeSelector value="" onChange={errorOnChange} />)
        fireEvent.click(screen.getByText('跑步'))
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染运动类型选择器', () => {
      const startTime = performance.now()
      
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // 100ms内渲染
    })

    it('应该快速处理选择事件', () => {
      render(<SportTypeSelector value="" onChange={mockOnChange} />)
      
      const startTime = performance.now()
      fireEvent.click(screen.getByText('跑步'))
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 50ms内处理
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
})