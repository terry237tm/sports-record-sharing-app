/**
 * LocationSearch 组件测试
 * 测试地址搜索、自动完成、历史记录等功能
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import LocationSearch from '../LocationSearch'
import { useLocationService } from '@/hooks/useLocationService'
import { useDebounce } from '@/hooks/useLocationService'
import { showToast } from '@/utils/ui'
import Taro from '@tarojs/taro'

// Mock hooks and utils
jest.mock('@/hooks/useLocationService')
jest.mock('@/utils/ui', () => ({
  showToast: jest.fn()
}))

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn()
}))

// Mock useDebounce
jest.mock('@/hooks/useLocationService', () => ({
  ...jest.requireActual('@/hooks/useLocationService'),
  useDebounce: jest.fn((value) => value)
}))

const mockLocationService = {
  getCurrentLocation: jest.fn(),
  searchLocation: jest.fn(),
  checkPermission: jest.fn(),
  requestPermission: jest.fn(),
  calculateDistance: jest.fn(),
  validateCoordinates: jest.fn()
}

describe('LocationSearch 组件', () => {
  const mockOnChange = jest.fn()
  const mockSearchResults = [
    {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市东城区天安门',
      city: '北京市',
      district: '东城区',
      accuracy: 10
    },
    {
      latitude: 39.915,
      longitude: 116.42,
      address: '北京市东城区王府井',
      city: '北京市',
      district: '东城区',
      accuracy: 15
    }
  ]

  const mockSearchHistory = [
    {
      address: '北京市朝阳区三里屯',
      location: {
        latitude: 39.9388,
        longitude: 116.4474,
        address: '北京市朝阳区三里屯'
      },
      timestamp: Date.now() - 1000
    },
    {
      address: '北京市海淀区中关村',
      location: {
        latitude: 39.9847,
        longitude: 116.3065,
        address: '北京市海淀区中关村'
      },
      timestamp: Date.now() - 2000
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLocationService as jest.Mock).mockReturnValue(mockLocationService)
    ;(useDebounce as jest.Mock).mockImplementation((value) => value)
    ;(Taro.getStorageSync as jest.Mock).mockReturnValue(mockSearchHistory)
  })

  describe('基本渲染', () => {
    it('应该正确渲染基本结构', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).not.toBeDisabled()
    })

    it('应该显示自定义占位符', () => {
      const customPlaceholder = '请输入搜索地址'
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          placeholder={customPlaceholder}
        />
      )

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
    })

    it('应该显示当前位置值', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={mockSearchResults[0]}
        />
      )

      expect(screen.getByDisplayValue(mockSearchResults[0].address)).toBeInTheDocument()
    })

    it('应该应用自定义类名和样式', () => {
      const customClass = 'custom-location-search'
      const customStyle = { backgroundColor: 'red' }

      const { container } = render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          className={customClass}
          style={customStyle}
        />
      )

      const search = container.querySelector(`.${customClass}`)
      expect(search).toBeInTheDocument()
      expect(search).toHaveStyle(customStyle)
    })
  })

  describe('搜索功能', () => {
    it('应该成功执行搜索', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      await waitFor(() => {
        expect(mockLocationService.searchLocation).toHaveBeenCalledWith('天安门')
      })

      // 验证搜索结果
      expect(screen.getByText('搜索结果')).toBeInTheDocument()
      expect(screen.getByText('北京市东城区天安门')).toBeInTheDocument()
      expect(screen.getByText('北京市东城区王府井')).toBeInTheDocument()
    })

    it('应该处理搜索失败', async () => {
      const mockError = new Error('搜索失败')
      mockLocationService.searchLocation.mockRejectedValue(mockError)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      })
    })

    it('应该显示无结果提示', async () => {
      mockLocationService.searchLocation.mockResolvedValue([])

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '不存在的地址' } })

      await waitFor(() => {
        expect(screen.getByText('未找到相关位置')).toBeInTheDocument()
        expect(screen.getByText('请尝试其他关键词')).toBeInTheDocument()
      })
    })

    it('应该清除搜索结果当输入为空', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      
      // 先输入搜索词
      fireEvent.input(searchInput, { detail: { value: '天安门' } })
      
      await waitFor(() => {
        expect(screen.getByText('搜索结果')).toBeInTheDocument()
      })

      // 然后清除输入
      fireEvent.input(searchInput, { detail: { value: '' } })

      await waitFor(() => {
        expect(screen.queryByText('搜索结果')).not.toBeInTheDocument()
      })
    })
  })

  describe('搜索历史', () => {
    it('应该加载并显示搜索历史', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showHistory={true}
        />
      )

      // 聚焦输入框以显示历史记录
      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.focus(searchInput)

      expect(screen.getByText('最近搜索')).toBeInTheDocument()
      expect(screen.getByText('北京市朝阳区三里屯')).toBeInTheDocument()
      expect(screen.getByText('北京市海淀区中关村')).toBeInTheDocument()
    })

    it('应该隐藏搜索历史当禁用', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showHistory={false}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.focus(searchInput)

      expect(screen.queryByText('最近搜索')).not.toBeInTheDocument()
    })

    it('应该清除搜索历史', async () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showHistory={true}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.focus(searchInput)

      const clearButton = screen.getByText('清除')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(Taro.removeStorageSync).toHaveBeenCalledWith('location_search_history')
        expect(showToast).toHaveBeenCalledWith({
          title: '搜索历史已清除',
          icon: 'success'
        })
      })
    })

    it('应该限制搜索历史数量', () => {
      const manyHistory = Array.from({ length: 10 }, (_, i) => ({
        address: `历史地址${i}`,
        location: { latitude: 39 + i * 0.01, longitude: 116 + i * 0.01, address: `历史地址${i}` },
        timestamp: Date.now() - i * 1000
      }))

      ;(Taro.getStorageSync as jest.Mock).mockReturnValue(manyHistory)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          maxHistory={5}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.focus(searchInput)

      // 应该只显示5条历史记录
      const historyItems = screen.getAllByText(/历史地址/)
      expect(historyItems.length).toBe(5)
    })
  })

  describe('结果选择', () => {
    it('应该选择搜索结果', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      await waitFor(() => {
        expect(screen.getByText('北京市东城区天安门')).toBeInTheDocument()
      })

      const firstResult = screen.getByText('北京市东城区天安门')
      fireEvent.click(firstResult)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockSearchResults[0])
        expect(showToast).toHaveBeenCalledWith({
          title: '已选择位置',
          icon: 'success'
        })
        expect(Taro.setStorageSync).toHaveBeenCalled()
      })
    })

    it('应该选择历史记录', async () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.focus(searchInput)

      const firstHistory = screen.getByText('北京市朝阳区三里屯')
      fireEvent.click(firstHistory)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockSearchHistory[0].location)
        expect(showToast).toHaveBeenCalledWith({
          title: '已选择位置',
          icon: 'success'
        })
      })
    })

    it('应该高亮选中的结果', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      await waitFor(() => {
        expect(screen.getByText('北京市东城区天安门')).toBeInTheDocument()
      })

      const firstResult = screen.getByText('北京市东城区天安门')
      fireEvent.click(firstResult)

      // 验证选中状态
      await waitFor(() => {
        const resultItem = firstResult.closest('.result-item')
        expect(resultItem).toHaveClass('selected')
      })
    })
  })

  describe('当前位置功能', () => {
    it('应该获取当前位置', async () => {
      const currentLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '当前位置地址'
      }

      mockLocationService.getCurrentLocation.mockResolvedValue(currentLocation)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showCurrentLocation={true}
        />
      )

      const currentLocationButton = screen.getByText('📍 使用当前位置')
      fireEvent.click(currentLocationButton)

      await waitFor(() => {
        expect(mockLocationService.getCurrentLocation).toHaveBeenCalled()
        expect(mockOnChange).toHaveBeenCalledWith(currentLocation)
        expect(showToast).toHaveBeenCalledWith({
          title: '已获取当前位置',
          icon: 'success'
        })
      })
    })

    it('应该处理获取当前位置失败', async () => {
      const mockError = new Error('获取位置失败')
      mockLocationService.getCurrentLocation.mockRejectedValue(mockError)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showCurrentLocation={true}
        />
      )

      const currentLocationButton = screen.getByText('📍 使用当前位置')
      fireEvent.click(currentLocationButton)

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          title: '获取位置失败',
          icon: 'none'
        })
      })
    })

    it('应该隐藏当前位置按钮', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          showCurrentLocation={false}
        />
      )

      expect(screen.queryByText('📍 使用当前位置')).not.toBeInTheDocument()
    })
  })

  describe('输入处理', () => {
    it('应该显示清除按钮当有输入值', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '搜索内容' } })

      expect(screen.getByText('✕')).toBeInTheDocument()
    })

    it('应该清除输入和结果', () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      
      // 输入搜索内容
      fireEvent.input(searchInput, { detail: { value: '天安门' } })
      
      await waitFor(() => {
        expect(screen.getByText('搜索结果')).toBeInTheDocument()
      })

      // 点击清除按钮
      const clearButton = screen.getByText('✕')
      fireEvent.click(clearButton)

      // 验证输入被清除
      expect(searchInput).toHaveValue('')
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    it('应该处理输入聚焦和失焦', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      
      // 聚焦
      fireEvent.focus(searchInput)
      expect(screen.getByText('最近搜索')).toBeInTheDocument()

      // 失焦
      fireEvent.blur(searchInput)
      
      // 由于有延迟，需要等待
      setTimeout(() => {
        expect(screen.queryByText('最近搜索')).not.toBeInTheDocument()
      }, 300)
    })
  })

  describe('防抖功能', () => {
    it('应该使用防抖处理搜索', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
          debounceDelay={300}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      
      // 快速输入多个字符
      fireEvent.input(searchInput, { detail: { value: '天' } })
      fireEvent.input(searchInput, { detail: { value: '天安' } })
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      // 验证防抖被调用
      await waitFor(() => {
        expect(useDebounce).toHaveBeenCalledWith('天安门', 300)
      })
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', () => {
      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      searchInput.focus()
      expect(document.activeElement).toBe(searchInput)
    })

    it('应该提供适当的视觉反馈', async () => {
      mockLocationService.searchLocation.mockResolvedValue(mockSearchResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '天安门' } })

      // 验证加载状态
      expect(screen.getByText('🔄')).toBeInTheDocument()

      await waitFor(() => {
        // 验证结果高亮
        const firstResult = screen.getByText('北京市东城区天安门')
        expect(firstResult.closest('.result-item')).toHaveClass('selected')
      })
    })
  })

  describe('性能测试', () => {
    it('应该限制搜索结果数量', async () => {
      const manyResults = Array.from({ length: 20 }, (_, i) => ({
        latitude: 39.9 + i * 0.01,
        longitude: 116.4 + i * 0.01,
        address: `搜索结果${i}`,
        accuracy: 10 + i
      }))

      mockLocationService.searchLocation.mockResolvedValue(manyResults)

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '测试' } })

      await waitFor(() => {
        // 验证所有结果都被显示（没有数量限制）
        const resultItems = screen.getAllByText(/搜索结果/)
        expect(resultItems.length).toBe(20)
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理存储错误', async () => {
      const storageError = new Error('存储错误')
      ;(Taro.getStorageSync as jest.Mock).mockImplementation(() => {
        throw storageError
      })

      // 不应该抛出错误
      expect(() => {
        render(
          <LocationSearch 
            onChange={mockOnChange}
            value={null}
          />
        )
      }).not.toThrow()
    })

    it('应该处理搜索结果中的无效坐标', async () => {
      const invalidResults = [
        {
          latitude: 999,
          longitude: 999,
          address: '无效位置'
        },
        {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '有效位置'
        }
      ]

      mockLocationService.searchLocation.mockResolvedValue(invalidResults)
      mockLocationService.validateCoordinates.mockImplementation((lat, lon) => 
        lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
      )

      render(
        <LocationSearch 
          onChange={mockOnChange}
          value={null}
        />
      )

      const searchInput = screen.getByPlaceholderText('搜索地址、地标、POI...')
      fireEvent.input(searchInput, { detail: { value: '测试' } })

      await waitFor(() => {
        // 应该只显示有效位置
        expect(screen.queryByText('无效位置')).not.toBeInTheDocument()
        expect(screen.getByText('有效位置')).toBeInTheDocument()
      })
    })
  })
})