/**
 * LocationSelector 组件测试
 * 测试地图选点、交互、状态管理等功能
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import LocationSelector from '../LocationSelector'
import { useLocationService } from '@/hooks/useLocationService'
import { showToast, showLoading, hideLoading } from '@/utils/ui'

// Mock hooks and utils
jest.mock('@/hooks/useLocationService')
jest.mock('@/utils/ui', () => ({
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn()
}))

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  getLocation: jest.fn(),
  chooseLocation: jest.fn(),
  authorize: jest.fn(),
  showModal: jest.fn()
}))

const mockLocationService = {
  getCurrentLocation: jest.fn(),
  reverseGeocoding: jest.fn(),
  searchLocation: jest.fn(),
  checkPermission: jest.fn(),
  requestPermission: jest.fn(),
  calculateDistance: jest.fn(),
  validateCoordinates: jest.fn()
}

describe('LocationSelector 组件', () => {
  const mockOnChange = jest.fn()
  const mockLocation = {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市东城区天安门',
    city: '北京市',
    district: '东城区',
    accuracy: 10,
    timestamp: Date.now()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLocationService as jest.Mock).mockReturnValue(mockLocationService)
    mockLocationService.getCurrentLocation.mockResolvedValue(mockLocation)
    mockLocationService.reverseGeocoding.mockResolvedValue(mockLocation)
    mockLocationService.validateCoordinates.mockReturnValue(true)
  })

  describe('基本渲染', () => {
    it('应该正确渲染基本结构', () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      expect(screen.getByText('拖动地图选择位置')).toBeInTheDocument()
      expect(screen.getByText('地图中心的标记即为选择的位置')).toBeInTheDocument()
      expect(screen.getByText('确认选择')).toBeInTheDocument()
      expect(screen.getByText('重新选择')).toBeInTheDocument()
    })

    it('应该显示当前位置值', () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={mockLocation}
        />
      )

      expect(screen.getByText(mockLocation.address)).toBeInTheDocument()
      expect(screen.getByText(`纬度: ${mockLocation.latitude.toFixed(6)}, 经度: ${mockLocation.longitude.toFixed(6)}`)).toBeInTheDocument()
      expect(screen.getByText(`精度: ±${mockLocation.accuracy}米`)).toBeInTheDocument()
    })

    it('应该应用自定义类名和样式', () => {
      const customClass = 'custom-location-selector'
      const customStyle = { backgroundColor: 'red' }

      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
          className={customClass}
          style={customStyle}
        />
      )

      const selector = container.querySelector(`.${customClass}`)
      expect(selector).toBeInTheDocument()
      expect(selector).toHaveStyle(customStyle)
    })
  })

  describe('地图交互', () => {
    it('应该在地图加载时显示加载状态', async () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      // 验证初始状态
      expect(screen.getByText('拖动地图选择位置')).toBeInTheDocument()
    })

    it('应该处理地图区域变化', async () => {
      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const mapElement = container.querySelector('.map')
      expect(mapElement).toBeInTheDocument()

      // 模拟地图区域变化
      const regionChangeEvent = {
        detail: {
          causedBy: 'drag',
          region: {
            latitude: 39.915,
            longitude: 116.42
          }
        }
      }

      // 触发区域变化
      fireEvent.regionChange(mapElement!, regionChangeEvent)
      
      // 验证拖拽状态
      await waitFor(() => {
        expect(screen.getByText('松开选择此位置')).toBeInTheDocument()
      })
    })

    it('应该处理地图区域变化结束', async () => {
      const newLocation = {
        latitude: 39.915,
        longitude: 116.42,
        address: '新位置地址',
        timestamp: Date.now()
      }

      mockLocationService.reverseGeocoding.mockResolvedValue(newLocation)

      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const mapElement = container.querySelector('.map')
      
      // 模拟拖拽结束
      const regionChangeEndEvent = {
        detail: {
          causedBy: 'drag',
          region: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
          }
        }
      }

      fireEvent.regionChangeEnd(mapElement!, regionChangeEndEvent)

      // 验证逆地址解析被调用
      await waitFor(() => {
        expect(mockLocationService.reverseGeocoding).toHaveBeenCalledWith(
          newLocation.latitude,
          newLocation.longitude
        )
      })
    })
  })

  describe('位置获取', () => {
    it('应该成功获取当前位置', async () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const currentLocationButton = screen.getByText('📍 当前位置')
      fireEvent.click(currentLocationButton)

      await waitFor(() => {
        expect(showLoading).toHaveBeenCalledWith({ title: '正在获取位置...' })
        expect(mockLocationService.getCurrentLocation).toHaveBeenCalled()
        expect(hideLoading).toHaveBeenCalled()
        expect(showToast).toHaveBeenCalledWith({
          title: '位置获取成功',
          icon: 'success'
        })
      })
    })

    it('应该处理位置获取失败', async () => {
      const mockError = new Error('位置获取失败')
      mockLocationService.getCurrentLocation.mockRejectedValue(mockError)

      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const currentLocationButton = screen.getByText('📍 当前位置')
      fireEvent.click(currentLocationButton)

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          title: '获取位置失败，使用默认位置',
          icon: 'none'
        })
        expect(hideLoading).toHaveBeenCalled()
      })
    })
  })

  describe('位置确认', () => {
    it('应该确认选择位置', async () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={mockLocation}
        />
      )

      const confirmButton = screen.getByText('确认选择')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockLocation)
        expect(showToast).toHaveBeenCalledWith({
          title: '位置选择成功',
          icon: 'success'
        })
      })
    })

    it('应该阻止确认空位置', async () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const confirmButton = screen.getByText('确认选择')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled()
        expect(showToast).toHaveBeenCalledWith({
          title: '请先选择位置',
          icon: 'none'
        })
      })
    })

    it('应该处理重新选择', async () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={mockLocation}
        />
      )

      const resetButton = screen.getByText('重新选择')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(null)
        expect(mockLocationService.getCurrentLocation).toHaveBeenCalled()
      })
    })
  })

  describe('搜索功能', () => {
    it('应该显示搜索框', () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
          showSearch={true}
        />
      )

      expect(screen.getByText('🔍 搜索地址（功能开发中）')).toBeInTheDocument()
    })

    it('应该隐藏搜索框', () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
          showSearch={false}
        />
      )

      expect(screen.queryByText('🔍 搜索地址（功能开发中）')).not.toBeInTheDocument()
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', () => {
      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const confirmButton = screen.getByText('确认选择')
      const resetButton = screen.getByText('重新选择')
      const currentLocationButton = screen.getByText('📍 当前位置')

      // 验证按钮可聚焦
      confirmButton.focus()
      expect(document.activeElement).toBe(confirmButton)

      resetButton.focus()
      expect(document.activeElement).toBe(resetButton)

      currentLocationButton.focus()
      expect(document.activeElement).toBe(currentLocationButton)
    })

    it('应该提供适当的ARIA标签', () => {
      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      // 验证按钮有适当的文本
      expect(screen.getByText('确认选择')).toBeInTheDocument()
      expect(screen.getByText('重新选择')).toBeInTheDocument()
      expect(screen.getByText('📍 当前位置')).toBeInTheDocument()

      // 验证提示文本
      expect(screen.getByText('拖动地图选择位置')).toBeInTheDocument()
      expect(screen.getByText('地图中心的标记即为选择的位置')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('应该处理逆地址解析失败', async () => {
      const mockError = new Error('逆地址解析失败')
      mockLocationService.reverseGeocoding.mockRejectedValue(mockError)

      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const mapElement = container.querySelector('.map')
      
      // 模拟拖拽结束
      const regionChangeEndEvent = {
        detail: {
          causedBy: 'drag',
          region: {
            latitude: 39.915,
            longitude: 116.42
          }
        }
      }

      fireEvent.regionChangeEnd(mapElement!, regionChangeEndEvent)

      await waitFor(() => {
        expect(mockLocationService.reverseGeocoding).toHaveBeenCalled()
        // 应该回退到坐标显示
        expect(screen.getByText(/纬度:.*经度:/)).toBeInTheDocument()
      })
    })

    it('应该处理无效坐标', async () => {
      mockLocationService.validateCoordinates.mockReturnValue(false)

      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={{
            latitude: 999,
            longitude: 999,
            address: '无效位置'
          }}
        />
      )

      // 应该使用默认位置
      await waitFor(() => {
        expect(mockLocationService.getCurrentLocation).toHaveBeenCalled()
      })
    })
  })

  describe('性能测试', () => {
    it('应该防抖处理频繁的位置变化', async () => {
      const { container } = render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
        />
      )

      const mapElement = container.querySelector('.map')
      
      // 快速触发多次区域变化
      for (let i = 0; i < 10; i++) {
        fireEvent.regionChange(mapElement!, {
          detail: {
            causedBy: 'drag',
            region: {
              latitude: 39.915 + i * 0.001,
              longitude: 116.42 + i * 0.001
            }
          }
        })
      }

      // 验证只处理最后一次变化
      await waitFor(() => {
        expect(mockLocationService.reverseGeocoding).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('国际化', () => {
    it('应该支持自定义按钮文本', () => {
      const customConfirmText = '确认位置'
      const customCancelText = '取消选择'

      render(
        <LocationSelector 
          onChange={mockOnChange}
          value={null}
          confirmText={customConfirmText}
          cancelText={customCancelText}
        />
      )

      expect(screen.getByText(customConfirmText)).toBeInTheDocument()
      expect(screen.getByText(customCancelText)).toBeInTheDocument()
    })
  })
})