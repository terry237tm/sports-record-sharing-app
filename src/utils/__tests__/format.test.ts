/**
 * 格式化工具函数测试
 * 测试各种数据格式化功能
 */

import {
  formatDuration,
  formatDistance,
  formatCalories,
  formatDate,
  formatTime,
  formatSpeed,
  formatHeartRate,
  formatLocation
} from '../format'

describe('Format Utils', () => {
  describe('formatDuration', () => {
    it('应该正确格式化持续时间', () => {
      expect(formatDuration(0)).toBe('0分钟')
      expect(formatDuration(30)).toBe('30分钟')
      expect(formatDuration(60)).toBe('1小时0分钟')
      expect(formatDuration(90)).toBe('1小时30分钟')
      expect(formatDuration(150)).toBe('2小时30分钟')
    })

    it('应该处理边界情况', () => {
      expect(formatDuration(-1)).toBe('0分钟')
      expect(formatDuration(1440)).toBe('24小时0分钟') // 24小时
      expect(formatDuration(1500)).toBe('25小时0分钟')
    })

    it('应该处理小数分钟', () => {
      expect(formatDuration(30.5)).toBe('30分钟')
      expect(formatDuration(30.9)).toBe('30分钟')
    })
  })

  describe('formatDistance', () => {
    it('应该正确格式化距离', () => {
      expect(formatDistance(0)).toBe('0.00公里')
      expect(formatDistance(1.5)).toBe('1.50公里')
      expect(formatDistance(10.256)).toBe('10.26公里')
      expect(formatDistance(100)).toBe('100.00公里')
    })

    it('应该处理不同单位', () => {
      expect(formatDistance(1.5, 'm')).toBe('1.50米')
      expect(formatDistance(1500, 'km')).toBe('1500.00公里')
      expect(formatDistance(1000, 'm')).toBe('1000.00米')
    })

    it('应该处理小数精度', () => {
      expect(formatDistance(1.2345, 'km', 3)).toBe('1.235公里')
      expect(formatDistance(1.2345, 'km', 1)).toBe('1.2公里')
      expect(formatDistance(1.2345, 'km', 0)).toBe('1公里')
    })
  })

  describe('formatCalories', () => {
    it('应该正确格式化卡路里', () => {
      expect(formatCalories(0)).toBe('0千卡')
      expect(formatCalories(100)).toBe('100千卡')
      expect(formatCalories(1500)).toBe('1500千卡')
      expect(formatCalories(2500)).toBe('2500千卡')
    })

    it('应该处理大数值', () => {
      expect(formatCalories(10000)).toBe('10000千卡')
      expect(formatCalories(15000)).toBe('15000千卡')
    })

    it('应该处理小数', () => {
      expect(formatCalories(100.5)).toBe('100千卡')
      expect(formatCalories(100.9)).toBe('100千卡')
    })
  })

  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(formatDate(date)).toBe('2024-01-15')
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2024年01月15日')
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024')
    })

    it('应该处理时间戳', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime()
      expect(formatDate(timestamp)).toBe('2024-01-15')
    })

    it('应该处理字符串日期', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
      expect(formatDate('2024/01/15')).toBe('2024-01-15')
    })

    it('应该处理无效日期', () => {
      expect(formatDate(new Date('invalid'))).toBe('')
      expect(formatDate(null as any)).toBe('')
      expect(formatDate(undefined as any)).toBe('')
    })
  })

  describe('formatTime', () => {
    it('应该正确格式化时间', () => {
      const date = new Date('2024-01-15T10:30:45')
      expect(formatTime(date)).toBe('10:30')
      expect(formatTime(date, 'HH:mm:ss')).toBe('10:30:45')
      expect(formatTime(date, 'hh:mm A')).toBe('10:30 AM')
    })

    it('应该处理午夜时间', () => {
      const midnight = new Date('2024-01-15T00:00:00')
      expect(formatTime(midnight)).toBe('00:00')
      expect(formatTime(midnight, 'HH:mm:ss')).toBe('00:00:00')
    })

    it('应该处理下午时间', () => {
      const afternoon = new Date('2024-01-15T15:45:30')
      expect(formatTime(afternoon)).toBe('15:45')
      expect(formatTime(afternoon, 'hh:mm A')).toBe('03:45 PM')
    })
  })

  describe('formatSpeed', () => {
    it('应该正确格式化速度', () => {
      expect(formatSpeed(0)).toBe('0.0公里/小时')
      expect(formatSpeed(10)).toBe('10.0公里/小时')
      expect(formatSpeed(10.5)).toBe('10.5公里/小时')
      expect(formatSpeed(100)).toBe('100.0公里/小时')
    })

    it('应该处理不同单位', () => {
      expect(formatSpeed(10, 'm/s')).toBe('10.0米/秒')
      expect(formatSpeed(1000, 'm/min')).toBe('1000.0米/分钟')
    })

    it('应该处理配速格式', () => {
      expect(formatSpeed(10, 'km/h', true)).toBe('6分00秒/公里')
      expect(formatSpeed(12, 'km/h', true)).toBe('5分00秒/公里')
      expect(formatSpeed(15, 'km/h', true)).toBe('4分00秒/公里')
    })

    it('应该处理边界情况', () => {
      expect(formatSpeed(0.1)).toBe('0.1公里/小时')
      expect(formatSpeed(999)).toBe('999.0公里/小时')
    })
  })

  describe('formatHeartRate', () => {
    it('应该正确格式化心率', () => {
      expect(formatHeartRate(0)).toBe('0次/分钟')
      expect(formatHeartRate(60)).toBe('60次/分钟')
      expect(formatHeartRate(100)).toBe('100次/分钟')
      expect(formatHeartRate(180)).toBe('180次/分钟')
    })

    it('应该处理心率区间', () => {
      expect(formatHeartRate(50, 30)).toBe('50次/分钟 (恢复区)')
      expect(formatHeartRate(120, 30)).toBe('120次/分钟 (有氧区)')
      expect(formatHeartRate(160, 30)).toBe('160次/分钟 (无氧区)')
      expect(formatHeartRate(190, 30)).toBe('190次/分钟 (最大区)')
    })

    it('应该处理边界情况', () => {
      expect(formatHeartRate(-1)).toBe('0次/分钟')
      expect(formatHeartRate(300)).toBe('300次/分钟')
    })

    it('应该处理小数心率', () => {
      expect(formatHeartRate(75.5)).toBe('75次/分钟')
      expect(formatHeartRate(75.9)).toBe('75次/分钟')
    })
  })

  describe('formatLocation', () => {
    it('应该正确格式化位置信息', () => {
      const location = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市东城区天安门广场',
        city: '北京市',
        district: '东城区'
      }
      
      expect(formatLocation(location)).toBe('北京市东城区天安门广场')
    })

    it('应该处理只有坐标的情况', () => {
      const location = {
        latitude: 39.9042,
        longitude: 116.4074
      }
      
      expect(formatLocation(location)).toBe('39.90, 116.41')
    })

    it('应该处理只有城市的情况', () => {
      const location = {
        city: '北京市'
      }
      
      expect(formatLocation(location)).toBe('北京市')
    })

    it('应该处理空位置', () => {
      expect(formatLocation(null as any)).toBe('')
      expect(formatLocation(undefined as any)).toBe('')
      expect(formatLocation({} as any)).toBe('')
    })

    it('应该处理精度设置', () => {
      const location = {
        latitude: 39.904212,
        longitude: 116.407395
      }
      
      expect(formatLocation(location, 2)).toBe('39.90, 116.41')
      expect(formatLocation(location, 4)).toBe('39.9042, 116.4074')
      expect(formatLocation(location, 6)).toBe('39.904212, 116.407395')
    })
  })

  describe('错误处理', () => {
    it('应该处理无效输入', () => {
      expect(formatDuration(null as any)).toBe('0分钟')
      expect(formatDuration(undefined as any)).toBe('0分钟')
      expect(formatDuration('invalid' as any)).toBe('0分钟')
      
      expect(formatDistance(null as any)).toBe('0.00公里')
      expect(formatDistance(undefined as any)).toBe('0.00公里')
      expect(formatDistance('invalid' as any)).toBe('0.00公里')
      
      expect(formatCalories(null as any)).toBe('0千卡')
      expect(formatCalories(undefined as any)).toBe('0千卡')
      expect(formatCalories('invalid' as any)).toBe('0千卡')
    })

    it('应该处理极端值', () => {
      expect(formatDuration(Infinity)).toBe('0分钟')
      expect(formatDuration(-Infinity)).toBe('0分钟')
      expect(formatDuration(NaN)).toBe('0分钟')
      
      expect(formatDistance(Infinity)).toBe('Infinity公里')
      expect(formatDistance(-Infinity)).toBe('-Infinity公里')
      expect(formatDistance(NaN)).toBe('NaN公里')
    })
  })

  describe('国际化支持', () => {
    it('应该支持不同的语言格式', () => {
      const date = new Date('2024-01-15T10:30:00')
      
      // 中文格式
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2024年01月15日')
      expect(formatTime(date, '上午HH点mm分')).toBe('上午10点30分')
      
      // 英文格式
      expect(formatDate(date, 'MMMM DD, YYYY')).toBe('January 15, 2024')
      expect(formatTime(date, 'hh:mm A')).toBe('10:30 AM')
    })
  })

  describe('性能优化', () => {
    it('应该缓存重复的计算', () => {
      const start = performance.now()
      
      // 多次调用相同的格式化
      for (let i = 0; i < 1000; i++) {
        formatDuration(60)
        formatDistance(10.5)
        formatCalories(300)
      }
      
      const end = performance.now()
      
      // 验证执行时间在合理范围内
      expect(end - start).toBeLessThan(100) // 100ms内完成1000次调用
    })
  })
})