/**
 * ImagePreview 组件测试
 * 测试图片预览组件的各项功能
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImagePreview, ImagePreviewList } from './index'
import { ImageItem } from '@/hooks/useImagePicker'
import Taro from '@tarojs/taro'

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  previewImage: jest.fn(),
  showModal: jest.fn((options) => {
    // 模拟用户确认删除
    if (options.success) {
      options.success({ confirm: true })
    }
  })
}))

// Mock UI工具
jest.mock('@/utils/ui', () => ({
  showToast: jest.fn()
}))

describe('ImagePreview', () => {
  const mockImage: ImageItem = {
    id: 'test-image-1',
    url: 'https://example.com/image.jpg',
    status: 'pending',
    originalSize: 1024 * 1024, // 1MB
    compressedSize: 512 * 512  // 512KB
  }

  const mockOnRemove = jest.fn()
  const mockOnPreview = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染图片预览组件', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
        />
      )

      expect(container.querySelector('.image-preview')).toBeTruthy()
      expect(container.querySelector('.image-preview__image')).toBeTruthy()
    })

    it('应该显示图片', () => {
      render(
        <ImagePreview 
          image={mockImage} 
          index={0}
        />
      )

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', mockImage.url)
      expect(image).toHaveAttribute('mode', 'aspectFill')
    })

    it('应该应用正确的尺寸类名', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          size="large"
        />
      )

      expect(container.querySelector('.image-preview--large')).toBeTruthy()
    })

    it('应该应用正确的形状类名', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          shape="circle"
        />
      )

      expect(container.querySelector('.image-preview--circle')).toBeTruthy()
    })
  })

  describe('状态显示', () => {
    it('应该显示待处理状态', () => {
      const { container } = render(
        <ImagePreview 
          image={{ ...mockImage, status: 'pending' }} 
          index={0}
        />
      )

      expect(container.querySelector('.image-preview__status')).toBeTruthy()
      expect(container.textContent).toContain('⏳')
      expect(container.textContent).toContain('待处理')
    })

    it('应该显示压缩中状态', () => {
      const { container } = render(
        <ImagePreview 
          image={{ ...mockImage, status: 'compressing' }} 
          index={0}
        />
      )

      expect(container.querySelector('.image-preview--compressing')).toBeTruthy()
      expect(container.textContent).toContain('🔄')
      expect(container.textContent).toContain('压缩中')
    })

    it('应该显示已压缩状态', () => {
      const { container } = render(
        <ImagePreview 
          image={{ ...mockImage, status: 'compressed' }} 
          index={0}
        />
      )

      expect(container.textContent).toContain('✅')
      expect(container.textContent).toContain('已压缩')
    })

    it('应该显示错误状态', () => {
      const errorImage = { 
        ...mockImage, 
        status: 'error' as const, 
        error: '压缩失败' 
      }
      const { container } = render(
        <ImagePreview 
          image={errorImage} 
          index={0}
        />
      )

      expect(container.querySelector('.image-preview--error')).toBeTruthy()
      expect(container.textContent).toContain('❌')
      expect(container.textContent).toContain('压缩失败')
    })

    it('应该显示压缩信息', () => {
      const { container } = render(
        <ImagePreview 
          image={{ ...mockImage, status: 'compressed' }} 
          index={0}
          showCompressionInfo={true}
        />
      )

      expect(container.textContent).toContain('-50%') // 压缩比例
      expect(container.textContent).toContain('1.0MB → 0.3MB') // 文件大小
    })

    it('应该隐藏状态信息当showStatus为false', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          showStatus={false}
        />
      )

      expect(container.querySelector('.image-preview__status')).toBeFalsy()
    })
  })

  describe('删除功能', () => {
    it('应该显示删除按钮', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          showRemove={true}
          onRemove={mockOnRemove}
        />
      )

      expect(container.querySelector('.image-preview__remove')).toBeTruthy()
    })

    it('应该隐藏删除按钮当showRemove为false', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          showRemove={false}
        />
      )

      expect(container.querySelector('.image-preview__remove')).toBeFalsy()
    })

    it('应该处理删除点击', async () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          onRemove={mockOnRemove}
        />
      )

      const removeButton = container.querySelector('.image-preview__remove')
      expect(removeButton).toBeTruthy()

      fireEvent.click(removeButton!)

      await waitFor(() => {
        expect(Taro.showModal).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '确认删除',
            content: '确定要删除这张图片吗？'
          })
        )
        expect(mockOnRemove).toHaveBeenCalledWith(mockImage.id)
      })
    })

    it('应该阻止事件冒泡当点击删除按钮', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          onRemove={mockOnRemove}
          onPreview={mockOnPreview}
        />
      )

      const removeButton = container.querySelector('.image-preview__remove')
      const stopPropagationSpy = jest.fn()
      
      // 模拟事件对象
      const mockEvent = {
        stopPropagation: stopPropagationSpy
      }

      removeButton?.dispatchEvent(new MouseEvent('click', { 
        bubbles: true,
        cancelable: true
      }))

      // 验证stopPropagation被调用
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('预览功能', () => {
    it('应该处理图片点击', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          clickable={true}
          onPreview={mockOnPreview}
        />
      )

      const previewElement = container.querySelector('.image-preview')
      fireEvent.click(previewElement!)

      expect(mockOnPreview).toHaveBeenCalledWith(mockImage, 0)
    })

    it('应该使用默认预览行为当没有提供onPreview', () => {
      render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          clickable={true}
        />
      )

      const previewElement = screen.getByRole('img').parentElement?.parentElement
      fireEvent.click(previewElement!)

      expect(Taro.previewImage).toHaveBeenCalledWith({
        urls: [mockImage.url],
        current: mockImage.url
      })
    })

    it('不应该处理点击当clickable为false', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          clickable={false}
          onPreview={mockOnPreview}
        />
      )

      const previewElement = container.querySelector('.image-preview')
      fireEvent.click(previewElement!)

      expect(mockOnPreview).not.toHaveBeenCalled()
    })

    it('不应该处理错误图片的点击', () => {
      const errorImage = { ...mockImage, status: 'error' as const }
      const { container } = render(
        <ImagePreview 
          image={errorImage} 
          index={0}
          clickable={true}
          onPreview={mockOnPreview}
        />
      )

      const previewElement = container.querySelector('.image-preview')
      fireEvent.click(previewElement!)

      expect(mockOnPreview).not.toHaveBeenCalled()
    })
  })

  describe('图片加载', () => {
    it('应该处理图片加载成功', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
        />
      )

      const image = container.querySelector('.image-preview__image')
      fireEvent.load(image!)

      expect(container.querySelector('.image-preview__image--loaded')).toBeTruthy()
    })

    it('应该处理图片加载失败', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          onError={mockOnError}
        />
      )

      const image = container.querySelector('.image-preview__image')
      fireEvent.error(image!)

      expect(container.querySelector('.image-preview__image--error')).toBeTruthy()
      expect(mockOnError).toHaveBeenCalledWith(mockImage, '图片加载失败')
    })

    it('应该显示加载占位符', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
        />
      )

      expect(container.querySelector('.image-preview__placeholder')).toBeTruthy()
      expect(container.textContent).toContain('📷')
      expect(container.textContent).toContain('加载中...')
    })

    it('应该显示错误状态', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
        />
      )

      // 模拟加载失败
      const image = container.querySelector('.image-preview__image')
      fireEvent.error(image!)

      expect(container.querySelector('.image-preview__error')).toBeTruthy()
      expect(container.textContent).toContain('⚠️')
      expect(container.textContent).toContain('加载失败')
    })
  })

  describe('自定义样式', () => {
    it('应该应用自定义类名', () => {
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          className="custom-class"
        />
      )

      expect(container.querySelector('.custom-class')).toBeTruthy()
    })

    it('应该应用自定义样式', () => {
      const customStyle = { marginTop: '10px' }
      const { container } = render(
        <ImagePreview 
          image={mockImage} 
          index={0}
          style={customStyle}
        />
      )

      const element = container.querySelector('.image-preview')
      expect(element).toHaveStyle('margin-top: 10px')
    })
  })
})

describe('ImagePreviewList', () => {
  const mockImages: ImageItem[] = [
    {
      id: 'test-1',
      url: 'https://example.com/image1.jpg',
      status: 'pending'
    },
    {
      id: 'test-2', 
      url: 'https://example.com/image2.jpg',
      status: 'compressed'
    },
    {
      id: 'test-3',
      url: 'https://example.com/image3.jpg', 
      status: 'error',
      error: '处理失败'
    }
  ]

  it('应该渲染图片列表', () => {
    const { container } = render(
      <ImagePreviewList images={mockImages} />
    )

    const previews = container.querySelectorAll('.image-preview')
    expect(previews).toHaveLength(3)
  })

  it('应该应用正确的网格布局', () => {
    const { container } = render(
      <ImagePreviewList 
        images={mockImages} 
        columns={2}
        gap={12}
      />
    )

    const listElement = container.querySelector('.image-preview-list')
    expect(listElement).toHaveStyle('grid-template-columns: repeat(2, 1fr)')
    expect(listElement).toHaveStyle('gap: 12px')
  })

  it('应该传递预览属性给子组件', () => {
    const mockOnRemove = jest.fn()
    const { container } = render(
      <ImagePreviewList 
        images={mockImages}
        previewProps={{
          showRemove: true,
          onRemove: mockOnRemove,
          size: 'large'
        }}
      />
    )

    const previews = container.querySelectorAll('.image-preview--large')
    expect(previews).toHaveLength(3)
    
    // 验证删除按钮存在
    const removeButtons = container.querySelectorAll('.image-preview__remove')
    expect(removeButtons).toHaveLength(3)
  })

  it('应该应用自定义类名和样式', () => {
    const customStyle = { padding: '10px' }
    const { container } = render(
      <ImagePreviewList 
        images={mockImages}
        className="custom-list"
        style={customStyle}
      />
    )

    expect(container.querySelector('.custom-list')).toBeTruthy()
    expect(container.querySelector('.image-preview-list')).toHaveStyle('padding: 10px')
  })

  it('应该处理空列表', () => {
    const { container } = render(
      <ImagePreviewList images={[]} />
    )

    const previews = container.querySelectorAll('.image-preview')
    expect(previews).toHaveLength(0)
  })
})