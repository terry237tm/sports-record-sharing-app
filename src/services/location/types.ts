/**
 * 位置服务类型定义
 * 定义位置相关的核心数据结构和接口
 */

/**
 * 位置数据接口
 * 包含完整的地理位置信息
 */
export interface LocationData {
  latitude: number;           // 纬度
  longitude: number;          // 经度
  address: string;            // 详细地址
  city?: string;              // 城市
  district?: string;          // 区县
  province?: string;          // 省份
  country?: string;           // 国家
  poi?: string;               // 兴趣点名称
  accuracy?: number;          // 精度（米）
  timestamp?: number;         // 获取时间戳
}

/**
 * 微信位置信息接口
 * 微信小程序定位API返回的数据结构
 */
export interface WeChatLocation {
  latitude: number;           // 纬度
  longitude: number;          // 经度
  accuracy: number;           // 精度（米）
  speed?: number;             // 速度（米/秒）
  altitude?: number;          // 高度（米）
  verticalAccuracy?: number;  // 垂直精度（米）
  horizontalAccuracy?: number;// 水平精度（米）
}

/**
 * 腾讯地图逆地址解析结果
 */
export interface TencentGeocodingResult {
  address: string;                    // 详细地址
  formatted_addresses?: {             // 推荐地址
    recommend?: string;                // 推荐地址描述
    rough?: string;                    // 粗略地址描述
  };
  address_component: {                // 地址组成部分
    nation?: string;                   // 国家
    province?: string;                 // 省份
    city?: string;                     // 城市
    district?: string;                 // 区县
    street?: string;                   // 街道
    street_number?: string;            // 门牌号
  };
  ad_info?: {                         // 行政区划信息
    adcode?: string;                   // 行政区划代码
    city_code?: string;                // 城市代码
  };
  location?: {                        // 坐标信息
    lat: number;                       // 纬度
    lng: number;                       // 经度
  };
}

/**
 * 位置服务配置选项
 */
export interface LocationServiceOptions {
  tencentMapKey?: string;     // 腾讯地图API密钥
  cacheTimeout?: number;      // 缓存超时时间（毫秒）
  highAccuracy?: boolean;     // 是否使用高精度定位
  timeout?: number;          // 定位超时时间（毫秒）
}

/**
 * 位置策略接口
 * 定义不同的定位策略
 */
export interface LocationStrategy {
  /**
   * 高精度定位（GPS + WiFi + 基站）
   */
  highAccuracy(): Promise<LocationData>;
  
  /**
   * 平衡模式（WiFi + 基站）
   */
  balanced(): Promise<LocationData>;
  
  /**
   * 低功耗模式（仅基站）
   */
  lowPower(): Promise<LocationData>;
  
  /**
   * 缓存优先模式
   */
  cacheFirst(): Promise<LocationData>;
}

/**
 * 位置缓存项
 */
export interface LocationCacheItem {
  location: LocationData;     // 位置数据
  timestamp: number;          // 缓存时间戳
  accuracy: number;           // 精度
}

/**
 * 位置权限状态
 */
export enum LocationPermissionStatus {
  GRANTED = 'granted',        // 已授权
  DENIED = 'denied',          // 被拒绝
  NOT_DETERMINED = 'not_determined', // 未确定
  RESTRICTED = 'restricted'   // 受限制
}

/**
 * 位置错误类型
 */
export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',     // 权限被拒绝
  SERVICE_DISABLED = 'SERVICE_DISABLED',       // 定位服务关闭
  TIMEOUT = 'TIMEOUT',                         // 定位超时
  NETWORK_ERROR = 'NETWORK_ERROR',             // 网络错误
  INVALID_COORDINATES = 'INVALID_COORDINATES', // 无效坐标
  GEOCODING_FAILED = 'GEOCODING_FAILED',       // 逆地址解析失败
  CACHE_EXPIRED = 'CACHE_EXPIRED',             // 缓存过期
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'              // 未知错误
}

/**
 * 位置错误接口
 */
export interface LocationError extends Error {
  type: LocationErrorType;
  code?: string;
  details?: any;
}

/**
 * 位置选择器选项
 */
export interface LocationSelectorOptions {
  showMap?: boolean;          // 是否显示地图
  enableSearch?: boolean;     // 是否启用搜索
  defaultLocation?: LocationData; // 默认位置
  searchPlaceholder?: string; // 搜索占位符
}

/**
 * 位置搜索结果
 */
export interface LocationSearchResult {
  location: LocationData;     // 位置信息
  distance?: number;          // 距离（米）
  confidence?: number;        // 置信度（0-1）
  type?: string;              // 地点类型
}