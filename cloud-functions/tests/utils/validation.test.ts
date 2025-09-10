import {
  validatePhone,
  validateEmail,
  validateIdCard,
  validateUrl,
  validateDate,
  validateNumberRange,
  validateStringLength,
  validateArray,
  validateEnum,
  validateObject,
  validateCoordinate,
  validateSportData,
  validateUserData,
  calculateAge,
  formatDate,
  formatDuration,
  formatDistance,
  formatCalories,
  formatPace,
  validateFileType,
  validateFileSize,
  generateRandomString,
  generateUniqueId,
  maskSensitiveData
} from '../../src/utils/validation'

import { SportType } from '../../src/models/SportRecord'

/**
 * 数据验证工具测试
 * 测试所有验证和格式化函数
 */
describe('Validation Utils', () => {
  describe('手机号验证', () => {
    it('应该验证有效的手机号', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('13900139000')).toBe(true)
      expect(validatePhone('18800188000')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(validatePhone('12345678901')).toBe(false)
      expect(validatePhone('1380013800')).toBe(false)
      expect(validatePhone('138001380000')).toBe(false)
      expect(validatePhone('invalid')).toBe(false)
    })
  })

  describe('邮箱验证', () => {
    it('应该验证有效的邮箱', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.com')).toBe(true)
    })

    it('应该拒绝无效的邮箱', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
    })
  })

  describe('身份证验证', () => {
    it('应该验证有效的身份证', () => {
      expect(validateIdCard('11010519900307283X')).toBe(true)
      expect(validateIdCard('110105199003072831')).toBe(true)
      expect(validateIdCard('110105900307283')).toBe(true)
    })

    it('应该拒绝无效的身份证', () => {
      expect(validateIdCard('123456789012345678')).toBe(false)
      expect(validateIdCard('12345678901')).toBe(false)
      expect(validateIdCard('invalid')).toBe(false)
    })
  })

  describe('URL验证', () => {
    it('应该验证有效的URL', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://subdomain.example.com')).toBe(true)
      expect(validateUrl('https://example.com/path/to/resource')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(validateUrl('not a url')).toBe(false)
      expect(validateUrl('http://')).toBe(false)
      expect(validateUrl('example.com')).toBe(false)
    })
  })

  describe('日期验证', () => {
    it('应该验证有效的日期', () => {
      expect(validateDate(new Date())).toBe(true)
      expect(validateDate(new Date('2024-01-01'))).toBe(true)
    })

    it('应该拒绝无效的日期', () => {
      expect(validateDate(new Date('invalid'))).toBe(false)
      expect(validateDate('not a date')).toBe(false)
      expect(validateDate(null)).toBe(false)
      expect(validateDate(undefined)).toBe(false)
    })
  })

  describe('数字范围验证', () => {
    it('应该验证范围内的数字', () => {
      expect(validateNumberRange(5, 1, 10)).toBe(true)
      expect(validateNumberRange(1, 1, 10)).toBe(true)
      expect(validateNumberRange(10, 1, 10)).toBe(true)
    })

    it('应该拒绝范围外的数字', () => {
      expect(validateNumberRange(0, 1, 10)).toBe(false)
      expect(validateNumberRange(11, 1, 10)).toBe(false)
    })

    it('应该处理非数字输入', () => {
      expect(validateNumberRange(NaN, 1, 10)).toBe(false)
      expect(validateNumberRange('5' as any, 1, 10)).toBe(false)
    })
  })

  describe('字符串长度验证', () => {
    it('应该验证长度范围内的字符串', () => {
      expect(validateStringLength('hello', 3, 10)).toBe(true)
      expect(validateStringLength('hi', 2, 5)).toBe(true)
      expect(validateStringLength('world', 5, 5)).toBe(true)
    })

    it('应该拒绝长度范围外的字符串', () => {
      expect(validateStringLength('hi', 3, 10)).toBe(false)
      expect(validateStringLength('hello world', 3, 10)).toBe(false)
    })

    it('应该处理非字符串输入', () => {
      expect(validateStringLength(123 as any, 3, 10)).toBe(false)
      expect(validateStringLength(null as any, 3, 10)).toBe(false)
    })
  })

  describe('数组验证', () => {
    it('应该验证长度范围内的数组', () => {
      expect(validateArray([1, 2, 3], 1, 5)).toBe(true)
      expect(validateArray([1], 1, 5)).toBe(true)
      expect(validateArray([1, 2, 3, 4, 5], 5, 5)).toBe(true)
    })

    it('应该拒绝长度范围外的数组', () => {
      expect(validateArray([], 1, 5)).toBe(false)
      expect(validateArray([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false)
    })

    it('应该处理非数组输入', () => {
      expect(validateArray('not array' as any, 1, 5)).toBe(false)
      expect(validateArray({} as any, 1, 5)).toBe(false)
    })
  })

  describe('枚举验证', () => {
    it('应该验证有效的枚举值', () => {
      expect(validateEnum(SportType.RUNNING, SportType)).toBe(true)
      expect(validateEnum('running', SportType)).toBe(true)
    })

    it('应该拒绝无效的枚举值', () => {
      expect(validateEnum('invalid', SportType)).toBe(false)
      expect(validateEnum(123, SportType)).toBe(false)
    })
  })

  describe('对象验证', () => {
    it('应该验证对象结构', () => {
      expect(validateObject({})).toBe(true)
      expect(validateObject({ name: 'test' })).toBe(true)
    })

    it('应该验证必需字段', () => {
      const obj = { name: 'test', age: 25 }
      expect(validateObject(obj, ['name', 'age'])).toBe(true)
      expect(validateObject(obj, ['name'])).toBe(true)
    })

    it('应该拒绝缺少必需字段的对象', () => {
      const obj = { name: 'test' }
      expect(validateObject(obj, ['name', 'age'])).toBe(false)
    })

    it('应该处理非对象输入', () => {
      expect(validateObject(null)).toBe(false)
      expect(validateObject('string')).toBe(false)
      expect(validateObject(123)).toBe(false)
    })
  })

  describe('坐标验证', () => {
    it('应该验证有效的坐标', () => {
      expect(validateCoordinate(39.9042, 116.4074)).toBe(true)
      expect(validateCoordinate(0, 0)).toBe(true)
      expect(validateCoordinate(-90, -180)).toBe(true)
      expect(validateCoordinate(90, 180)).toBe(true)
    })

    it('应该拒绝无效的坐标', () => {
      expect(validateCoordinate(-91, 116.4074)).toBe(false)
      expect(validateCoordinate(91, 116.4074)).toBe(false)
      expect(validateCoordinate(39.9042, -181)).toBe(false)
      expect(validateCoordinate(39.9042, 181)).toBe(false)
    })
  })

  describe('运动数据验证', () => {
    it('应该验证有效的运动数据', () => {
      expect(validateSportData({
        duration: 60,
        distance: 10,
        calories: 500,
        steps: 10000
      })).toEqual({ valid: true })
    })

    it('应该拒绝无效的运动数据', () => {
      expect(validateSportData({ duration: -1 })).toEqual({
        valid: false,
        error: '运动时长必须大于0'
      })

      expect(validateSportData({ distance: -5 })).toEqual({
        valid: false,
        error: '运动距离不能为负数'
      })

      expect(validateSportData({ calories: -100 })).toEqual({
        valid: false,
        error: '消耗卡路里不能为负数'
      })

      expect(validateSportData({ steps: -1000 })).toEqual({
        valid: false,
        error: '步数不能为负数'
      })
    })
  })

  describe('用户数据验证', () => {
    it('应该验证有效的用户数据', () => {
      expect(validateUserData({
        nickName: '测试用户',
        phone: '13800138000',
        email: 'test@example.com',
        height: 175,
        weight: 70,
        birthday: new Date('1990-01-01')
      })).toEqual({ valid: true })
    })

    it('应该拒绝无效的用户数据', () => {
      expect(validateUserData({ nickName: '' })).toEqual({
        valid: false,
        error: '昵称长度必须在1-50个字符之间'
      })

      expect(validateUserData({ phone: '12345678901' })).toEqual({
        valid: false,
        error: '手机号格式不正确'
      })

      expect(validateUserData({ email: 'invalid' })).toEqual({
        valid: false,
        error: '邮箱格式不正确'
      })

      expect(validateUserData({ height: 300 })).toEqual({
        valid: false,
        error: '身高必须在50-250cm之间'
      })

      expect(validateUserData({ weight: 500 })).toEqual({
        valid: false,
        error: '体重必须在20-300kg之间'
      })
    })
  })

  describe('年龄计算', () => {
    it('应该正确计算年龄', () => {
      const birthday = new Date('1990-01-01')
      const age = calculateAge(birthday)
      
      expect(age).toBeGreaterThan(30)
      expect(age).toBeLessThan(50)
    })

    it('应该处理今天的生日', () => {
      const today = new Date()
      const birthday = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      const age = calculateAge(birthday)
      
      expect(age).toBe(25)
    })
  })

  describe('日期格式化', () => {
    it('应该格式化日期', () => {
      const date = new Date('2024-01-15T14:30:45')
      
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/15')
      expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45')
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 14:30:45')
    })
  })

  describe('时长格式化', () => {
    it('应该格式化时长', () => {
      expect(formatDuration(0)).toBe('0分钟')
      expect(formatDuration(30)).toBe('30分钟')
      expect(formatDuration(60)).toBe('1小时')
      expect(formatDuration(90)).toBe('1小时30分钟')
      expect(formatDuration(150)).toBe('2小时30分钟')
    })
  })

  describe('距离格式化', () => {
    it('应该格式化距离', () => {
      expect(formatDistance(0)).toBe('0公里')
      expect(formatDistance(0.05)).toBe('50米')
      expect(formatDistance(0.5)).toBe('500米')
      expect(formatDistance(1)).toBe('1.00公里')
      expect(formatDistance(10.5)).toBe('10.50公里')
    })
  })

  describe('卡路里格式化', () => {
    it('应该格式化卡路里', () => {
      expect(formatCalories(0)).toBe('0卡')
      expect(formatCalories(500)).toBe('500卡')
      expect(formatCalories(999)).toBe('999卡')
      expect(formatCalories(1000)).toBe('1.0千卡')
      expect(formatCalories(1500)).toBe('1.5千卡')
      expect(formatCalories(5000)).toBe('5.0千卡')
    })
  })

  describe('配速格式化', () => {
    it('应该格式化配速', () => {
      expect(formatPace(6)).toBe("6'00\"")
      expect(formatPace(6.5)).toBe("6'30\"")
      expect(formatPace(5.75)).toBe("5'45\"")
      expect(formatPace(7.25)).toBe("7'15\"")
    })
  })

  describe('文件验证', () => {
    it('应该验证文件类型', () => {
      expect(validateFileType('test.jpg', ['jpg', 'png'])).toBe(true)
      expect(validateFileType('test.PNG', ['jpg', 'png'])).toBe(true)
      expect(validateFileType('test.pdf', ['jpg', 'png'])).toBe(false)
      expect(validateFileType('test', ['jpg', 'png'])).toBe(false)
    })

    it('应该验证文件大小', () => {
      expect(validateFileSize(1024, 2048)).toBe(true)
      expect(validateFileSize(2048, 2048)).toBe(true)
      expect(validateFileSize(4096, 2048)).toBe(false)
    })
  })

  describe('随机生成器', () => {
    it('应该生成随机字符串', () => {
      const str1 = generateRandomString(8)
      const str2 = generateRandomString(8)
      
      expect(str1).toHaveLength(8)
      expect(str2).toHaveLength(8)
      expect(str1).not.toBe(str2)
      expect(str1).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('应该生成唯一ID', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(10)
    })

    it('应该支持带前缀的唯一ID', () => {
      const id = generateUniqueId('user_')
      expect(id.startsWith('user_')).toBe(true)
    })
  })

  describe('数据脱敏', () => {
    it('应该脱敏敏感数据', () => {
      expect(maskSensitiveData('13800138000')).toBe('138****8000')
      expect(maskSensitiveData('123456789')).toBe('123**6789')
      expect(maskSensitiveData('12345')).toBe('12345')
    })

    it('应该支持自定义脱敏位置', () => {
      expect(maskSensitiveData('13800138000', 3, 4)).toBe('138****8000')
      expect(maskSensitiveData('123456789', 2, 3)).toBe('12****789')
    })
  })
})