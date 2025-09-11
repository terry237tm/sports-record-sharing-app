/**
 * 微信定位服务
 * 提供微信定位API的完整服务封装，包括坐标转换、缓存管理、错误处理等
 */

import {
  LocationData,
  WeChatLocation,
  LocationError,
  LocationErrorType,
  LocationServiceOptions,
  LocationStrategy,
  LocationCacheItem
} from './types';
import {
  TENCENT_MAP_CONFIG,
  WECHAT_LOCATION_CONFIG,
  CACHE_CONFIG,
  LOCATION_STRATEGY_CONFIG,
  ERROR_MESSAGES
} from './constants';
import {
  getWeChatLocation,
  getWeChatLocationWithTimeout,
  validateWeChatLocation,
  CoordinateTransformer
} from '../../utils/location/wechat';
import { checkLocationPermission } from '../../utils/location/permission';

/**
 * 微信定位服务类
 * 实现LocationStrategy接口，提供多种定位策略
 */
export class WeChatLocationService implements LocationStrategy {
  private options: LocationServiceOptions;
  private cache: Map<string, LocationCacheItem>;
  private lastLocation: LocationData | null = null;

  constructor(options: LocationServiceOptions = {}) {
    this.options = {
      cacheTimeout: CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT,
      timeout: WECHAT_LOCATION_CONFIG.DEFAULT_TIMEOUT,
      highAccuracy: true,
      ...options
    };
    
    this.cache = new Map();
    this.startCacheCleanup();
  }

  /**
   * 高精度定位（GPS + WiFi + 基站）
   */
  async highAccuracy(): Promise<LocationData> {
    return this.getLocationWithStrategy('highAccuracy');
  }

  /**
   * 平衡模式（WiFi + 基站）
   */
  async balanced(): Promise<LocationData> {
    return this.getLocationWithStrategy('balanced');
  }

  /**
   * 低功耗模式（仅基站）
   */
  async lowPower(): Promise<LocationData> {
    return this.getLocationWithStrategy('lowPower');
  }

  /**
   * 缓存优先模式
   */
  async cacheFirst(): Promise<LocationData> {
    // 首先检查缓存
    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      return cachedLocation;
    }
    
