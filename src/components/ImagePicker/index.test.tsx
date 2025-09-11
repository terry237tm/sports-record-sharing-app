/**
 * ImagePicker 组件测试
 * 测试图片选择器组件的各项功能
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import ImagePicker from './index'
import useImagePicker from '@/hooks/useImagePicker'
import { ImageItem } from '@/hooks/useImagePicker'

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  showModal: jest.fn((options) => {
    // 默认确认删除
    setTimeout(() => options.success?.({ confirm: true }), 0)
  }),
  previewImage: jest.fn(),
  chooseImage: jest.fn(),
  getFileInfo: jest.fn(),
  getImageInfo: jest.fn(),
  canvasToTempFilePath: jest.fn(),
  createSelectorQuery: jest.fn(() => ({
    select: jest.fn(() => ({
      fields: jest.fn((options, callback) => {
        setTimeout(() => callback([{ node: { width: 100, height: 100, getContext: jest.fn() } }]), 0)
      })
    }))
  })),
  getFileSystemManager: jest.fn(() => ({
    readFile: jest.fn()
  }))
}))

// Mock UI工具
jest.mock('@/utils/ui', () => ({
  showToast: jest.fn()
}))

// Mock Hook
jest.mock('@/hooks/useImagePicker')

describe('ImagePicker Component', () => {
  const mockImages: ImageItem[] = [
    {
      id: '1',
      url: 'blob:http://localhost/test1',
      status: 'compressed',
      originalSize: 1024 * 1024,
      compressedSize: 512 * 1024
    },
    {
      id: '2', 
      url: 'blob:http://localhost/test2',
      status: 'pending',
      originalSize: 2048 * 1024
    }
  ]

  const mockUseImagePicker = {
    images: mockImages,
    isLoading: false,
    selectImages: jest.fn(),
    removeImage: jest.fn(),
    compressImages: jest.fn(),
    clearImages: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      render(<ImagePicker />)
      
      expect(screen.getByText('运动照片')).toBeInTheDocument()
      expect(screen.getByText('2/9')).toBeInTheDocument()
      expect(screen.getByText('上传照片')).toBeInTheDocument()
    })

    it('应该显示自定义标题', () => {
      render(<ImagePicker maxCount={5} />)
      expect(screen.getByText('2/5')).toBeInTheDocument()
    })

    it('应该显示自定义提示文本', () => {
      const customHint = '自定义提示文本'
      render(<ImagePicker hintText={customHint} />)
      expect(screen.getByText(customHint)).toBeInTheDocument()
    })

    it('应该在禁用状态下禁用交互', () => {
      render(<ImagePicker disabled={true} />)
      
      const addButton = screen.getByText('上传照片').parentElement
      expect(addButton).toHaveClass('loading') // 禁用状态下会有loading类
    })

    it('应该显示加载状态', () => {
      mockUseImagePicker.isLoading = true
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      expect(screen.getByText('处理中...')).toBeInTheDocument()
    })
  })

  describe('图片显示测试', () => {
    it('应该显示所有图片', () => {
      render(<ImagePicker />)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
    })

    it('应该显示压缩状态信息', () => {
      render(<ImagePicker />)
      
      expect(screen.getByText('1.0MB → 0.5MB')).toBeInTheDocument()
    })

    it('应该显示错误状态', () => {
      const errorImages = [
        {
          id: '1',
          url: 'blob:http://localhost/test1',
          status: 'error' as const,
          error: '图片格式不支持'
        }
      ]
      
      mockUseImagePicker.images = errorImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      expect(screen.getByText('图片格式不支持')).toBeInTheDocument()
    })

    it('应该显示压缩中的状态', () => {
      const compressingImages = [
        {
          id: '1',
          url: 'blob:http://localhost/test1',
          status: 'compressing' as const
        }
      ]
      
      mockUseImagePicker.images = compressingImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('压缩中...')).toBeInTheDocument()
    })

    it('应该显示错误数量', () => {
      const mixedImages = [
        ...mockImages,
        {
          id: '3',
          url: 'blob:http://localhost/test3',
          status: 'error' as const,
          error: '验证失败'
        }
      ]
      
      mockUseImagePicker.images = mixedImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('3/9 (1张错误)')).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('应该调用selectImages when clicking add button', async () => {
      render(<ImagePicker />)
      
      const addButton = screen.getByText('上传照片').parentElement
      await userEvent.click(addButton!)
      
      expect(mockUseImagePicker.selectImages).toHaveBeenCalledTimes(1)
    })

    it('应该调用removeImage when clicking remove button', async () => {
      render(<ImagePicker />)
      
      const removeButtons = screen.getAllByText('×')
      await userEvent.click(removeButtons[0])
      
      // 等待确认对话框
      await waitFor(() => {
        expect(mockUseImagePicker.removeImage).toHaveBeenCalledWith('1')
      })
    })

    it('应该显示压缩按钮当有pending图片时', () => {
      render(<ImagePicker />)
      
      expect(screen.getByText('压缩 1 张图片')).toBeInTheDocument()
    })

    it('应该调用compressImages when clicking compress button', async () => {
      render(<ImagePicker />)
      
      const compressButton = screen.getByText('压缩 1 张图片')
      await userEvent.click(compressButton)
      
      expect(mockUseImagePicker.compressImages).toHaveBeenCalledTimes(1)
    })

    it('should not show compress button when showCompressButton is false', () => {
      render(<ImagePicker showCompressButton={false} />)
      
      expect(screen.queryByText('压缩 1 张图片')).not.toBeInTheDocument()
    })

    it('should show auto compress hint when autoCompress is true', () => {
      render(<ImagePicker autoCompress={true} />)
      
      expect(screen.getByText('已开启自动压缩，图片将自动优化大小')).toBeInTheDocument()
    })
  })

  describe('预览功能测试', () => {
    it('should call previewImage when clicking on valid image', async () => {
      const { Taro } = require('@tarojs/taro')
      
      render(<ImagePicker />)
      
      const images = screen.getAllByRole('img')
      await userEvent.click(images[0])
      
      expect(Taro.previewImage).toHaveBeenCalledWith({
        urls: ['blob:http://localhost/test1', 'blob:http://localhost/test2'],
        current: 'blob:http://localhost/test1'
      })
    })

    it('should show error message when clicking on error image', async () => {
      const { showToast } = require('@/utils/ui')
      
      const errorImages = [
        {
          id: '1',
          url: 'blob:http://localhost/test1',
          status: 'error' as const,
          error: '图片验证失败'
        }
      ]
      
      mockUseImagePicker.images = errorImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      const images = screen.getAllByRole('img')
      await userEvent.click(images[0])
      
      expect(showToast).toHaveBeenCalledWith({
        title: '图片验证失败',
        icon: 'none'
      })
    })
  })

  describe('回调测试', () => {
    it('should call onChange when images change', () => {
      const onChange = jest.fn()
      
      render(<ImagePicker onChange={onChange} />)
      
      // 由于useEffect监听images变化，我们需要触发状态变化
      // 这里模拟组件重新渲染
      const newImages = [...mockImages]
      mockUseImagePicker.images = newImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      // 重新渲染组件
      render(<ImagePicker onChange={onChange} value={newImages} />)
      
      expect(onChange).toHaveBeenCalledWith(newImages)
    })

    it('should call onError when error occurs', async () => {
      const onError = jest.fn()
      const errorMessage = '选择图片失败'
      
      mockUseImagePicker.selectImages.mockRejectedValueOnce(new Error(errorMessage))
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker onError={onError} />)
      
      const addButton = screen.getByText('上传照片').parentElement
      await userEvent.click(addButton!)
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorMessage)
      })
    })

    it('should call onSuccess when images are selected successfully', async () => {
      const onSuccess = jest.fn()
      
      render(<ImagePicker onSuccess={onSuccess} />)
      
      const addButton = screen.getByText('上传照片').parentElement
      await userEvent.click(addButton!)
      
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockImages)
      })
    })
  })

  describe('平台兼容性测试', () => {
    it('should render canvas for wechat mini program', () => {
      // 模拟微信小程序环境
      process.env.TARO_ENV = 'weapp'
      
      render(<ImagePicker />)
      
      const canvas = screen.getByRole('img', { hidden: true }) // Canvas会被当作img
      expect(canvas).toHaveAttribute('canvasId', 'compress-canvas')
      
      // 恢复环境
      delete process.env.TARO_ENV
    })

    it('should not render canvas for H5', () => {
      // 模拟H5环境
      process.env.TARO_ENV = 'h5'
      
      render(<ImagePicker />)
      
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
      
      // 恢复环境
      delete process.env.TARO_ENV
    })
  })

  describe('样式和类名测试', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-picker'
      
      const { container } = render(<ImagePicker className={customClass} />)
      
      expect(container.firstChild).toHaveClass('image-picker', customClass)
    })

    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' }
      
      const { container } = render(<ImagePicker style={customStyle} />)
      
      expect(container.firstChild).toHaveStyle('background-color: red')
    })
  })

  describe('边界情况测试', () => {
    it('should handle empty images array', () => {
      mockUseImagePicker.images = []
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('0/9')).toBeInTheDocument()
      expect(screen.getByText('上传照片')).toBeInTheDocument()
    })

    it('should handle maximum images', () => {
      const maxImages = Array.from({ length: 9 }, (_, i) => ({
        id: `${i}`,
        url: `blob:http://localhost/test${i}`,
        status: 'compressed' as const
      }))
      
      mockUseImagePicker.images = maxImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('9/9')).toBeInTheDocument()
      expect(screen.queryByText('上传照片')).not.toBeInTheDocument()
    })

    it('should handle all error images', () => {
      const errorImages = Array.from({ length: 3 }, (_, i) => ({
        id: `${i}`,
        url: `blob:http://localhost/test${i}`,
        status: 'error' as const,
        error: '验证失败'
      }))
      
      mockUseImagePicker.images = errorImages
      ;(useImagePicker as jest.Mock).mockReturnValue(mockUseImagePicker)
      
      render(<ImagePicker />)
      
      expect(screen.getByText('3/9 (3张错误)')).toBeInTheDocument()
    })
  })
})