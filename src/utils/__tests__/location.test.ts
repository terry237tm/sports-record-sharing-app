/**
 * 地理位置工具函数测试
 * 测试坐标验证、距离计算、格式化等功能
 */

import {
  validateCoordinates,
  calculateDistance,
  formatCoordinates,
  formatAddress,
  formatDistance,
  formatAccuracy,
  isLocationInChina,
  gcj02ToWgs84,
  calculateBearing,
  getAccuracyColorClass,
  createLocationData,
  isSameLocation,
  generateLocationId
} from '../location'

describe('地理位置工具函数', () => {
  describe('validateCoordinates', () => {
    it('应该验证有效坐标', () => {
      expect(validateCoordinates(39.9042, 116.4074)).toBe(true)
      expect(validateCoordinates(0, 0)).toBe(true)
      expect(validateCoordinates(-90, -180)).toBe(true)
      expect(validateCoordinates(90, 180)).toBe(true)
    })

    it('应该拒绝无效坐标', () => {
      expect(validateCoordinates(91, 116.4074)).toBe(false) // 纬度超出范围
      expect(validateCoordinates(-91, 116.4074)).toBe(false)
      expect(validateCoordinates(39.9042, 181)).toBe(false) // 经度超出范围
      expect(validateCoordinates(39.9042, -181)).toBe(false)
      expect(validateCoordinates(NaN, 116.4074)).toBe(false) // NaN值
      expect(validateCoordinates(39.9042, NaN)).toBe(false)
    })
  })

  describe('calculateDistance', () => {
    it('应该正确计算两点间距离', () => {
      // 天安门到王府井（约1.5公里）
      const distance = calculateDistance(39.9042, 116.4074, 39.915, 116.42)
      expect(distance).toBeGreaterThan(1400) // 大于1400米
      expect(distance).toBeLessThan(1700) // 小于1700米
    })

    it('应该处理相同位置', () => {
      const distance = calculateDistance(39.9042, 116.4074, 39.9042, 116.4074)
      expect(distance).toBe(0)
    })

    it('应该处理无效坐标', () => {
      const distance = calculateDistance(999, 116.4074, 39.915, 116.42)
      expect(distance).toBe(-1)
    })

    it('应该处理跨赤道距离', () => {
      // 赤道两侧对称点
      const distance = calculateDistance(10, 0, -10, 0)
      expect(distance).toBeGreaterThan(2200000) // 约2200公里
    })

    it('应该处理国际距离', () => {
      // 北京到纽约（约11000公里）
      const distance = calculateDistance(39.9042, 116.4074, 40.7128, -74.0060)
      expect(distance).toBeGreaterThan(10000000) // 大于10000公里
      expect(distance).toBeLessThan(12000000) // 小于12000公里
    })
  })

  describe('formatCoordinates', () => {
    it('应该正确格式化坐标', () => {
      expect(formatCoordinates(39.9042, 116.4074)).toBe('39.904200, 116.407400')
      expect(formatCoordinates(39.9042, 116.4074, 2)).toBe('39.90, 116.41')
      expect(formatCoordinates(0, 0, 4)).toBe('0.0000, 0.0000')
    })

    it('应该处理无效坐标', () => {
      expect(formatCoordinates(999, 116.4074)).toBe('无效坐标')
      expect(formatCoordinates(39.9042, NaN)).toBe('无效坐标')
    })
  })

  describe('formatAddress', () => {
    const mockLocation = {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市东城区天安门广场',
      city: '北京市',
      district: '东城区',
      province: '北京市',
      country: '中国',
      poi: '天安门广场',
      accuracy: 10,
      timestamp: Date.now()
    }

    it('应该格式化完整地址', () => {
      expect(formatAddress(mockLocation, 'full')).toBe('北京市东城区天安门广场')
    })

    it('应该格式化简短地址', () => {
      expect(formatAddress(mockLocation, 'short')).toBe('北京市东城区天安门广场')
    })

    it('应该格式化城市级别地址', () => {
      expect(formatAddress(mockLocation, 'city')).toBe('北京市北京市东城区')
    })

    it('应该处理空地址', () => {
      const locationWithoutAddress = { ...mockLocation, address: '' }
      const result = formatAddress(locationWithoutAddress, 'full')
      expect(result).toContain('39.904200')
      expect(result).toContain('116.407400')
    })
  })

  describe('formatDistance', () => {
    it('应该格式化短距离（米）', () => {
      expect(formatDistance(0)).toBe('0米')
      expect(formatDistance(100)).toBe('100米')
      expect(formatDistance(999)).toBe('999米')
    })

    it('应该格式化长距离（公里）', () => {
      expect(formatDistance(1000)).toBe('1.0公里')
      expect(formatDistance(1500)).toBe('1.5公里')
      expect(formatDistance(10000)).toBe('10.0公里')
      expect(formatDistance(100000)).toBe('100.0公里')
    })

    it('应该处理负距离', () => {
      expect(formatDistance(-100)).toBe('未知距离')
    })
  })

  describe('formatAccuracy', () => {
    it('应该格式化高精度', () => {
      expect(formatAccuracy(5)).toBe('高精度')
      expect(formatAccuracy(9)).toBe('高精度')
    })

    it('应该格式化中等精度', () => {
      expect(formatAccuracy(10)).toBe('中等精度')
      expect(formatAccuracy(49)).toBe('中等精度')
    })

    it('应该格式化低精度', () => {
      expect(formatAccuracy(50)).toBe('低精度')
      expect(formatAccuracy(100)).toBe('低精度')
    })

    it('应该处理无效精度', () => {
      expect(formatAccuracy(undefined)).toBe('未知精度')
      expect(formatAccuracy(0)).toBe('未知精度')
      expect(formatAccuracy(-10)).toBe('未知精度')
    })
  })

  describe('isLocationInChina', () => {
    it('应该识别中国境内位置', () => {
      expect(isLocationInChina(39.9042, 116.4074)).toBe(true) // 北京
      expect(isLocationInChina(23.1291, 113.2644)).toBe(true) // 广州
      expect(isLocationInChina(45.7489, 126.6382)).toBe(true) // 哈尔滨
      expect(isLocationInChina(18.2528, 109.5119)).toBe(true) // 三亚
    })

    it('应该识别中国境外位置', () => {
      expect(isLocationInChina(40.7128, -74.0060)).toBe(false) // 纽约
      expect(isLocationInChina(51.5074, -0.1278)).toBe(false) // 伦敦
      expect(isLocationInChina(35.6762, 139.6503)).toBe(false) // 东京
      expect(isLocationInChina(-33.8688, 151.2093)).toBe(false) // 悉尼
    })

    it('应该处理边界情况', () => {
      expect(isLocationInChina(54, 135)).toBe(true) // 东北角
      expect(isLocationInChina(18, 73)).toBe(true) // 西南角
      expect(isLocationInChina(54.1, 135)).toBe(false) // 超出纬度
      expect(isLocationInChina(54, 135.1)).toBe(false) // 超出经度
    })
  })

  describe('gcj02ToWgs84', () => {
    it('应该转换中国境内坐标', () => {
      const result = gcj02ToWgs84(39.9042, 116.4074)
      expect(result.lat).toBeCloseTo(39.9028, 3)
      expect(result.lon).toBeCloseTo(116.4055, 3)
      
      // 验证转换后的坐标有轻微偏移
      expect(Math.abs(result.lat - 39.9042)).toBeGreaterThan(0)
      expect(Math.abs(result.lon - 116.4074)).toBeGreaterThan(0)
    })

    it('应该跳过中国境外坐标转换', () => {
      const result = gcj02ToWgs84(40.7128, -74.0060) // 纽约
      expect(result.lat).toBe(40.7128)
      expect(result.lon).toBe(-74.0060)
    })
  })

  describe('calculateBearing', () => {
    it('应该计算正确的方位角', () => {
      // 正北方向
      const bearing1 = calculateBearing(39.9042, 116.4074, 40.9042, 116.4074)
      expect(bearing1).toBeCloseTo(0, 1)
      
      // 正东方向
      const bearing2 = calculateBearing(39.9042, 116.4074, 39.9042, 117.4074)
      expect(bearing2).toBeCloseTo(90, 0) // 降低精度要求
      
      // 正南方向
      const bearing3 = calculateBearing(39.9042, 116.4074, 38.9042, 116.4074)
      expect(bearing3).toBeCloseTo(180, 1)
      
      // 正西方向
      const bearing4 = calculateBearing(39.9042, 116.4074, 39.9042, 115.4074)
      expect(bearing4).toBeCloseTo(270, 1)
    })

    it('应该处理无效坐标', () => {
      const bearing = calculateBearing(999, 116.4074, 39.915, 116.42)
      expect(bearing).toBe(0)
    })
  })

  describe('getAccuracyColorClass', () => {
    it('应该返回高精度颜色', () => {
      expect(getAccuracyColorClass(5)).toBe('text-success')
      expect(getAccuracyColorClass(9)).toBe('text-success')
    })

    it('应该返回中等精度颜色', () => {
      expect(getAccuracyColorClass(10)).toBe('text-warning')
      expect(getAccuracyColorClass(49)).toBe('text-warning')
    })

    it('应该返回低精度颜色', () => {
      expect(getAccuracyColorClass(50)).toBe('text-danger')
      expect(getAccuracyColorClass(100)).toBe('text-danger')
    })

    it('应该处理无效精度', () => {
      expect(getAccuracyColorClass(undefined)).toBe('text-secondary')
      expect(getAccuracyColorClass(null as any)).toBe('text-secondary')
    })
  })

  describe('createLocationData', () => {
    it('应该创建完整的位置数据', () => {
      const location = createLocationData(39.9042, 116.4074, '北京市', {
        city: '北京市',
        district: '东城区',
        accuracy: 10
      })

      expect(location.latitude).toBe(39.9042)
      expect(location.longitude).toBe(116.4074)
      expect(location.address).toBe('北京市')
      expect(location.city).toBe('北京市')
      expect(location.district).toBe('东城区')
      expect(location.accuracy).toBe(10)
      expect(location.timestamp).toBeDefined()
    })

    it('应该使用默认地址', () => {
      const location = createLocationData(39.9042, 116.4074)
      expect(location.address).toContain('39.904200')
      expect(location.address).toContain('116.407400')
    })
  })

  describe('isSameLocation', () => {
    const location1 = {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '位置1'
    }

    const location2 = {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '位置2'
    }

    const location3 = {
      latitude: 39.915,
      longitude: 116.42,
      address: '位置3'
    }

    it('应该识别相同位置', () => {
      expect(isSameLocation(location1, location2)).toBe(true)
    })

    it('应该识别不同位置', () => {
      expect(isSameLocation(location1, location3)).toBe(false)
    })

    it('应该使用自定义精度', () => {
      const closeLocation = {
        latitude: 39.9043, // 相差0.0001
        longitude: 116.4074,
        address: '接近位置'
      }

      expect(isSameLocation(location1, closeLocation, 0.0002)).toBe(true)
      expect(isSameLocation(location1, closeLocation, 0.00005)).toBe(false)
    })
  })

  describe('generateLocationId', () => {
    it('应该生成唯一的位置ID', () => {
      const location = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '测试位置'
      }

      const id = generateLocationId(location)
      expect(id).toBe('39.904200-116.407400')
    })

    it('应该为相同坐标生成相同ID', () => {
      const location1 = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '位置1'
      }

      const location2 = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '位置2'
      }

      expect(generateLocationId(location1)).toBe(generateLocationId(location2))
    })

    it('应该为不同坐标生成不同ID', () => {
      const location1 = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '位置1'
      }

      const location2 = {
        latitude: 39.915,
        longitude: 116.42,
        address: '位置2'
      }

      expect(generateLocationId(location1)).not.toBe(generateLocationId(location2))
    })
  })
})