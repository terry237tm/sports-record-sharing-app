/**
 * 应用常量定义
 * 定义应用级别的配置值、默认值、限制等常量
 */

/**
 * 应用基础配置常量
 */
export const APP_CONFIG = {
  // 应用基本信息
  NAME: '运动记录分享',
  VERSION: '1.0.0',
  DESCRIPTION: '运动记录分享应用',
  
  // 环境配置
  ENV: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
  },
  
  // 平台配置
  PLATFORM: {
    WEAPP: 'weapp',
    H5: 'h5',
    RN: 'rn'
  }
} as const

/**
 * API配置常量
 */
export const API_CONFIG = {
  // 基础配置
  BASE_URL: process.env.API_BASE_URL || '',
  TIMEOUT: 30000, // 30秒
  
  // 重试配置
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
  
  // 分页配置
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // 缓存配置
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  
  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
} as const

/**
 * 存储配置常量
 */
export const STORAGE_CONFIG = {
  // 存储键名前缀
  KEY_PREFIX: 'sports_record_',
  
  // 存储类型
  TYPE: {
    LOCAL: 'localStorage',
    SESSION: 'sessionStorage',
    MEMORY: 'memory'
  },
  
  // 存储过期时间（毫秒）
  TTL: {
    SHORT: 5 * 60 * 1000, // 5分钟
    MEDIUM: 60 * 60 * 1000, // 1小时
    LONG: 24 * 60 * 60 * 1000, // 1天
    PERMANENT: 365 * 24 * 60 * 60 * 1000 // 1年
  }
} as const

/**
 * 验证配置常量
 */
export const VALIDATION_CONFIG = {
  // 字符串长度限制
  STRING_MIN_LENGTH: 1,
  STRING_MAX_LENGTH: 255,
  TEXT_MAX_LENGTH: 2000,
  
  // 数值范围限制
  MIN_POSITIVE_NUMBER: 0.01,
  MAX_NUMBER: 999999999,
  
  // 文件大小限制（字节）
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  
  // 文件类型限制
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  
  // 正则表达式
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^1[3-9]\d{9}$/,
    ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/
  }
} as const

/**
 * 运动相关常量
 */
export const SPORTS_CONFIG = {
  // 运动类型
  SPORT_TYPES: {
    RUNNING: 'running',
    WALKING: 'walking',
    CYCLING: 'cycling',
    SWIMMING: 'swimming',
    FITNESS: 'fitness',
    BASKETBALL: 'basketball',
    FOOTBALL: 'football',
    TENNIS: 'tennis',
    BADMINTON: 'badminton',
    YOGA: 'yoga',
    OTHER: 'other'
  } as const,
  
  // 运动强度
  INTENSITY_LEVELS: {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    EXTREME: 'extreme'
  } as const,
  
  // 单位配置
  UNITS: {
    DISTANCE: {
      KILOMETER: 'km',
      MILE: 'mile',
      METER: 'm'
    },
    SPEED: {
      KM_PER_HOUR: 'km/h',
      MILE_PER_HOUR: 'mph',
      METER_PER_SECOND: 'm/s'
    },
    DURATION: {
      HOUR: 'hour',
      MINUTE: 'minute',
      SECOND: 'second'
    },
    CALORIES: {
      KCAL: 'kcal'
    }
  },
  
  // 默认配置
  DEFAULTS: {
    MIN_DURATION: 1, // 分钟
    MAX_DURATION: 24 * 60, // 24小时
    MIN_DISTANCE: 0.1, // 公里
    MAX_DISTANCE: 1000, // 公里
    MIN_SPEED: 0.5, // km/h
    MAX_SPEED: 100, // km/h
    MIN_CALORIES: 1,
    MAX_CALORIES: 50000
  }
} as const

/**
 * 地图配置常量
 */
export const MAP_CONFIG = {
  // 默认地图中心（北京）
  DEFAULT_CENTER: {
    latitude: 39.9042,
    longitude: 116.4074
  },
  
  // 默认缩放级别
  DEFAULT_ZOOM: 12,
  
  // 地图类型
  MAP_TYPES: {
    STANDARD: 'standard',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid'
  },
  
  // 标记配置
  MARKER_COLORS: {
    START: '#4CAF50', // 绿色
    END: '#F44336', // 红色
    WAYPOINT: '#2196F3', // 蓝色
    CURRENT: '#FF9800' // 橙色
  },
  
  // 轨迹配置
  POLYLINE_CONFIG: {
    COLOR: '#2196F3',
    WIDTH: 6,
    DOTTED_LINE: false
  }
} as const

/**
 * 时间配置常量
 */
export const TIME_CONFIG = {
  // 日期格式
  DATE_FORMATS: {
    DATE: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIME: 'HH:mm:ss',
    MONTH: 'YYYY-MM',
    YEAR: 'YYYY'
  },
  
  // 时区配置
  DEFAULT_TIMEZONE: 'Asia/Shanghai',
  
  // 时间范围
  DATE_RANGES: {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    ALL: 'all'
  },
  
  // 时间限制
  LIMITS: {
    MIN_DATE: new Date('2000-01-01'),
    MAX_DATE: new Date('2100-12-31'),
    MAX_DURATION_DAYS: 365
  }
} as const

