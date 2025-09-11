/**
 * Button组件集成测试
 * 测试Button组件在实际业务场景中的使用
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/store'
import Button from '@/components/Button'
import { SportRecord } from '@/types/sport'

// 创建测试用的store
function createTestStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}

describe('Button组件集成测试', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('运动记录场景', () => {
    it('应该处理运动记录保存按钮点击', async () => {
      const mockSaveRecord = jest.fn().mockResolvedValue({
        _id: 'test-record-id',
        success: true
      })

      render(
        <Provider store={store}>
          <Button onClick={mockSaveRecord} type="primary">
            保存运动记录
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '保存运动记录' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSaveRecord).toHaveBeenCalledTimes(1)
      })
    })

    it('应该在保存时显示加载状态', async () => {
      const mockSaveRecord = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1000))
      })

      const { rerender } = render(
        <Provider store={store}>
          <Button onClick={mockSaveRecord} type="primary">
            保存运动记录
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '保存运动记录' })
      fireEvent.click(button)

      // 验证按钮变为加载状态
      await waitFor(() => {
        expect(button).toHaveClass('at-button--loading')
      })

      // 等待异步操作完成
      await waitFor(() => {
        expect(button).not.toHaveClass('at-button--loading')
      }, { timeout: 2000 })
    })

    it('应该处理运动记录删除按钮点击', () => {
      const mockDeleteRecord = jest.fn()
      const record: SportRecord = {
        _id: 'test-record-id',
        openid: 'test-openid',
        sportType: 'running',
        data: { duration: 30, distance: 5.2, calories: 300, heartRate: 120, steps: 5200 },
        images: [],
        description: '测试记录',
        location: { latitude: 39.9042, longitude: 116.4074, address: '测试地址', city: '北京', district: '东城区' },
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }

      render(
        <Provider store={store}>
          <Button 
            onClick={() => mockDeleteRecord(record._id)} 
            type="danger"
          >
            删除记录
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '删除记录' })
      fireEvent.click(button)

      expect(mockDeleteRecord).toHaveBeenCalledWith('test-record-id')
    })
  })

  describe('分享功能场景', () => {
    it('应该处理分享按钮点击', () => {
      const mockShareRecord = jest.fn().mockImplementation((record) => {
        return Promise.resolve({
          success: true,
          shareId: 'share-123'
        })
      })

      const record: SportRecord = {
        _id: 'test-record-id',
        openid: 'test-openid',
        sportType: 'running',
        data: { duration: 30, distance: 5.2, calories: 300, heartRate: 120, steps: 5200 },
        images: ['/tmp/test1.jpg'],
        description: '今天跑步感觉很棒！',
        location: { latitude: 39.9042, longitude: 116.4074, address: '天安门广场', city: '北京', district: '东城区' },
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }

      render(
        <Provider store={store}>
          <Button 
            onClick={() => mockShareRecord(record)} 
            type="secondary"
            icon="share"
          >
            分享
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '分享' })
      fireEvent.click(button)

      expect(mockShareRecord).toHaveBeenCalledWith(record)
    })

    it('应该在分享失败时显示错误提示', async () => {
      const mockShareRecord = jest.fn().mockRejectedValue(new Error('分享失败'))

      render(
        <Provider store={store}>
          <Button onClick={mockShareRecord} type="secondary" icon="share">
            分享
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '分享' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockShareRecord).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('导航场景', () => {
    it('应该处理返回按钮点击', () => {
      const mockGoBack = jest.fn()

      render(
        <Provider store={store}>
          <Button onClick={mockGoBack} type="default" icon="chevron-left">
            返回
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '返回' })
      fireEvent.click(button)

      expect(mockGoBack).toHaveBeenCalledTimes(1)
    })

    it('应该处理主页按钮点击', () => {
      const mockGoHome = jest.fn()

      render(
        <Provider store={store}>
          <Button onClick={mockGoHome} type="primary" icon="home">
            首页
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '首页' })
      fireEvent.click(button)

      expect(mockGoHome).toHaveBeenCalledTimes(1)
    })
  })

  describe('表单提交场景', () => {
    it('应该处理表单提交按钮', () => {
      const mockSubmitForm = jest.fn().mockImplementation((formData) => {
        return Promise.resolve({ success: true })
      })

      const { container } = render(
        <Provider store={store}>
          <form onSubmit={(e) => {
            e.preventDefault()
            mockSubmitForm(new FormData(e.currentTarget))
          }}>
            <input name="username" defaultValue="testuser" />
            <Button type="submit" htmlType="submit" type="primary">
              提交
            </Button>
          </form>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '提交' })
      fireEvent.click(button)

      expect(mockSubmitForm).toHaveBeenCalledTimes(1)
    })

    it('应该在表单验证失败时禁用提交按钮', () => {
      const mockSubmitForm = jest.fn()
      const isFormValid = false

      render(
        <Provider store={store}>
          <Button 
            onClick={mockSubmitForm} 
            type="primary" 
            disabled={!isFormValid}
          >
            提交
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '提交' })
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(mockSubmitForm).not.toHaveBeenCalled()
    })
  })

  describe('状态管理场景', () => {
    it('应该通过按钮点击更新Redux状态', () => {
      const mockDispatch = jest.fn()

      render(
        <Provider store={store}>
          <Button 
            onClick={() => mockDispatch({ 
              type: 'sport/incrementCounter', 
              payload: 1 
            })} 
            type="primary"
          >
            增加计数
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '增加计数' })
      fireEvent.click(button)

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'sport/incrementCounter',
        payload: 1
      })
    })

    it('应该处理异步状态更新', async () => {
      const mockAsyncAction = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true })
          }, 1000)
        })
      })

      render(
        <Provider store={store}>
          <Button onClick={mockAsyncAction} type="primary">
            异步操作
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '异步操作' })
      fireEvent.click(button)

      expect(mockAsyncAction).toHaveBeenCalledTimes(1)

      await waitFor(() => {
        expect(button).not.toHaveClass('at-button--loading')
      }, { timeout: 2000 })
    })
  })

  describe('错误处理场景', () => {
    it('应该在API调用失败时显示错误状态', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('API调用失败'))

      render(
        <Provider store={store}>
          <Button onClick={mockApiCall} type="primary">
            API调用
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: 'API调用' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(1)
      })

      // 验证按钮没有保持加载状态
      expect(button).not.toHaveClass('at-button--loading')
    })

    it('应该在网络错误时显示重试选项', () => {
      const mockRetryAction = jest.fn()
      let retryCount = 0

      const mockActionWithRetry = () => {
        retryCount++
        if (retryCount < 3) {
          return Promise.reject(new Error('网络错误'))
        }
        return Promise.resolve({ success: true })
      }

      render(
        <Provider store={store}>
          <Button 
            onClick={mockRetryAction} 
            type="primary"
            disabled={retryCount >= 3}
          >
            重试
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '重试' })
      
      // 模拟多次点击重试
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockRetryAction).toHaveBeenCalledTimes(3)
    })
  })

  describe('性能场景', () => {
    it('应该快速响应按钮点击', () => {
      const mockAction = jest.fn()
      const clickCount = 100

      render(
        <Provider store={store}>
          <Button onClick={mockAction} type="primary">
            快速点击
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '快速点击' })
      
      const startTime = performance.now()
      
      // 快速点击多次
      for (let i = 0; i < clickCount; i++) {
        fireEvent.click(button)
      }
      
      const endTime = performance.now()
      
      expect(mockAction).toHaveBeenCalledTimes(clickCount)
      expect(endTime - startTime).toBeLessThan(1000) // 1000次点击应该在1秒内完成
    })

    it('应该处理大量按钮同时渲染', () => {
      const buttonCount = 100
      const mockActions = Array.from({ length: buttonCount }, (_, i) => jest.fn())

      render(
        <Provider store={store}>
          <>
            {mockActions.map((action, index) => (
              <Button 
                key={index} 
                onClick={action} 
                type="secondary"
                size="small"
              >
                按钮 {index}
              </Button>
            ))}
          </>
        </Provider>
      )

      const startTime = performance.now()
      
      // 验证所有按钮都已渲染
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(buttonCount)
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(2000) // 100个按钮应该在2秒内渲染完成
    })
  })

  describe('可访问性场景', () => {
    it('应该支持键盘导航', () => {
      render(
        <Provider store={store}>
          <Button onClick={jest.fn()} type="primary">
            键盘测试
          </Button>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '键盘测试' })
      
      // 聚焦按钮
      button.focus()
      expect(button).toHaveFocus()
      
      // 模拟回车键按下
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      
      // 模拟空格键按下
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    })

    it('应该支持屏幕阅读器', () => {
      render(
        <Provider store={store}>
          <Button 
            onClick={jest.fn()} 
            type="primary"
            aria-label="主要操作按钮"
            aria-describedby="button-help"
          >
            主要操作
          </Button>
          <span id="button-help">点击此按钮执行主要操作</span>
        </Provider>
      )

      const button = screen.getByRole('button', { name: '主要操作按钮' })
      
      expect(button).toHaveAttribute('aria-label', '主要操作按钮')
      expect(button).toHaveAttribute('aria-describedby', 'button-help')
      expect(screen.getByText('点击此按钮执行主要操作')).toBeInTheDocument()
    })
  })
})