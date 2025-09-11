/**
 * 数据工厂
 * 提供各种测试数据的生成器
 */

/**
 * 运动类型枚举
 */
export const SPORT_TYPES = {
  RUNNING: 'running',
  WALKING: 'walking',
  CYCLING: 'cycling',
  SWIMMING: 'swimming',
  FITNESS: 'fitness',
  BASKETBALL: 'basketball',
  FOOTBALL: 'football',
  TENNIS: 'tennis',
  BADMINTON: 'badminton',
  YOGA: 'yoga'
}

/**
 * 运动类型配置
 */
export const SPORT_TYPE_CONFIG = {
  [SPORT_TYPES.RUNNING]: {
    name: '跑步',
    icon: '🏃‍♂️',
    unit: '公里',
    color: '#FF6B6B',
    calorieRate: 60 // 每分钟消耗的卡路里
  },
  [SPORT_TYPES.WALKING]: {
    name: '步行',
    icon: '🚶‍♂️',
    unit: '公里',
    color: '#4ECDC4',
    calorieRate: 30
  },
  [SPORT_TYPES.CYCLING]: {
    name: '骑行',
    icon: '🚴‍♂️',
    unit: '公里',
    color: '#45B7D1',
    calorieRate: 45
  },
  [SPORT_TYPES.SWIMMING]: {
    name: '游泳',
    icon: '🏊‍♂️',
    unit: '米',
    color: '#96CEB4',
    calorieRate: 70
  },
  [SPORT_TYPES.FITNESS]: {
    name: '健身',
    icon: '💪',
    unit: '分钟',
    color: '#FFEAA7',
    calorieRate: 50
  },
  [SPORT_TYPES.BASKETBALL]: {
    name: '篮球',
    icon: '🏀',
    unit: '分钟',
    color: '#DDA0DD',
    calorieRate: 55
  },
  [SPORT_TYPES.FOOTBALL]: {
    name: '足球',
    icon: '⚽',
    unit: '分钟',
    color: '#98D8C8',
    calorieRate: 60
  },
  [SPORT_TYPES.TENNIS]: {
    name: '网球',
    icon: '🎾',
    unit: '分钟',
    color: '#F7DC6F',
    calorieRate: 50
  },
  [SPORT_TYPES.BADMINTON]: {
    name: '羽毛球',
    icon: '🏸',
    unit: '分钟',
    color: '#BB8FCE',
    calorieRate: 45
  },
  [SPORT_TYPES.YOGA]: {
    name: '瑜伽',
    icon: '🧘‍♀️',
    unit: '分钟',
    color: '#85C1E9',
    calorieRate: 25
  }
}

/**
 * 生成随机ID
 * @param {string} prefix - ID前缀
 * @returns {string}
 */
export const generateId = (prefix = 'test') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成随机日期
 * @param {Date} start - 开始日期
 * @param {Date} end - 结束日期
 * @returns {Date}
 */
