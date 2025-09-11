/**
 * SportCard组件测试
 * 测试运动记录卡片组件的渲染和交互
 */

import React from 'react'
import { render, screen, fireEvent } from '@/utils/test-utils'
import SportCard from '../SportCard'
import { SportRecord } from '@/types/sport'

// 模拟运动记录数据
const mockSportRecord: SportRecord = {
  _id: 'test-record-id',
  openid: 'test-openid',
  sportType: 'running',
  data: {
    duration: 30,
    distance: 5.2,
    calories: 300,
    heartRate: 120,
    steps: 5200
  },
  images: ['/tmp/test1.jpg', '/tmp/test2.jpg'],
  description: '今天跑步感觉很棒！',
  location: {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市东城区天安门广场',
    city: '北京市',
    district: '东城区'
  },
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  isDeleted: false
}

describe('SportCard组件', () => {
  describe('基本渲染', () => {
    it('应该正确渲染运动记录卡片', () => {
      render(<SportCard record={mockSportRecord} />)
      
      expect(screen.getByText('跑步')).toBeInTheDocument()
      expect(screen.getByText('今天跑步感觉很棒！')).toBeInTheDocument()
      expect(screen.getByText('北京市东城区天安门广场')).toBeInTheDocument()
    })

    it('应该显示运动数据', () => {
      render(<SportCard record={mockSportRecord} />)
      
      expect(screen.getByText('5.2')).toBeInTheDocument() // 距离
      expect(screen.getByText('300')).toBeInTheDocument() // 卡路里
      expect(screen.getByText('30')).toBeInTheDocument() // 时长
    })

    it('应该显示运动类型图标', () => {
      render(<SportCard record={mockSportRecord} />)
      
      const sportIcon = screen.getByTestId('sport-icon')
      expect(sportIcon).toBeInTheDocument()
      expect(sportIcon).toHaveTextContent('🏃‍♂️') // 跑步图标
    })

    it('应该显示创建时间', () => {
      render(<SportCard record={mockSportRecord} />)
      
      expect(screen.getByText('2024-01-01 10:00')).toBeInTheDocument()
    })
  })

  describe('不同类型运动', () => {
    it('应该正确显示跑步运动', () => {
      const runningRecord = {
        ...mockSportRecord,
        sportType: 'running' as const
      }
      
      render(<SportCard record={runningRecord} />)
      expect(screen.getByText('跑步')).toBeInTheDocument()
      expect(screen.getByTestId('sport-icon')).toHaveTextContent('🏃‍♂️')
    })

    it('应该正确显示骑行运动', () => {
      const cyclingRecord = {
        ...mockSportRecord,
        sportType: 'cycling' as const,
        data: { ...mockSportRecord.data, distance: 15.5 }
      }
      
      render(<SportCard record={cyclingRecord} />)
      expect(screen.getByText('骑行')).toBeInTheDocument()
      expect(screen.getByTestId('sport-icon')).toHaveTextContent('🚴‍♂️')
    })

    it('应该正确显示游泳运动', () => {
      const swimmingRecord = {
        ...mockSportRecord,
        sportType: 'swimming' as const,
        data: { ...mockSportRecord.data, duration: 45 }
      }
      
      render(<SportCard record={swimmingRecord} />)
      expect(screen.getByText('游泳')).toBeInTheDocument()
      expect(screen.getByTestId('sport-icon')).toHaveTextContent('🏊‍♂️')
    })

    it('应该正确显示健身运动', () => {
      const fitnessRecord = {
        ...mockSportRecord,
        sportType: 'fitness' as const,
        data: { ...mockSportRecord.data, duration: 60 }
      }
      
      render(<SportCard record={fitnessRecord} />)
      expect(screen.getByText('健身')).toBeInTheDocument()
      expect(screen.getByTestId('sport-icon')).toHaveTextContent('💪')
    })

    it('应该正确显示其他运动', () => {
      const otherRecord = {
        ...mockSportRecord,
        sportType: 'other' as const
      }
      
      render(<SportCard record={otherRecord} />)
      expect(screen.getByText('其他')).toBeInTheDocument()
      expect(screen.getByTestId('sport-icon')).toHaveTextContent('🏃‍♂️') // 默认图标
    })
  })

  describe('图片显示', () => {
    it('应该显示运动图片', () => {
      render(<SportCard record={mockSportRecord} />)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
      expect(images[0]).toHaveAttribute('src', '/tmp/test1.jpg')
      expect(images[1]).toHaveAttribute('src', '/tmp/test2.jpg')
    })

    it('应该处理没有图片的记录', () => {
      const recordWithoutImages = {
        ...mockSportRecord,
        images: []
      }
      
      render(<SportCard record={recordWithoutImages} />)
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('应该处理单张图片的记录', () => {
      const recordWithOneImage = {
        ...mockSportRecord,
        images: ['/tmp/single.jpg']
      }
      
      render(<SportCard record={recordWithOneImage} />)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(1)
      expect(images[0]).toHaveAttribute('src', '/tmp/single.jpg')
    })
  })

  describe('交互事件', () => {
    it('应该处理点击事件', () => {
      const handleClick = jest.fn()
      render(<SportCard record={mockSportRecord} onClick={handleClick} />)
      
      fireEvent.click(screen.getByTestId('sport-card'))
      expect(handleClick).toHaveBeenCalledTimes(1)
      expect(handleClick).toHaveBeenCalledWith(mockSportRecord)
    })

    it('应该处理长按事件', () => {
      const handleLongPress = jest.fn()
      render(<SportCard record={mockSportRecord} onLongPress={handleLongPress} />)
      
      const card = screen.getByTestId('sport-card')
      fireEvent.mouseDown(card)
      
      setTimeout(() => {
        fireEvent.mouseUp(card)
        expect(handleLongPress).toHaveBeenCalledTimes(1)
        expect(handleLongPress).toHaveBeenCalledWith(mockSportRecord)
      }, 1000)
    })

    it('应该处理分享事件', () => {
      const handleShare = jest.fn()
      render(<SportCard record={mockSportRecord} onShare={handleShare} />)
      
      fireEvent.click(screen.getByTestId('share-button'))
      expect(handleShare).toHaveBeenCalledTimes(1)
      expect(handleShare).toHaveBeenCalledWith(mockSportRecord)
    })

    it('应该处理删除事件', () => {
      const handleDelete = jest.fn()
      render(<SportCard record={mockSportRecord} onDelete={handleDelete} />)
      
      fireEvent.click(screen.getByTestId('delete-button'))
      expect(handleDelete).toHaveBeenCalledTimes(1)
      expect(handleDelete).toHaveBeenCalledWith(mockSportRecord)
    })
  })

  describe('编辑模式', () => {
    it('应该在编辑模式下显示编辑按钮', () => {
      const handleEdit = jest.fn()
      render(<SportCard record={mockSportRecord} editable onEdit={handleEdit} />)
      
      expect(screen.getByTestId('edit-button')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('edit-button'))
      expect(handleEdit).toHaveBeenCalledTimes(1)
      expect(handleEdit).toHaveBeenCalledWith(mockSportRecord)
    })

    it('应该在非编辑模式下隐藏编辑按钮', () => {
      render(<SportCard record={mockSportRecord} editable={false} />)
      
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument()
    })
  })

  describe('选择模式', () => {
    it('应该在多选模式下显示复选框', () => {
      render(<SportCard record={mockSportRecord} selectable />)
      
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('应该处理选中状态变化', () => {
      const handleSelect = jest.fn()
      render(<SportCard record={mockSportRecord} selectable onSelect={handleSelect} />)
      
      fireEvent.click(screen.getByRole('checkbox'))
      expect(handleSelect).toHaveBeenCalledTimes(1)
      expect(handleSelect).toHaveBeenCalledWith(mockSportRecord, true)
    })

    it('应该显示已选中状态', () => {
      render(<SportCard record={mockSportRecord} selectable selected />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化距离数据', () => {
      const recordWithLongDistance = {
        ...mockSportRecord,
        data: { ...mockSportRecord.data, distance: 10.567 }
      }
      
      render(<SportCard record={recordWithLongDistance} />)
      
      expect(screen.getByText('10.57')).toBeInTheDocument() // 保留两位小数
    })

    it('应该正确格式化卡路里数据', () => {
      const recordWithHighCalories = {
        ...mockSportRecord,
        data: { ...mockSportRecord.data, calories: 1234 }
      }
      
      render(<SportCard record={recordWithHighCalories} />)
      
      expect(screen.getByText('1234')).toBeInTheDocument()
    })

    it('应该正确格式化时长数据', () => {
      const recordWithLongDuration = {
        ...mockSportRecord,
        data: { ...mockSportRecord.data, duration: 125 }
      }
      
      render(<SportCard record={recordWithLongDuration} />)
      
      expect(screen.getByText('125')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('应该处理缺少描述的情况', () => {
      const recordWithoutDescription = {
        ...mockSportRecord,
        description: ''
      }
      
      render(<SportCard record={recordWithoutDescription} />)
      
      expect(screen.queryByText('今天跑步感觉很棒！')).not.toBeInTheDocument()
    })

    it('应该处理缺少位置信息的情况', () => {
      const recordWithoutLocation = {
        ...mockSportRecord,
        location: null
      }
      
      render(<SportCard record={recordWithoutLocation} />)
      
      expect(screen.queryByText('北京市东城区天安门广场')).not.toBeInTheDocument()
    })

    it('应该处理缺少运动数据的情况', () => {
      const recordWithoutData = {
        ...mockSportRecord,
        data: null
      }
      
      render(<SportCard record={recordWithoutData} />)
      
      expect(screen.queryByText('5.2')).not.toBeInTheDocument()
      expect(screen.queryByText('300')).not.toBeInTheDocument()
      expect(screen.queryByText('30')).not.toBeInTheDocument()
    })
  })

  describe('无障碍访问', () => {
    it('应该具有正确的卡片角色', () => {
      render(<SportCard record={mockSportRecord} />)
      
      expect(screen.getByTestId('sport-card')).toHaveAttribute('role', 'article')
    })

    it('应该支持aria-label属性', () => {
      render(
        <SportCard 
          record={mockSportRecord} 
          aria-label="运动记录卡片"
        />
      )
      
      expect(screen.getByLabelText('运动记录卡片')).toBeInTheDocument()
    })

    it('按钮应该具有正确的标签', () => {
      render(<SportCard record={mockSportRecord} onShare={jest.fn()} onDelete={jest.fn()} />)
      
      expect(screen.getByTestId('share-button')).toHaveAttribute('aria-label', '分享')
      expect(screen.getByTestId('delete-button')).toHaveAttribute('aria-label', '删除')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量卡片', () => {
      const startTime = performance.now()
      
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <SportCard 
              key={i} 
              record={{
                ...mockSportRecord,
                _id: `test-${i}`
              }} 
            />
          ))}
        </>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(2000) // 2秒内渲染50个卡片
      
      expect(screen.getAllByTestId('sport-card')).toHaveLength(50)
    })
  })
})