/**
 * 按钮组件测试
 * 测试通用按钮组件的各种功能和交互
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// 模拟Taro UI组件
jest.mock('taro-ui', () => ({
  AtButton: ({ children, onClick, disabled, loading, type, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`at-button at-button--${type} at-button--${size} ${className || ''}`}
      data-testid="at-button"
      {...props}
    >
      {loading && <span data-testid="loading-indicator">加载中...</span>}
      {children}
    </button>
  )
}))

// 通用按钮组件（基于Taro UI的AtButton）
const Button = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'primary',
  size = 'normal',
  className = '',
  ...props
}: any) => {
  const handleClick = async (event: React.MouseEvent) => {
    if (disabled || loading || !onClick) return
    
    try {
      await onClick(event)
    } catch (error) {
      console.error('Button click error:', error)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn btn--${type} btn--${size} ${className}`}
      data-testid="button"
      {...props}
    >
      {loading && <span className="btn__loading" data-testid="loading">加载中...</span>}
      <span className="btn__text">{children}</span>
    </button>
  )
}

describe('Button Component', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该正确渲染按钮文本', () => {
      render(<Button onClick={mockOnClick}>点击我</Button>)
      
      expect(screen.getByText('点击我')).toBeInTheDocument()
      expect(screen.getByTestId('button')).toBeInTheDocument()
    })

    it('应该应用正确的CSS类', () => {
      const { container } = render(
        <Button onClick={mockOnClick} type="secondary" size="small" className="custom-class">
          测试按钮
        </Button>
      )
      
      const button = screen.getByTestId('button')
      expect(button).toHaveClass('btn')
      expect(button).toHaveClass('btn--secondary')
      expect(button).toHaveClass('btn--small')
      expect(button).toHaveClass('custom-class')
    })

    it('应该传递额外的HTML属性', () => {
      render(
        <Button 
          onClick={mockOnClick}
          id="test-button"
          title="测试标题"
          data-test="custom-data"
        >
          测试按钮
        </Button>
      )
      
      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('id', 'test-button')
      expect(button).toHaveAttribute('title', '测试标题')
      expect(button).toHaveAttribute('data-test', 'custom-data')
    })
  })

  describe('点击事件', () => {
    it('应该处理点击事件', () => {
      render(<Button onClick={mockOnClick}>点击我</Button>)
      
      fireEvent.click(screen.getByTestId('button'))
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object)) // 事件对象
    })

    it('应该处理异步点击事件', async () => {
      const asyncOnClick = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      render(<Button onClick={asyncOnClick}>异步按钮</Button>)
      
      fireEvent.click(screen.getByTestId('button'))
      
      expect(asyncOnClick).toHaveBeenCalledTimes(1)
    })

    it('不应该在禁用状态下触发点击事件', () => {
      render(<Button onClick={mockOnClick} disabled>禁用按钮</Button>)
      
      fireEvent.click(screen.getByTestId('button'))
      
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('不应该在加载状态下触发点击事件', () => {
      render(<Button onClick={mockOnClick} loading>加载按钮</Button>)
      
      fireEvent.click(screen.getByTestId('button'))
      
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('应该处理点击事件中的错误', () => {
      const errorOnClick = jest.fn().mockImplementation(() => {
        throw new Error('点击错误')
      })
      
      // 模拟console.error以避免测试输出中的错误信息
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<Button onClick={errorOnClick}>错误按钮</Button>)
      
      // 不应该抛出错误到测试级别
      expect(() => {
        fireEvent.click(screen.getByTestId('button'))
      }).not.toThrow()
      
      expect(errorOnClick).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Button click error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('状态管理', () => {
    it('应该显示加载状态', () => {
      render(<Button onClick={mockOnClick} loading>加载按钮</Button>)
      
      const button = screen.getByTestId('button')
      expect(button).toBeDisabled()
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByTestId('loading')).toHaveTextContent('加载中...')
    })

    it('应该显示禁用状态', () => {
      render(<Button onClick={mockOnClick} disabled>禁用按钮</Button>)
      
      const button = screen.getByTestId('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('btn--disabled')
    })

    it('应该处理加载和禁用状态的组合', () => {
      render(
        <Button onClick={mockOnClick} loading disabled>
          加载禁用按钮
        </Button>
      )
      
      const button = screen.getByTestId('button')
      expect(button).toBeDisabled()
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })
  })

  describe('用户交互', () => {
    it('应该支持键盘交互', () => {
      render(<Button onClick={mockOnClick}>键盘按钮</Button>)
      
      const button = screen.getByTestId('button')
      
      // 测试回车键
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      
      // 测试空格键
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('应该支持用户事件库', async () => {
      const user = userEvent.setup()
      render(<Button onClick={mockOnClick}>用户事件按钮</Button>)
      
      await user.click(screen.getByTestId('button'))
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('应该支持双击事件', () => {
      const doubleClickHandler = jest.fn()
      render(
        <Button 
          onClick={mockOnClick}
          onDoubleClick={doubleClickHandler}
        >
          双击按钮
        </Button>
      )
      
      fireEvent.doubleClick(screen.getByTestId('button'))
      
      expect(doubleClickHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('可访问性', () => {
    it('应该支持ARIA属性', () => {
      render(
        <Button 
          onClick={mockOnClick}
          aria-label="自定义标签"
          aria-describedby="button-description"
          role="button"
        >
          可访问按钮
        </Button>
      )
      
      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('aria-label', '自定义标签')
      expect(button).toHaveAttribute('aria-describedby', 'button-description')
      expect(button).toHaveAttribute('role', 'button')
    })

    it('应该支持焦点管理', () => {
      render(<Button onClick={mockOnClick}>焦点按钮</Button>)
      
      const button = screen.getByTestId('button')
      
      // 检查按钮是否可以获取焦点
      button.focus()
      expect(button).toHaveFocus()
      
      // 检查按钮是否可以失去焦点
      button.blur()
      expect(button).not.toHaveFocus()
    })

    it('应该提供适当的屏幕阅读器支持', () => {
      render(
        <Button 
          onClick={mockOnClick}
          loading
          aria-busy="true"
          aria-live="polite"
        >
          加载按钮
        </Button>
      )
      
      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveAttribute('aria-live', 'polite')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('样式和主题', () => {
    it('应该支持不同类型的按钮', () => {
      const { rerender } = render(
        <Button onClick={mockOnClick} type="primary">主要按钮</Button>
      )
      
      let button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--primary')
      
      // 测试次要按钮
      rerender(<Button onClick={mockOnClick} type="secondary">次要按钮</Button>)
      button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--secondary')
      
      // 测试危险按钮
      rerender(<Button onClick={mockOnClick} type="danger">危险按钮</Button>)
      button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--danger')
    })

    it('应该支持不同尺寸的按钮', () => {
      const { rerender } = render(
        <Button onClick={mockOnClick} size="small">小按钮</Button>
      )
      
      let button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--small')
      
      // 测试中等按钮
      rerender(<Button onClick={mockOnClick} size="medium">中按钮</Button>)
      button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--medium')
      
      // 测试大按钮
      rerender(<Button onClick={mockOnClick} size="large">大按钮</Button>)
      button = screen.getByTestId('button')
      expect(button).toHaveClass('btn--large')
    })
  })

  describe('错误边界', () => {
    it('应该优雅处理渲染错误', () => {
      // 创建一个会抛出错误的按钮
      const ErrorButton = () => {
        throw new Error('渲染错误')
      }

      // 使用错误边界包装
      class ErrorBoundary extends React.Component {
        state = { hasError: false }
        
        static getDerivedStateFromError() {
          return { hasError: true }
        }
        
        render() {
          if (this.state.hasError) {
            return <div>发生错误</div>
          }
          return this.props.children
        }
      }

      render(
        <ErrorBoundary>
          <ErrorButton />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('发生错误')).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    it('应该避免不必要的重新渲染', () => {
      const renderCount = jest.fn()
      
      const TestButton = ({ onClick, children }: any) => {
        renderCount()
        return <Button onClick={onClick}>{children}</Button>
      }
      
      const { rerender } = render(
        <TestButton onClick={mockOnClick}>性能测试</TestButton>
      )
      
      const initialRenderCount = renderCount.mock.calls.length
      
      // 重新渲染，但props没有改变
      rerender(
        <TestButton onClick={mockOnClick}>性能测试</TestButton>
      )
      
      // 不应该有额外的渲染
      expect(renderCount.mock.calls.length).toBe(initialRenderCount)
    })
  })

  describe('与Taro UI集成', () => {
    it('应该正确使用Taro UI的AtButton', () => {
      const { AtButton } = require('taro-ui')
      
      render(
        <AtButton 
          onClick={mockOnClick}
          type="primary"
          size="normal"
          loading={false}
          disabled={false}
        >
          Taro按钮
        </AtButton>
      )
      
      const button = screen.getByTestId('at-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('at-button--primary')
      expect(button).toHaveClass('at-button--normal')
      expect(button).not.toBeDisabled()
    })

    it('应该处理Taro UI按钮的点击事件', () => {
      const { AtButton } = require('taro-ui')
      
      render(
        <AtButton onClick={mockOnClick}>Taro按钮</AtButton>
      )
      
      fireEvent.click(screen.getByTestId('at-button'))
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })
})