export const generateRandomDate = (start = new Date(2024, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * 生成运动记录数据
 * @param {Object} options - 选项
 * @returns {Object}
 */
export const createSportRecordData = (options = {}) => {
  const {
    sportType = SPORT_TYPES.RUNNING,
    duration = Math.floor(Math.random() * 120) + 10, // 10-130分钟
    distance = Math.random() * 20 + 1, // 1-21公里
    hasLocation = true,
    hasImages = Math.random() > 0.5,
    hasDescription = Math.random() > 0.3
  } = options

  const config = SPORT_TYPE_CONFIG[sportType]
  const calories = Math.floor(duration * config.calorieRate)
  const steps = sportType === SPORT_TYPES.RUNNING || sportType === SPORT_TYPES.WALKING 
    ? Math.floor(distance * 1000) 
    : null
  const heartRate = Math.floor(Math.random() * 60) + 80 // 80-140

  return {
    _id: generateId('record'),
    openid: generateId('user'),
    sportType,
    data: {
      duration,
      distance: Math.round(distance * 100) / 100, // 保留两位小数
      calories,
      heartRate,
      steps
    },
    images: hasImages ? [
      '/tmp/test1.jpg',
      '/tmp/test2.jpg',
      '/tmp/test3.jpg'
    ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
    description: hasDescription ? generateRandomDescription(sportType) : '',
    location: hasLocation ? createMockLocation() : null,
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    isDeleted: false
  }
}

/**
 * 生成随机描述
 * @param {string} sportType - 运动类型
 * @returns {string}
 */
const generateRandomDescription = (sportType) => {
  const descriptions = {
    [SPORT_TYPES.RUNNING]: [
      '今天跑步感觉很棒！',
      '突破了自己的记录！',
      '天气很好，适合跑步',
      '坚持就是胜利！',
      '跑步让我充满活力'
    ],
    [SPORT_TYPES.WALKING]: [
      '散步很舒服',
      '边走边欣赏风景',
      '轻松的步行时光',
      '走路也能锻炼身体',
      '慢慢走，欣赏沿途风景'
    ],
    [SPORT_TYPES.CYCLING]: [
      '骑行很畅快！',
      '风吹过的感觉很棒',
      '骑行让我自由',
      '一路骑行，一路风景',
      '骑行是最佳的运动'
    ],
    [SPORT_TYPES.SWIMMING]: [
      '游泳很放松',
      '水中运动很舒适',
      '游泳让我身心愉悦',
      '畅游在泳池中',
      '游泳是最好的全身运动'
    ],
    [SPORT_TYPES.FITNESS]: [
      '健身让我更强壮',
      '今天的训练很有效',
      '健身需要坚持',
      '肌肉在成长',
      '健身让我自信'
    ]
  }

  const sportDescriptions = descriptions[sportType] || descriptions[SPORT_TYPES.RUNNING]
  return sportDescriptions[Math.floor(Math.random() * sportDescriptions.length)]
}

/**
 * 创建模拟位置信息
 * @param {Object} options - 选项
 * @returns {Object}
 */
export const createMockLocation = (options = {}) => {
  const locations = [
    {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市东城区天安门广场',
      city: '北京市',
      district: '东城区'
    },
    {
      latitude: 31.2304,
      longitude: 121.4737,
      address: '上海市黄浦区外滩',
      city: '上海市',
      district: '黄浦区'
    },
    {
      latitude: 23.1291,
      longitude: 113.2644,
      address: '广东省广州市天河区',
      city: '广州市',
      district: '天河区'
    },
    {
      latitude: 30.5728,
      longitude: 104.0668,
      address: '四川省成都市锦江区',
      city: '成都市',
      district: '锦江区'
    }
  ]

  const location = locations[Math.floor(Math.random() * locations.length)]
  
  return {
    ...location,
    ...options
  }
}

/**
 * 创建模拟用户信息
 * @param {Object} options - 选项
 * @returns {Object}
 */
export const createMockUser = (options = {}) => {
  const nicknames = ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小美']
  const avatars = [
    '/assets/images/avatar1.png',
    '/assets/images/avatar2.png',
    '/assets/images/avatar3.png',
    '/assets/images/avatar4.png'
  ]
  
  return {
    openid: generateId('user'),
    nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    gender: Math.floor(Math.random() * 3), // 0: 未知, 1: 男, 2: 女
    city: ['北京市', '上海市', '广州市', '深圳市', '成都市'][Math.floor(Math.random() * 5)],
    province: ['北京市', '上海市', '广东省', '广东省', '四川省'][Math.floor(Math.random() * 5)],
    country: '中国',
    language: 'zh_CN',
    ...options
  }
}

/**
 * 创建分享数据
 * @param {Object} options - 选项
 * @returns {Object}
 */
export const createMockShareData = (options = {}) => {
  const sportRecord = createSportRecordData()
  const user = createMockUser()
  const config = SPORT_TYPE_CONFIG[sportRecord.sportType]
  
  return {
    userInfo: {
      avatar: user.avatar,
      nickname: user.nickname
    },
    sportRecord: {
      sportType: config.name,
      sportTypeIcon: config.icon,
      data: sportRecord.data,
      description: sportRecord.description,
      location: sportRecord.location?.address || '',
      createdAt: sportRecord.createdAt.toLocaleString('zh-CN')
    },
    images: sportRecord.images,
    ...options
  }
}

/**
 * 创建运动统计信息
 * @param {Object} options - 选项
 * @returns {Object}
 */
export const createMockSportStats = (options = {}) => {
  const totalRecords = Math.floor(Math.random() * 100) + 10
  const thisWeekRecords = Math.floor(Math.random() * 20) + 1
  const thisMonthRecords = Math.floor(Math.random() * 50) + 5
  
  return {
    totalRecords,
    thisWeekRecords,
    thisMonthRecords,
    totalDistance: Math.floor(Math.random() * 1000) + 100,
    totalDuration: Math.floor(Math.random() * 1000) + 100,
    totalCalories: Math.floor(Math.random() * 10000) + 1000,
    averageDuration: Math.floor(Math.random() * 60) + 20,
    averageDistance: Math.round((Math.random() * 10 + 2) * 100) / 100,
    ...options
  }
}

/**
 * 创建分页数据
 * @param {Array} items - 数据项
 * @param {Object} options - 分页选项
 * @returns {Object}
 */
export const createMockPagination = (items = [], options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    total = items.length || Math.floor(Math.random() * 100) + 50
  } = options
  
  const totalPages = Math.ceil(total / pageSize)
  const hasNext = page < totalPages
  const hasPrev = page > 1
  
  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    start: (page - 1) * pageSize + 1,
    end: Math.min(page * pageSize, total)
  }
}

/**
 * 创建API响应数据
 * @param {any} data - 响应数据
 * @param {Object} options - 响应选项
 * @returns {Object}
 */
export const createMockApiResponse = (data = null, options = {}) => {
  const {
    success = true,
    message = '',
    code = 0,
    timestamp = Date.now()
  } = options
  
  return {
    success,
    code,
    message,
    data,
    timestamp
  }
}

/**
 * 创建错误响应
 * @param {string} message - 错误消息
 * @param {Object} options - 错误选项
 * @returns {Object}
 */
export const createMockErrorResponse = (message = '请求失败', options = {}) => {
  const {
    code = -1,
    status = 500,
    data = null
  } = options
  
  return {
    success: false,
    code,
    message,
    data,
    timestamp: Date.now()
  }
}

/**
 * 数据工厂默认导出
 */
export default {
  SPORT_TYPES,
  SPORT_TYPE_CONFIG,
  generateId,
  generateRandomDate,
  createSportRecordData,
  createMockLocation,
  createMockUser,
  createMockShareData,
  createMockSportStats,
  createMockPagination,
  createMockApiResponse,
  createMockErrorResponse
}