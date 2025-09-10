/**
 * 云函数常量定义
 */

// 数据库集合名称
export const COLLECTIONS = {
  SPORT_RECORDS: 'sport_records',
  USERS: 'users',
  STATISTICS: 'statistics',
  IMAGES: 'images',
  SHARES: 'shares'
} as const

// 运动类型
export const SPORT_TYPES = {
  RUNNING: 'running',
  CYCLING: 'cycling',
  FITNESS: 'fitness',
  HIKING: 'hiking',
  SWIMMING: 'swimming',
  BASKETBALL: 'basketball',
  FOOTBALL: 'football',
  BADMINTON: 'badminton',
  TENNIS: 'tennis',
  OTHER: 'other'
} as const

// 运动类型显示名称
export const SPORT_TYPE_LABELS: Record<string, string> = {
  [SPORT_TYPES.RUNNING]: '跑步',
  [SPORT_TYPES.CYCLING]: '骑行',
  [SPORT_TYPES.FITNESS]: '健身',
  [SPORT_TYPES.HIKING]: '徒步',
  [SPORT_TYPES.SWIMMING]: '游泳',
  [SPORT_TYPES.BASKETBALL]: '篮球',
  [SPORT_TYPES.FOOTBALL]: '足球',
  [SPORT_TYPES.BADMINTON]: '羽毛球',
  [SPORT_TYPES.TENNIS]: '网球',
  [SPORT_TYPES.OTHER]: '其他'
}

// 运动类型图标
export const SPORT_TYPE_ICONS: Record<string, string> = {
  [SPORT_TYPES.RUNNING]: '🏃‍♂️',
  [SPORT_TYPES.CYCLING]: '🚴‍♂️',
  [SPORT_TYPES.FITNESS]: '💪',
  [SPORT_TYPES.HIKING]: '🥾',
  [SPORT_TYPES.SWIMMING]: '🏊‍♂️',
  [SPORT_TYPES.BASKETBALL]: '⛹️‍♂️',
  [SPORT_TYPES.FOOTBALL]: '⚽',
  [SPORT_TYPES.BADMINTON]: '🏸',
  [SPORT_TYPES.TENNIS]: '🎾',
  [SPORT_TYPES.OTHER]: '🏃‍♂️'
}

// 验证规则
export const VALIDATION_RULES = {
  DURATION: {
    MIN: 1,
    MAX: 1440, // 24小时
    MESSAGE: '运动时长应在1-1440分钟之间'
  },
  DISTANCE: {
    MIN: 0.1,
    MAX: 200, // 200公里
    MESSAGE: '运动距离应在0.1-200公里之间'
  },
  CALORIES: {
    MIN: 10,
    MAX: 5000,
    MESSAGE: '消耗卡路里应在10-5000之间'
  },
  HEART_RATE: {
    MIN: 40,
    MAX: 220,
    MESSAGE: '心率应在40-220之间'
  },
  STEPS: {
    MIN: 1,
    MAX: 100000,
    MESSAGE: '步数应在1-100000之间'
  },
  DESCRIPTION: {
    MAX: 500,
    MESSAGE: '运动描述最多500字'
  },
  IMAGES: {
    MAX_COUNT: 9,
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ACCEPT_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    ACCEPT_TYPES_TEXT: 'JPG、JPEG、PNG'
  }
} as const

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1
} as const

