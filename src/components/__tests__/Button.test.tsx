/**
 * Button组件测试
 * 测试按钮组件的各种状态和交互
 */

import React from 'react'
import { render, screen, fireEvent } from '@/utils/test-utils'
import Button from '../Button'

describe('Button组件', () => {
  describe('基本渲染', () => {
    it('应该正确渲染按钮文本', () => {
      render(<Button>点击我</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('点击我')
    })

    it('应该渲染自定义类名', () => {
      render(<Button className="custom-class">测试</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('应该渲染自定义样式', () => {
      render(
        <Button style={{ backgroundColor: 'red', fontSize: '16px' }}>测试</Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveStyle({
        backgroundColor: 'red',
        fontSize: '16px'
      })
    })
  })

  describe('按钮类型', () => {
    it('应该渲染主要按钮样式', () => {
      render(<Button type="primary">主要按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--primary')
    })

    it('应该渲染次要按钮样式', () => {
      render(<Button type="secondary">次要按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--secondary')
    })

    it('应该渲染危险按钮样式', () => {
      render(<Button type="danger">危险按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--danger')
    })
  })

  describe('按钮尺寸', () => {
    it('应该渲染正常尺寸按钮', () => {
      render(<Button size="normal">正常按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--normal')
    })

    it('应该渲染小尺寸按钮', () => {
      render(<Button size="small">小按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--small')
    })

    it('应该渲染大尺寸按钮', () => {
      render(<Button size="large">大按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--large')
    })
  })

  describe('按钮状态', () => {
    it('应该渲染禁用状态', () => {
      render(<Button disabled>禁用按钮</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('at-button--disabled')
    })

    it('应该渲染加载状态', () => {
      render(<Button loading>加载中</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button--loading')
      expect(screen.getByText('加载中')).toBeInTheDocument()
    })

    it('应该渲染圆形按钮', () => {
      render(<Button circle>圆形</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--circle')
    })

    it('应该渲染全宽按钮', () => {
      render(<Button full>全宽按钮</Button>)
      expect(screen.getByRole('button')).toHaveClass('at-button--full')
    })
  })

  describe('交互事件', () => {
    it('应该处理点击事件', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>点击我</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('应该处理触摸事件', () => {
      const handleTouchStart = jest.fn()
      const handleTouchEnd = jest.fn()
      
      render(
        <Button 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          触摸测试
        </Button>
      )
      
      const button = screen.getByRole('button')
      fireEvent.touchStart(button)
      fireEvent.touchEnd(button)
      
      expect(handleTouchStart).toHaveBeenCalledTimes(1)
      expect(handleTouchEnd).toHaveBeenCalledTimes(1)
    })

    it('禁用按钮不应该触发点击事件', () => {
      const handleClick = jest.fn()
      render(
        <Button disabled onClick={handleClick}>
          禁用按钮
        </Button>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('图标支持', () => {
    it('应该渲染带图标的按钮', () => {
      render(<Button icon="heart">带图标</Button>)
      const button = screen.getByRole('button')
      expect(button).toContainHTML('heart')
    })

    it('应该渲染只有图标的按钮', () => {
      render(<Button icon="heart" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的按钮角色', () => {
      render(<Button>无障碍按钮</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该支持aria-label属性', () => {
      render(<Button aria-label="自定义标签">按钮</Button>)
      expect(screen.getByLabelText('自定义标签')).toBeInTheDocument()
    })

    it('应该支持aria-disabled属性', () => {
      render(<Button disabled aria-label="禁用按钮">禁用</Button>)
      expect(screen.getByLabelText('禁用按钮')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量按钮', () => {
      const startTime = performance.now()
      
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Button key={i}>按钮 {i}</Button>
          ))}
        </>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // 1秒内渲染100个按钮
      
      expect(screen.getAllByRole('button')).toHaveLength(100)
    })
  })
})