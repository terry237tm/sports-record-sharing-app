/**
 * 位置服务常量定义
 * 包含配置参数、错误消息、缓存设置等
 */

/**
 * 腾讯地图API配置
 */
export const TENCENT_MAP_CONFIG = {
  // API基础URL
  BASE_URL: 'https://apis.map.qq.com/ws',
  
  // 逆地址解析API路径
  GEOCODING_PATH: '/geocoder/v1/',
  
  // 地点搜索API路径
  SEARCH_PATH: '/place/v1/search',
  
  // 关键词输入提示API路径
  SUGGESTION_PATH: '/place/v1/suggestion',
  
  // 距离计算API路径
  DISTANCE_PATH: '/distance/v1/',
  
  // 默认超时时间（毫秒）
  DEFAULT_TIMEOUT: 10000,
  
  // 最大重试次数
  MAX_RETRIES: 3,
  
  // 重试延迟（毫秒）
  RETRY_DELAY: 1000
} as const;

/**
 * 微信小程序定位配置
 */
export const WECHAT_LOCATION_CONFIG = {
  // 坐标系类型
  COORDINATE_TYPE: 'gcj02' as const, // 国测局坐标系
  
  // 默认超时时间（毫秒）
  DEFAULT_TIMEOUT: 10000,
  
  // 高精度定位超时时间（毫秒）
  HIGH_ACCURACY_TIMEOUT: 15000,
  
  // 高精度定位过期时间（毫秒）
  HIGH_ACCURACY_EXPIRE_TIME: 3000,
  
  // 是否返回高度信息
  ALTITUDE_ENABLED: false
} as const;

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  // 位置缓存键前缀
  LOCATION_CACHE_KEY_PREFIX: 'location_cache_',
  
  // 默认缓存超时时间（毫秒）
  DEFAULT_CACHE_TIMEOUT: 5 * 60 * 1000, // 5分钟
  
  // 最大缓存条目数
  MAX_CACHE_ITEMS: 50,
  
  // 缓存清理间隔（毫秒）
  CLEANUP_INTERVAL: 60 * 60 * 1000 // 1小时
} as const;

/**
 * 定位策略配置
 */
export const LOCATION_STRATEGY_CONFIG = {
  // 高精度模式配置
  HIGH_ACCURACY: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  },
  
  // 平衡模式配置
  BALANCED: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000 // 1分钟缓存
  },
  
  // 低功耗模式配置
  LOW_POWER: {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 300000 // 5分钟缓存
  },
  
  // 缓存优先模式配置
  CACHE_FIRST: {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 600000 // 10分钟缓存
  }
} as const;

/**
 * 精度配置
 */
export const ACCURACY_CONFIG = {
  // 高精度阈值（米）
  HIGH_ACCURACY_THRESHOLD: 50,
  
  // 可接受精度阈值（米）
  ACCEPTABLE_ACCURACY_THRESHOLD: 200,
  
  // 警告精度阈值（米）
  WARNING_ACCURACY_THRESHOLD: 500,
  
  // 室内定位最大精度（米）
  INDOOR_MAX_ACCURACY: 1000
} as const;

/**
 * 错误消息配置
 */
export const ERROR_MESSAGES = {
  // 权限相关错误
  PERMISSION_DENIED: '定位权限被拒绝，请在设置中开启位置权限',
  SERVICE_DISABLED: '定位服务已关闭，请开启定位服务',
  
  // 网络相关错误
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT: '定位超时，请重试或检查网络连接',
  
  // 坐标相关错误
  INVALID_COORDINATES: '无效的坐标数据',
  GEOCODING_FAILED: '地址解析失败，请重试',
  
  // 缓存相关错误
  CACHE_EXPIRED: '位置缓存已过期',
  
  // 通用错误
  UNKNOWN_ERROR: '定位失败，请重试',
  INITIALIZATION_FAILED: '位置服务初始化失败'
} as const;

/**
 * 用户提示消息
 */
export const USER_MESSAGES = {
  // 权限提示
  PERMISSION_REQUEST: '需要获取您的位置信息以提供更好的服务',
  PERMISSION_GUIDE: '请前往设置-隐私-位置服务中开启权限',
  
  // 定位提示
  LOCATING: '正在获取位置信息...',
  LOCATION_ACQUIRED: '位置获取成功',
  LOCATION_UPDATED: '位置已更新',
  
  // 错误提示
  LOCATION_FAILED: '获取位置失败',
  SELECT_LOCATION_MANUAL: '手动选择位置',
  TRY_AGAIN: '重试',
  
  // 精度提示
  LOW_ACCURACY_WARNING: '当前定位精度较低，建议到开阔地带重新定位'
} as const;

/**
 * 位置选择器配置
 */
export const LOCATION_SELECTOR_CONFIG = {
  // 默认搜索半径（米）
  DEFAULT_SEARCH_RADIUS: 5000,
  
  // 最大搜索结果数
  MAX_SEARCH_RESULTS: 20,
  
  // 搜索超时时间（毫秒）
  SEARCH_TIMEOUT: 5000,
  
  // 地图默认缩放级别
  DEFAULT_MAP_ZOOM: 16,
  
  // 最小缩放级别
  MIN_MAP_ZOOM: 3,
  
  // 最大缩放级别
  MAX_MAP_ZOOM: 20
} as const;

/**
 * 隐私配置
 */
export const PRIVACY_CONFIG = {
  // 位置数据加密密钥（应由环境变量提供）
  ENCRYPTION_KEY: process.env.LOCATION_ENCRYPTION_KEY || 'default-key-change-in-production',
  
  // 位置历史最大保存时间（毫秒）
  MAX_HISTORY_AGE: 7 * 24 * 60 * 60 * 1000, // 7天
  
  // 位置数据上传间隔（毫秒）
  UPLOAD_INTERVAL: 60 * 60 * 1000 // 1小时
} as const;