    // 缓存不存在，使用平衡模式获取位置
    return this.balanced();
  }

  /**
   * 根据策略获取位置
   */
  private async getLocationWithStrategy(strategy: string): Promise<LocationData> {
    // 检查权限
    await this.checkPermission();

    // 检查缓存
    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      return cachedLocation;
    }

    // 获取微信位置
    const wechatLocation = await this.getWeChatLocationWithConfig(strategy);
    
    // 转换为标准格式
    const locationData = this.convertWeChatLocationToLocationData(wechatLocation);
    
    // 缓存位置
    this.cacheLocation(locationData);
    
    // 更新最后位置
    this.lastLocation = locationData;
    
    return locationData;
  }

  /**
   * 获取微信位置（带配置）
   */
  private async getWeChatLocationWithConfig(strategy: string): Promise<WeChatLocation> {
    let options = {};
    let timeout = this.options.timeout || WECHAT_LOCATION_CONFIG.DEFAULT_TIMEOUT;

    switch (strategy) {
      case 'highAccuracy':
        options = {
          type: 'gcj02',
          altitude: true,
          highAccuracyExpireTime: WECHAT_LOCATION_CONFIG.HIGH_ACCURACY_EXPIRE_TIME
        };
        timeout = WECHAT_LOCATION_CONFIG.HIGH_ACCURACY_TIMEOUT;
        break;
      case 'balanced':
        options = {
          type: 'gcj02',
          altitude: false
        };
        break;
      case 'lowPower':
        options = {
          type: 'gcj02',
          altitude: false
        };
        break;
      default:
        options = {
          type: 'gcj02',
          altitude: false
        };
    }

    try {
      return await getWeChatLocationWithTimeout(options, timeout);
    } catch (error) {
      throw this.createLocationError(error, strategy);
    }
  }

  /**
   * 检查权限
   */
  private async checkPermission(): Promise<void> {
    const permissionStatus = await checkLocationPermission();
    if (permissionStatus !== 'granted') {
      const error = new Error(ERROR_MESSAGES.PERMISSION_DENIED) as LocationError;
      error.type = LocationErrorType.PERMISSION_DENIED;
      error.name = 'LocationPermissionError';
      throw error;
    }
  }

  /**
   * 微信位置转换为标准位置数据
   */
  private convertWeChatLocationToLocationData(wechatLocation: WeChatLocation): LocationData {
    // 验证微信位置数据
    if (!validateWeChatLocation(wechatLocation)) {
      const error = new Error(ERROR_MESSAGES.INVALID_COORDINATES) as LocationError;
      error.type = LocationErrorType.INVALID_COORDINATES;
      error.name = 'InvalidCoordinatesError';
      throw error;
    }

    try {
      // 微信返回的是GCJ02坐标系，需要转换为WGS84用于存储
      const wgs84Coords = CoordinateTransformer.gcj02ToWgs84(
        wechatLocation.latitude,
        wechatLocation.longitude
      );

      if (!wgs84Coords || typeof wgs84Coords.lat !== 'number' || typeof wgs84Coords.lng !== 'number') {
        throw new Error('坐标转换失败');
      }

      return {
        latitude: wgs84Coords.lat,
        longitude: wgs84Coords.lng,
        address: '', // 地址信息需要通过逆地址解析获取
        accuracy: wechatLocation.accuracy,
        timestamp: Date.now(),
        // 可选字段
        ...(wechatLocation.altitude && { altitude: wechatLocation.altitude }),
        ...(wechatLocation.speed && { speed: wechatLocation.speed })
      };
    } catch (error) {
      const locationError = new Error('坐标转换失败: ' + (error as Error).message) as LocationError;
      locationError.type = LocationErrorType.INVALID_COORDINATES;
      locationError.name = 'CoordinateTransformError';
      throw locationError;
    }
  }

  /**
   * 获取缓存的位置
   */
  private getCachedLocation(): LocationData | null {
    const cacheKey = this.getCacheKey();
    const cachedItem = this.cache.get(cacheKey);
    
    if (!cachedItem) {
      return null;
    }

    // 检查缓存是否过期
    const now = Date.now();
    const cacheAge = now - cachedItem.timestamp;
    const maxAge = this.options.cacheTimeout || CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT;
    
    if (cacheAge > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cachedItem.location;
  }

  /**
   * 缓存位置
   */
  private cacheLocation(location: LocationData): void {
    const cacheKey = this.getCacheKey();
    const cacheItem: LocationCacheItem = {
      location,
      timestamp: Date.now(),
      accuracy: location.accuracy || 0
    };
    
    this.cache.set(cacheKey, cacheItem);
    
    // 限制缓存大小
    if (this.cache.size > CACHE_CONFIG.MAX_CACHE_ITEMS) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(): string {
    return `${CACHE_CONFIG.LOCATION_CACHE_KEY_PREFIX}wechat`;
  }

  /**
   * 创建位置错误
   */
  private createLocationError(error: any, strategy: string): LocationError {
    let errorType = LocationErrorType.UNKNOWN_ERROR;
    let message = ERROR_MESSAGES.UNKNOWN_ERROR;

    if (error.type) {
      errorType = error.type;
      message = error.message;
    } else if (error.errMsg) {
      // 微信API错误
      const errMsg = error.errMsg.toLowerCase();
      if (errMsg.includes('auth') || errMsg.includes('permission')) {
        errorType = LocationErrorType.PERMISSION_DENIED;
        message = ERROR_MESSAGES.PERMISSION_DENIED;
      } else if (errMsg.includes('service') || errMsg.includes('disabled')) {
        errorType = LocationErrorType.SERVICE_DISABLED;
        message = ERROR_MESSAGES.SERVICE_DISABLED;
      } else if (errMsg.includes('timeout')) {
        errorType = LocationErrorType.TIMEOUT;
        message = ERROR_MESSAGES.TIMEOUT;
      } else if (errMsg.includes('network')) {
        errorType = LocationErrorType.NETWORK_ERROR;
        message = ERROR_MESSAGES.NETWORK_ERROR;
      }
    } else if (error.message) {
      message = error.message;
    }

    const locationError = new Error(message) as LocationError;
    locationError.type = errorType;
    locationError.name = 'WeChatLocationServiceError';
    locationError.details = {
      originalError: error,
      strategy,
      timestamp: Date.now()
    };

    return locationError;
  }

  /**
   * 启动缓存清理
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = this.options.cacheTimeout || CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT;
      
      for (const [key, item] of this.cache.entries()) {
        const cacheAge = now - item.timestamp;
        if (cacheAge > maxAge) {
          this.cache.delete(key);
        }
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    timeout: number;
  } {
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_CACHE_ITEMS,
      timeout: this.options.cacheTimeout || CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT
    };
  }

  /**
   * 获取最后获取的位置
   */
  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  /**
   * 获取服务选项
   */
  getOptions(): LocationServiceOptions {
    return { ...this.options };
  }

  /**
   * 更新服务选项
   */
  updateOptions(newOptions: Partial<LocationServiceOptions>): void {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.clearCache();
    this.lastLocation = null;
  }
}

/**
 * 创建微信定位服务实例
 */
export function createWeChatLocationService(
  options?: LocationServiceOptions
): WeChatLocationService {
  return new WeChatLocationService(options);
}

/**
 * 默认微信定位服务实例
 */
export const weChatLocationService = createWeChatLocationService();