// 错误代码
export const ERROR_CODES = {
  // 通用错误
  SUCCESS: 0,
  UNKNOWN_ERROR: 1000,
  INVALID_PARAMS: 1001,
  DATABASE_ERROR: 1002,
  NETWORK_ERROR: 1003,
  
  // 验证错误
  VALIDATION_FAILED: 2000,
  INVALID_SPORT_TYPE: 2001,
  INVALID_DURATION: 2002,
  INVALID_DISTANCE: 2003,
  INVALID_CALORIES: 2004,
  INVALID_DESCRIPTION: 2005,
  INVALID_IMAGES: 2006,
  
  // 权限错误
  PERMISSION_DENIED: 3000,
  NOT_LOGGED_IN: 3001,
  SESSION_EXPIRED: 3002,
  
  // 业务错误
  RECORD_NOT_FOUND: 4000,
  RECORD_ALREADY_DELETED: 4001,
  RECORD_NOT_OWNER: 4002,
  TOO_MANY_REQUESTS: 4003,
  
  // 文件相关错误
  FILE_TOO_LARGE: 5000,
  INVALID_FILE_TYPE: 5001,
  FILE_UPLOAD_FAILED: 5002,
  
  // 位置相关错误
  LOCATION_NOT_FOUND: 6000,
  LOCATION_SERVICE_DISABLED: 6001
} as const

// 错误消息
export const ERROR_MESSAGES: Record<number, string> = {
  [ERROR_CODES.SUCCESS]: '成功',
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误',
  [ERROR_CODES.INVALID_PARAMS]: '参数错误',
  [ERROR_CODES.DATABASE_ERROR]: '数据库错误',
  [ERROR_CODES.NETWORK_ERROR]: '网络错误',
  [ERROR_CODES.VALIDATION_FAILED]: '验证失败',
  [ERROR_CODES.INVALID_SPORT_TYPE]: '无效的运动类型',
  [ERROR_CODES.INVALID_DURATION]: '运动时长无效',
  [ERROR_CODES.INVALID_DISTANCE]: '运动距离无效',
  [ERROR_CODES.INVALID_CALORIES]: '卡路里数据无效',
  [ERROR_CODES.INVALID_DESCRIPTION]: '描述内容无效',
  [ERROR_CODES.INVALID_IMAGES]: '图片数据无效',
  [ERROR_CODES.PERMISSION_DENIED]: '权限不足',
  [ERROR_CODES.NOT_LOGGED_IN]: '用户未登录',
  [ERROR_CODES.SESSION_EXPIRED]: '会话已过期',
  [ERROR_CODES.RECORD_NOT_FOUND]: '记录不存在',
  [ERROR_CODES.RECORD_ALREADY_DELETED]: '记录已被删除',
  [ERROR_CODES.RECORD_NOT_OWNER]: '不是记录的所有者',
  [ERROR_CODES.TOO_MANY_REQUESTS]: '请求过于频繁',
  [ERROR_CODES.FILE_TOO_LARGE]: '文件过大',
  [ERROR_CODES.INVALID_FILE_TYPE]: '文件类型不支持',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ERROR_CODES.LOCATION_NOT_FOUND]: '位置信息未找到',
  [ERROR_CODES.LOCATION_SERVICE_DISABLED]: '位置服务未开启'
}

// 响应状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// 时间配置
export const TIME_CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24小时
  TOKEN_TTL: 7 * 24 * 60 * 60 * 1000, // 7天
  IMAGE_URL_TTL: 30 * 24 * 60 * 60 * 1000, // 30天
  STATISTICS_CACHE_TTL: 60 * 60 * 1000 // 1小时
} as const

// 云函数配置
export const CLOUD_FUNCTION_CONFIG = {
  TIMEOUT: 30, // 30秒
  MEMORY_SIZE: 512, // 512MB
  MAX_CONCURRENCY: 100,
  RETRY_TIMES: 3
} as const

// 限流配置
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1分钟窗口
  MAX_REQUESTS: 60, // 每分钟最多60次请求
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false
} as const

// 默认响应配置
export const DEFAULT_RESPONSE = {
  SUCCESS: {
    code: ERROR_CODES.SUCCESS,
    message: ERROR_MESSAGES[ERROR_CODES.SUCCESS]
  },
  ERROR: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  }
} as const

// 导出所有常量
export default {
  COLLECTIONS,
  SPORT_TYPES,
  SPORT_TYPE_LABELS,
  SPORT_TYPE_ICONS,
  VALIDATION_RULES,
  PAGINATION,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
  TIME_CONFIG,
  CLOUD_FUNCTION_CONFIG,
  RATE_LIMIT,
  DEFAULT_RESPONSE
}