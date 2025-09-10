import { 
  SportRecord, 
  CreateSportRecordData, 
  UpdateSportRecordData, 
  RecordStats, 
  RecordQueryOptions,
  SportType, 
  Intensity, 
  RecordStatus 
} from '../../src/models/SportRecord'

/**
 * 运动记录数据模型测试
 * 测试运动记录模型的类型定义和接口
 */
describe('SportRecord Model', () => {
  describe('枚举定义', () => {
    it('应该包含所有运动类型枚举值', () => {
      expect(SportType.RUNNING).toBe('running')
      expect(SportType.WALKING).toBe('walking')
      expect(SportType.CYCLING).toBe('cycling')
      expect(SportType.SWIMMING).toBe('swimming')
      expect(SportType.FITNESS).toBe('fitness')
      expect(SportType.YOGA).toBe('yoga')
      expect(SportType.BASKETBALL).toBe('basketball')
      expect(SportType.FOOTBALL).toBe('football')
      expect(SportType.BADMINTON).toBe('badminton')
      expect(SportType.TENNIS).toBe('tennis')
      expect(SportType.CLIMBING).toBe('climbing')
      expect(SportType.SKATING).toBe('skating')
      expect(SportType.SKIING).toBe('skiing')
      expect(SportType.OTHER).toBe('other')
    })

    it('应该包含所有强度枚举值', () => {
      expect(Intensity.LOW).toBe(1)
      expect(Intensity.MODERATE).toBe(2)
      expect(Intensity.HIGH).toBe(3)
      expect(Intensity.EXTREME).toBe(4)
    })

    it('应该包含所有记录状态枚举值', () => {
      expect(RecordStatus.ACTIVE).toBe('active')
      expect(RecordStatus.HIDDEN).toBe('hidden')
      expect(RecordStatus.DELETED).toBe('deleted')
    })
  })

  describe('运动记录模型接口', () => {
    it('应该定义完整的运动记录数据结构', () => {
      const mockRecord: SportRecord = {
        _id: 'test_record_id',
        userId: 'test_user_id',
        sportType: SportType.RUNNING,
        title: '晨跑记录',
        description: '今天状态不错，跑了10公里',
        status: RecordStatus.ACTIVE,
        startTime: new Date('2024-01-01T07:00:00Z'),
        endTime: new Date('2024-01-01T08:00:00Z'),
        duration: 60,
        distance: 10,
        calories: 600,
        steps: 12000,
        location: {
          name: '中央公园',
          address: '北京市朝阳区中央公园',
          latitude: 39.9042,
          longitude: 116.4074
        },
        trackPoints: [
          {
            latitude: 39.9042,
            longitude: 116.4074,
            altitude: 50,
            speed: 10,
            timestamp: new Date('2024-01-01T07:00:00Z')
          }
        ],
        heartRate: {
          avg: 150,
          max: 180,
          min: 120,
          data: [
            { value: 150, timestamp: new Date('2024-01-01T07:00:00Z') }
          ]
        },
        pace: {
          avg: 6,
          best: 5.5,
          splits: [
            { distance: 1, time: 6, pace: 6 }
          ]
        },
        intensity: Intensity.MODERATE,
        trainingLoad: 120,
        weather: {
          condition: '晴天',
          temperature: 15,
          humidity: 60,
          windSpeed: 5
        },
        device: {
          name: 'Apple Watch',
          type: 'smartwatch',
          version: 'Series 8'
        },
        mediaIds: ['media1', 'media2'],
        thumbnailId: 'thumbnail1',
        likesCount: 10,
        commentsCount: 5,
        sharesCount: 2,
        isPublic: true,
        tags: ['晨跑', '10公里', '状态好'],
        personalRecords: {
          distance: false,
          duration: false,
          speed: false
        },
        syncStatus: {
          synced: true,
          syncTime: new Date('2024-01-01T08:00:00Z'),
          deviceId: 'device123'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }

      expect(mockRecord).toBeDefined()
      expect(mockRecord.userId).toBe('test_user_id')
      expect(mockRecord.sportType).toBe(SportType.RUNNING)
      expect(mockRecord.title).toBe('晨跑记录')
      expect(mockRecord.duration).toBe(60)
      expect(mockRecord.distance).toBe(10)
    })

    it('应该支持最小化的运动记录', () => {
      const minimalRecord: SportRecord = {
        userId: 'test_user_id',
        sportType: SportType.WALKING,
        title: '散步',
        status: RecordStatus.ACTIVE,
        startTime: new Date(),
        endTime: new Date(),
        duration: 30,
        calories: 150,
        intensity: Intensity.LOW,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isPublic: false,
        syncStatus: {
          synced: true
        }
      }

      expect(minimalRecord).toBeDefined()
      expect(minimalRecord.distance).toBeUndefined()
      expect(minimalRecord.location).toBeUndefined()
    })
  })

  describe('创建运动记录数据接口', () => {
    it('应该定义创建运动记录所需的数据结构', () => {
      const createData: CreateSportRecordData = {
        sportType: SportType.CYCLING,
        title: '骑行记录',
        description: '骑行了20公里',
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        duration: 90,
        distance: 20,
        calories: 450,
        location: {
          name: '奥林匹克公园',
          latitude: 40.0002,
          longitude: 116.3974
        },
        intensity: Intensity.MODERATE,
        isPublic: true,
        tags: ['骑行', '20公里']
      }

      expect(createData).toBeDefined()
      expect(createData.sportType).toBe(SportType.CYCLING)
      expect(createData.duration).toBe(90)
      expect(createData.distance).toBe(20)
    })
  })

  describe('更新运动记录数据接口', () => {
    it('应该定义更新运动记录的数据结构', () => {
      const updateData: UpdateSportRecordData = {
        title: '更新后的标题',
        description: '更新后的描述',
        status: RecordStatus.HIDDEN,
        isPublic: false,
        tags: ['更新', '修改'],
        mediaIds: ['new_media1', 'new_media2'],
        thumbnailId: 'new_thumbnail'
      }

      expect(updateData).toBeDefined()
      expect(updateData.title).toBe('更新后的标题')
      expect(updateData.status).toBe(RecordStatus.HIDDEN)
      expect(updateData.isPublic).toBe(false)
    })
  })

  describe('运动记录统计接口', () => {
    it('应该定义运动记录统计的数据结构', () => {
      const stats: RecordStats = {
        totalRecords: 100,
        totalDuration: 5000,
        totalDistance: 500,
        totalCalories: 50000,
        sportTypeStats: {
          [SportType.RUNNING]: {
            count: 50,
            duration: 2500,
            distance: 300,
            calories: 25000
          },
          [SportType.WALKING]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.CYCLING]: {
            count: 30,
            duration: 1500,
            distance: 150,
            calories: 15000
          },
          [SportType.SWIMMING]: {
            count: 20,
            duration: 1000,
            distance: 50,
            calories: 10000
          },
          [SportType.FITNESS]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.YOGA]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.BASKETBALL]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.FOOTBALL]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.BADMINTON]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.TENNIS]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.CLIMBING]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.SKATING]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.SKIING]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          },
          [SportType.OTHER]: {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          }
        }
      }

      expect(stats).toBeDefined()
      expect(stats.totalRecords).toBe(100)
      expect(stats.totalDuration).toBe(5000)
      expect(stats.sportTypeStats[SportType.RUNNING].count).toBe(50)
    })
  })

  describe('查询参数接口', () => {
    it('应该定义查询参数的数据结构', () => {
      const queryOptions: RecordQueryOptions = {
        userId: 'test_user_id',
        sportType: SportType.FITNESS,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isPublic: true,
        status: RecordStatus.ACTIVE,
        minDuration: 30,
        maxDuration: 120,
        minDistance: 5,
        maxDistance: 50,
        tags: ['健身', '力量训练'],
        sortBy: 'startTime',
        sortOrder: 'desc'
      }

      expect(queryOptions).toBeDefined()
      expect(queryOptions.userId).toBe('test_user_id')
      expect(queryOptions.sportType).toBe(SportType.FITNESS)
      expect(queryOptions.sortBy).toBe('startTime')
      expect(queryOptions.sortOrder).toBe('desc')
    })
  })

  describe('类型安全性', () => {
    it('应该确保枚举值的类型安全', () => {
      const sportType: SportType = SportType.RUNNING
      const intensity: Intensity = Intensity.HIGH
      const status: RecordStatus = RecordStatus.ACTIVE

      expect(typeof sportType).toBe('string')
      expect(typeof intensity).toBe('number')
      expect(typeof status).toBe('string')
    })

    it('应该确保运动记录模型的类型安全', () => {
      const record: SportRecord = {
        userId: 'test',
        sportType: SportType.RUNNING,
        title: 'test',
        status: RecordStatus.ACTIVE,
        startTime: new Date(),
        endTime: new Date(),
        duration: 30,
        calories: 300,
        intensity: Intensity.MODERATE,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isPublic: false,
        syncStatus: { synced: true }
      }

      // 验证所有必需字段都存在
      expect(record.userId).toBeDefined()
      expect(record.sportType).toBeDefined()
      expect(record.title).toBeDefined()
      expect(record.status).toBeDefined()
    })
  })
})