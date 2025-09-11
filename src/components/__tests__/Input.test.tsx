/**
 * Input组件测试
 * 测试输入框组件的各种状态和交互
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import Input from '../Input'

describe('Input组件', () => {
  describe('基本渲染', () => {
    it('应该正确渲染输入框', () => {
      render(<Input placeholder="请输入内容" />)
      expect(screen.getByPlaceholderText('请输入内容')).toBeInTheDocument()
    })

    it('应该渲染默认值', () => {
      render(<Input defaultValue="默认文本" />)
      expect(screen.getByDisplayValue('默认文本')).toBeInTheDocument()
    })

    it('应该渲染标签', () => {
      render(<Input label="用户名" />)
      expect(screen.getByText('用户名')).toBeInTheDocument()
    })

    it('应该渲染自定义类名', () => {
      render(<Input className="custom-input" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-input')
    })
  })

  describe('输入类型', () => {
    it('应该支持文本输入', () => {
      render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('应该支持密码输入', () => {
      render(<Input type="password" />)
      expect(screen.getByLabelText('密码输入')).toHaveAttribute('type', 'password')
    })

    it('应该支持数字输入', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('应该支持邮箱输入', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('应该支持电话输入', () => {
      render(<Input type="tel" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
    })
  })

  describe('输入状态', () => {
    it('应该支持禁用状态', () => {
      render(<Input disabled placeholder="禁用输入框" />)
      expect(screen.getByPlaceholderText('禁用输入框')).toBeDisabled()
    })

    it('应该支持只读状态', () => {
      render(<Input readOnly defaultValue="只读内容" />)
      const input = screen.getByDisplayValue('只读内容')
      expect(input).toHaveAttribute('readonly')
    })

    it('应该支持必填状态', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toHaveAttribute('required')
    })
  })

  describe('输入验证', () => {
    it('应该支持最大长度限制', () => {
      render(<Input maxLength={10} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10')
    })

    it('应该支持最小长度限制', () => {
      render(<Input minLength={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('minlength', '5')
    })

    it('应该支持模式验证', () => {
      render(<Input pattern="[0-9]{3}" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[0-9]{3}')
    })

    it('应该支持自定义验证', () => {
      const validate = jest.fn().mockReturnValue('输入格式错误')
      render(<Input validate={validate} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.blur(input)
      
      waitFor(() => {
        expect(screen.getByText('输入格式错误')).toBeInTheDocument()
      })
    })
  })

  describe('输入交互', () => {
    it('应该处理输入变化', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '新内容' } })
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('新内容')
    })

    it('应该处理输入聚焦', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)
      
      fireEvent.focus(screen.getByRole('textbox'))
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('应该处理输入失焦', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('应该处理键盘事件', () => {
      const handleKeyPress = jest.fn()
      const handleKeyDown = jest.fn()
      const handleKeyUp = jest.fn()
      
      render(
        <Input 
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      )
      
      const input = screen.getByRole('textbox')
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      fireEvent.keyUp(input, { key: 'Enter', code: 'Enter' })
      
      expect(handleKeyPress).toHaveBeenCalledTimes(1)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('清除功能', () => {
    it('应该显示清除按钮当输入有值时', () => {
      render(<Input defaultValue="有内容" clearable />)
      
      expect(screen.getByTestId('clear-button')).toBeInTheDocument()
    })

    it('应该隐藏清除按钮当输入为空时', () => {
      render(<Input clearable />)
      
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
    })

    it('应该处理清除按钮点击', () => {
      const handleClear = jest.fn()
      const handleChange = jest.fn()
      
      render(
        <Input 
          defaultValue="有内容" 
          clearable 
          onClear={handleClear}
          onChange={handleChange}
        />
      )
      
      fireEvent.click(screen.getByTestId('clear-button'))
      
      expect(handleClear).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('')
      expect(screen.queryByDisplayValue('有内容')).not.toBeInTheDocument()
    })
  })

  describe('密码可见性切换', () => {
    it('应该显示密码可见性切换按钮', () => {
      render(<Input type="password" defaultValue="password123" password />)
      
      expect(screen.getByTestId('password-toggle')).toBeInTheDocument()
    })

    it('应该切换密码可见性', () => {
      render(<Input type="password" defaultValue="password123" password />)
      
      const input = screen.getByLabelText('密码输入')
      const toggleButton = screen.getByTestId('password-toggle')
      
      expect(input).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('错误状态', () => {
    it('应该显示错误信息', () => {
      render(<Input error="输入错误" />)
      
      expect(screen.getByText('输入错误')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveClass('at-input--error')
    })

    it('应该显示错误图标', () => {
      render(<Input error="输入错误" errorIcon />)
      
      expect(screen.getByTestId('error-icon')).toBeInTheDocument()
    })
  })

  describe('前缀和后缀', () => {
    it('应该显示前缀内容', () => {
      render(<Input prefix="¥" />)
      
      expect(screen.getByText('¥')).toBeInTheDocument()
    })

    it('应该显示后缀内容', () => {
      render(<Input suffix="元" />)
      
      expect(screen.getByText('元')).toBeInTheDocument()
    })

    it('应该显示自定义前缀图标', () => {
      render(<Input prefixIcon="user" />)
      
      expect(screen.getByTestId('prefix-icon')).toBeInTheDocument()
    })

    it('应该显示自定义后缀图标', () => {
      render(<Input suffixIcon="eye" />)
      
      expect(screen.getByTestId('suffix-icon')).toBeInTheDocument()
    })
  })

  describe('计数器', () => {
    it('应该显示字符计数器', () => {
      render(<Input defaultValue="测试文本" showCount maxLength={20} />)
      
      expect(screen.getByText('4/20')).toBeInTheDocument()
    })

    it('应该更新字符计数器', () => {
      render(<Input showCount maxLength={20} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '新文本' } })
      
      expect(screen.getByText('3/20')).toBeInTheDocument()
    })
  })

  describe('自动调整高度', () => {
    it('应该支持自动调整高度', () => {
      render(<Input type="textarea" autoHeight />)
      
      expect(screen.getByRole('textbox')).toHaveClass('at-textarea--auto-height')
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的输入框角色', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('应该支持aria-label属性', () => {
      render(<Input aria-label="用户名输入框" />)
      expect(screen.getByLabelText('用户名输入框')).toBeInTheDocument()
    })

    it('应该支持aria-describedby属性', () => {
      render(
        <>
          <Input aria-describedby="input-help" />
          <span id="input-help">请输入您的用户名</span>
        </>
      )
      
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'input-help')
    })

    it('应该支持aria-invalid属性', () => {
      render(<Input error="输入错误" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('标签应该正确关联到输入框', () => {
      render(<Input label="用户名" id="username" />)
      
      const input = screen.getByRole('textbox')
      const label = screen.getByText('用户名')
      
      expect(input).toHaveAttribute('id', 'username')
      expect(label).toHaveAttribute('for', 'username')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量输入框', () => {
      const startTime = performance.now()
      
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Input key={i} placeholder={`输入框 ${i}`} />
          ))}
        </>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // 1秒内渲染100个输入框
      
      expect(screen.getAllByRole('textbox')).toHaveLength(100)
    })
  })
})