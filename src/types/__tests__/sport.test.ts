/**
 * 运动记录类型定义测试
 */

import {
  SportType,
  SportTypeLabels,
  SportTypeIcons,
  SportDataValidationRules,
  ImageUploadConfig,
  SportRecordData,
  SportRecord,
  CreateSportRecordParams
} from '../sport'

describe('运动记录类型定义', () => {
  describe('SportType 枚举', () => {
    it('应该包含所有运动类型', () => {
      expect(SportType.RUNNING).toBe('running')
      expect(SportType.CYCLING).toBe('cycling')
      expect(SportType.FITNESS).toBe('fitness')
      expect(SportType.HIKING).toBe('hiking')
      expect(SportType.SWIMMING).toBe('swimming')
      expect(SportType.BASKETBALL).toBe('basketball')
      expect(SportType.FOOTBALL).toBe('football')
      expect(SportType.BADMINTON).toBe('badminton')
      expect(SportType.TENNIS).toBe('tennis')
      expect(SportType.OTHER).toBe('other')
    })
  })

  describe('SportTypeLabels', () => {
    it('应该包含所有运动类型的中文标签', () => {
      expect(SportTypeLabels[SportType.RUNNING]).toBe('跑步')
      expect(SportTypeLabels[SportType.CYCLING]).toBe('骑行')
      expect(SportTypeLabels[SportType.FITNESS]).toBe('健身')
      expect(SportTypeLabels[SportType.HIKING]).toBe('徒步')
      expect(SportTypeLabels[SportType.SWIMMING]).toBe('游泳')
      expect(SportTypeLabels[SportType.BASKETBALL]).toBe('篮球')
      expect(SportTypeLabels[SportType.FOOTBALL]).toBe('足球')
      expect(SportTypeLabels[SportType.BADMINTON]).toBe('羽毛球')
      expect(SportTypeLabels[SportType.TENNIS]).toBe('网球')
      expect(SportTypeLabels[SportType.OTHER]).toBe('其他')
    })
  })

  describe('SportTypeIcons', () => {
    it('应该包含所有运动类型的图标', () => {
      expect(SportTypeIcons[SportType.RUNNING]).toBe('🏃‍♂️')
      expect(SportTypeIcons[SportType.CYCLING]).toBe('🚴‍♂️')
      expect(SportTypeIcons[SportType.FITNESS]).toBe('💪')
      expect(SportTypeIcons[SportType.HIKING]).toBe('🥾')
      expect(SportTypeIcons[SportType.SWIMMING]).toBe('🏊‍♂️')
      expect(SportTypeIcons[SportType.BASKETBALL]).toBe('⛹️‍♂️')
      expect(SportTypeIcons[SportType.FOOTBALL]).toBe('⚽')
      expect(SportTypeIcons[SportType.BADMINTON]).toBe('🏸')
      expect(SportTypeIcons[SportType.TENNIS]).toBe('🎾')
      expect(SportTypeIcons[SportType.OTHER]).toBe('🏃‍♂️')
    })
  })

  describe('SportDataValidationRules', () => {
    it('应该包含正确的验证规则', () => {
      // 时长验证
      expect(SportDataValidationRules.duration.min).toBe(1)
      expect(SportDataValidationRules.duration.max).toBe(1440)
      expect(SportDataValidationRules.duration.required).toBe(true)
      expect(SportDataValidationRules.duration.message).toBe('运动时长应在1-1440分钟之间')

      // 距离验证
      expect(SportDataValidationRules.distance.min).toBe(0.1)
      expect(SportDataValidationRules.distance.max).toBe(200)
      expect(SportDataValidationRules.distance.required).toBe(false)
      expect(SportDataValidationRules.distance.message).toBe('运动距离应在0.1-200公里之间')

      // 卡路里验证
      expect(SportDataValidationRules.calories.min).toBe(10)
      expect(SportDataValidationRules.calories.max).toBe(5000)
      expect(SportDataValidationRules.calories.required).toBe(true)
      expect(SportDataValidationRules.calories.message).toBe('消耗卡路里应在10-5000之间')

      // 心率验证
      expect(SportDataValidationRules.heartRate.min).toBe(40)
      expect(SportDataValidationRules.heartRate.max).toBe(220)
      expect(SportDataValidationRules.heartRate.required).toBe(false)
      expect(SportDataValidationRules.heartRate.message).toBe('心率应在40-220之间')

      // 步数验证
      expect(SportDataValidationRules.steps.min).toBe(1)
      expect(SportDataValidationRules.steps.max).toBe(100000)
      expect(SportDataValidationRules.steps.required).toBe(false)
      expect(SportDataValidationRules.steps.message).toBe('步数应在1-100000之间')

      // 描述验证
      expect(SportDataValidationRules.description.max).toBe(500)
      expect(SportDataValidationRules.description.required).toBe(false)
      expect(SportDataValidationRules.description.message).toBe('运动描述最多500字')
    })
  })

  describe('ImageUploadConfig', () => {
    it('应该包含正确的图片上传配置', () => {
      expect(ImageUploadConfig.maxCount).toBe(9)
      expect(ImageUploadConfig.maxSize).toBe(2 * 1024 * 1024) // 2MB
      expect(ImageUploadConfig.acceptTypes).toEqual(['image/jpeg', 'image/jpg', 'image/png'])
      expect(ImageUploadConfig.acceptTypesText).toBe('JPG、JPEG、PNG')
    })
  })

  describe('类型接口', () => {
    it('应该能够创建正确的运动记录数据结构', () => {
      const sportRecordData: SportRecordData = {
        duration: 30,
        distance: 5.2,
        calories: 300,
        heartRate: 120,
        steps: 5200
      }

      expect(sportRecordData.duration).toBe(30)
      expect(sportRecordData.distance).toBe(5.2)
      expect(sportRecordData.calories).toBe(300)
      expect(sportRecordData.heartRate).toBe(120)
      expect(sportRecordData.steps).toBe(5200)
    })

    it('应该能够创建正确的运动记录', () => {
      const sportRecord: SportRecord = {
        _id: 'test-id',
        openid: 'test-openid',
        sportType: SportType.RUNNING,
        data: {
          duration: 30,
          distance: 5.2,
          calories: 300
        },
        images: ['image1.jpg', 'image2.jpg'],
        description: '今天跑步感觉很棒！',
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市东城区天安门广场'
        },
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z')
      }

      expect(sportRecord._id).toBe('test-id')
      expect(sportRecord.openid).toBe('test-openid')
      expect(sportRecord.sportType).toBe(SportType.RUNNING)
      expect(sportRecord.images).toHaveLength(2)
      expect(sportRecord.description).toBe('今天跑步感觉很棒！')
    })

    it('应该能够创建正确的创建参数', () => {
      const createParams: CreateSportRecordParams = {
        sportType: SportType.CYCLING,
        data: {
          duration: 60,
          distance: 20,
          calories: 500
        },
        images: ['image1.jpg'],
        description: '骑行很棒！',
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市'
        }
      }

      expect(createParams.sportType).toBe(SportType.CYCLING)
      expect(createParams.data.duration).toBe(60)
      expect(createParams.data.distance).toBe(20)
      expect(createParams.data.calories).toBe(500)
      expect(createParams.images).toHaveLength(1)
      expect(createParams.description).toBe('骑行很棒！')
    })
  })

  describe('验证规则测试', () => {
    it('应该正确验证运动数据', () => {
      // 有效的数据
      const validData = {
        duration: 30,
        distance: 5.2,
        calories: 300
      }

      expect(validData.duration).toBeGreaterThanOrEqual(SportDataValidationRules.duration.min!)
      expect(validData.duration).toBeLessThanOrEqual(SportDataValidationRules.duration.max!)
      expect(validData.distance).toBeGreaterThanOrEqual(SportDataValidationRules.distance.min!)
      expect(validData.distance).toBeLessThanOrEqual(SportDataValidationRules.distance.max!)
      expect(validData.calories).toBeGreaterThanOrEqual(SportDataValidationRules.calories.min!)
      expect(validData.calories).toBeLessThanOrEqual(SportDataValidationRules.calories.max!)
    })

    it('应该正确验证边界值', () => {
      // 边界值测试
      expect(SportDataValidationRules.duration.min).toBe(1)
      expect(SportDataValidationRules.duration.max).toBe(1440)
      expect(SportDataValidationRules.distance?.min).toBe(0.1)
      expect(SportDataValidationRules.distance?.max).toBe(200)
      expect(SportDataValidationRules.calories.min).toBe(10)
      expect(SportDataValidationRules.calories.max).toBe(5000)
    })
  })
})