/**
 * UI配置常量
 */
export const UI_CONFIG = {
  // 屏幕尺寸断点
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },
  
  // 动画配置
  ANIMATION: {
    DURATION: 300, // 毫秒
    EASING: 'ease-out'
  },
  
  // 颜色配置
  COLORS: {
    PRIMARY: '#1976D2',
    SECONDARY: '#424242',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    INFO: '#2196F3'
  },
  
  // 间距配置
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32
  }
} as const

/**
 * 网络配置常量
 */
export const NETWORK_CONFIG = {
  // 超时配置
  TIMEOUTS: {
    REQUEST: 30000, // 30秒
    UPLOAD: 60000, // 60秒
    DOWNLOAD: 60000 // 60秒
  },
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1秒
    BACKOFF_MULTIPLIER: 2
  },
  
  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5分钟
    MAX_SIZE: 100
  }
} as const

/**
 * 错误配置常量
 */
export const ERROR_CONFIG = {
  // 错误代码
  CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },
  
  // 默认错误消息
  DEFAULT_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，请稍后重试',
    SERVER_ERROR: '服务器错误，请稍后重试',
    VALIDATION_ERROR: '输入数据验证失败',
    AUTH_ERROR: '认证失败，请重新登录',
    PERMISSION_ERROR: '权限不足，无法执行此操作',
    NOT_FOUND: '请求的资源不存在',
    UNKNOWN_ERROR: '未知错误，请稍后重试'
  }
} as const

/**
 * 分享配置常量
 */
export const SHARE_CONFIG = {
  // 分享类型
  TYPES: {
    WECHAT: 'wechat',
    MOMENTS: 'moments',
    QQ: 'qq',
    WEIBO: 'weibo',
    LINK: 'link'
  },
  
  // 分享内容限制
  LIMITS: {
    TITLE_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 200,
    IMAGE_MAX_SIZE: 1024 * 1024, // 1MB
    IMAGE_MAX_WIDTH: 1080,
    IMAGE_MAX_HEIGHT: 1920
  },
  
  // 默认分享内容
  DEFAULTS: {
    TITLE: '我的运动记录',
    DESCRIPTION: '刚刚完成了一次很棒的运动，快来看看吧！'
  }
} as const

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  // 默认语言
  LANGUAGE: 'zh-CN',
  
  // 默认主题
  THEME: 'light',
  
  // 默认单位制
  UNIT_SYSTEM: 'metric', // metric, imperial
  
  // 默认隐私设置
  PRIVACY: {
    PROFILE_VISIBLE: true,
    RECORD_VISIBLE: true,
    LOCATION_VISIBLE: false
  },
  
  // 默认通知设置
  NOTIFICATIONS: {
    ENABLED: true,
    SOUND: true,
    VIBRATION: true,
    PUSH: true
  }
} as const

/**
 * 限制配置常量
 */
export const LIMITS_CONFIG = {
  // 记录相关限制
  RECORDS: {
    MAX_DAILY_RECORDS: 50,
    MAX_RECORD_DURATION: 24 * 60 * 60, // 24小时（秒）
    MAX_WAYPOINTS: 10000,
    MIN_RECORD_INTERVAL: 60 // 60秒
  },
  
  // 文件上传限制
  UPLOAD: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILES_PER_REQUEST: 10,
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'wmv']
  },
  
  // 用户相关限制
  USER: {
    MAX_USERNAME_LENGTH: 20,
    MIN_USERNAME_LENGTH: 3,
    MAX_BIO_LENGTH: 200,
    MAX_SIGNATURE_LENGTH: 100
  }
} as const

/**
 * 配置设置常量
 */
export const CONFIG_SETTINGS = {
  // 是否启用调试模式
  DEBUG: process.env.NODE_ENV === 'development',
  
  // 是否启用性能监控
  PERFORMANCE_MONITORING: true,
  
  // 是否启用错误报告
  ERROR_REPORTING: process.env.NODE_ENV === 'production',
  
  // 是否启用分析
  ANALYTICS: process.env.NODE_ENV === 'production',
  
  // 是否启用缓存
  CACHE_ENABLED: true,
  
  // 是否启用离线模式
  OFFLINE_MODE: true,
  
  // 是否启用自动更新
  AUTO_UPDATE: true
} as const

/**
 * 导出自定义类型
 */
export type AppConfig = typeof APP_CONFIG
export type ApiConfig = typeof API_CONFIG
export type StorageConfig = typeof STORAGE_CONFIG
export type ValidationConfig = typeof VALIDATION_CONFIG
export type SportsConfig = typeof SPORTS_CONFIG
export type MapConfig = typeof MAP_CONFIG
export type TimeConfig = typeof TIME_CONFIG
export type UiConfig = typeof UI_CONFIG
export type NetworkConfig = typeof NETWORK_CONFIG
export type ErrorConfig = typeof ERROR_CONFIG
export type ShareConfig = typeof SHARE_CONFIG
export type DefaultConfig = typeof DEFAULT_CONFIG
export type LimitsConfig = typeof LIMITS_CONFIG
export type ConfigSettings = typeof CONFIG_SETTINGS