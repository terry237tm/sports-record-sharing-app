/**
 * 位置服务核心实现
 * 提供位置获取、地址解析、权限管理等功能
 */

import Taro from '@tarojs/taro';
import {
  LocationData,
  WeChatLocation,
  TencentGeocodingResult,
  LocationStrategy,
  LocationPermissionStatus,
  LocationError,
  LocationErrorType,
  LocationServiceOptions,
  LocationCacheItem
} from './types';
import {
  TENCENT_MAP_CONFIG,
  WECHAT_LOCATION_CONFIG,
  CACHE_CONFIG,
  LOCATION_STRATEGY_CONFIG,
  ACCURACY_CONFIG,
  ERROR_MESSAGES,
  PRIVACY_CONFIG
} from './constants';

/**
 * 位置服务主类
 * 集成微信定位API和腾讯地图API
 */
export class LocationService implements LocationStrategy {
  private options: LocationServiceOptions;
  private cache: Map<string, LocationCacheItem>;
  private qqMapSDK: any;

  constructor(options: LocationServiceOptions = {}) {
    this.options = {
      cacheTimeout: CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT,
      timeout: WECHAT_LOCATION_CONFIG.DEFAULT_TIMEOUT,
      highAccuracy: true,
      ...options
    };
    
    this.cache = new Map();
    this.initializeTencentMapSDK();
  }

  /**
   * 初始化腾讯地图SDK
   */
  private initializeTencentMapSDK(): void {
    // 注意：这里需要根据实际的腾讯地图SDK进行初始化
    // 由于是在Taro环境中，可能需要使用不同的集成方式
    if (this.options.tencentMapKey) {
      // 在实际实现中，这里会初始化腾讯地图SDK
      // this.qqMapSDK = new QQMapWX({
      //   key: this.options.tencentMapKey
      // });
    }
  }

  /**
   * 高精度定位（GPS + WiFi + 基站）
   */
  async highAccuracy(): Promise<LocationData> {
    return this.getCurrentLocation({
      ...LOCATION_STRATEGY_CONFIG.HIGH_ACCURACY,
      timeout: this.options.timeout || LOCATION_STRATEGY_CONFIG.HIGH_ACCURACY.timeout
    });
  }

  /**
   * 平衡模式（WiFi + 基站）
   */
  async balanced(): Promise<LocationData> {
    return this.getCurrentLocation({
      ...LOCATION_STRATEGY_CONFIG.BALANCED,
      timeout: this.options.timeout || LOCATION_STRATEGY_CONFIG.BALANCED.timeout
    });
  }

  /**
   * 低功耗模式（仅基站）
   */
  async lowPower(): Promise<LocationData> {
    return this.getCurrentLocation({
      ...LOCATION_STRATEGY_CONFIG.LOW_POWER,
      timeout: this.options.timeout || LOCATION_STRATEGY_CONFIG.LOW_POWER.timeout
    });
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
    
    // 如果缓存不存在，使用低功耗模式获取
    return this.lowPower();
  }

  /**
   * 获取当前位置（主要方法）
   */
  async getCurrentLocation(options?: any): Promise<LocationData> {
    try {
      // 检查权限
      await this.checkLocationPermission();
      
      // 获取微信位置信息
      const wechatLocation = await this.getWeChatLocation(options);
      
      // 检查精度
      this.validateAccuracy(wechatLocation.accuracy);
      
      // 逆地址解析
      const addressInfo = await this.reverseGeocoding(
        wechatLocation.latitude,
        wechatLocation.longitude
      );
      
      // 组合位置数据
      const locationData: LocationData = {
        latitude: wechatLocation.latitude,
        longitude: wechatLocation.longitude,
        accuracy: wechatLocation.accuracy,
        timestamp: Date.now(),
        ...addressInfo
      };
      
      // 缓存位置
      this.cacheLocation(locationData);
      
      return locationData;
      
    } catch (error) {
      throw this.createLocationError(error);
    }
  }

  /**
   * 检查位置权限
   */
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const authSetting = await Taro.getSetting();
      const locationAuth = authSetting.authSetting?.['scope.userLocation'];
      
      if (locationAuth === true) {
        return LocationPermissionStatus.GRANTED;
      } else if (locationAuth === false) {
        return LocationPermissionStatus.DENIED;
      } else {
        return LocationPermissionStatus.NOT_DETERMINED;
      }
    } catch (error) {
      throw this.createLocationError(error, LocationErrorType.UNKNOWN_ERROR);
    }
  }

  /**
   * 请求位置权限
   */
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      await Taro.authorize({
        scope: 'scope.userLocation'
      });
      return LocationPermissionStatus.GRANTED;
    } catch (error) {
      return LocationPermissionStatus.DENIED;
    }
  }

  /**
   * 获取微信位置信息
   */
  private async getWeChatLocation(options?: any): Promise<WeChatLocation> {
    return new Promise((resolve, reject) => {
      Taro.getLocation({
        type: WECHAT_LOCATION_CONFIG.COORDINATE_TYPE,
        altitude: WECHAT_LOCATION_CONFIG.ALTITUDE_ENABLED,
        highAccuracyExpireTime: WECHAT_LOCATION_CONFIG.HIGH_ACCURACY_EXPIRE_TIME,
        ...options,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy,
            speed: res.speed,
            altitude: res.altitude,
            verticalAccuracy: res.verticalAccuracy,
            horizontalAccuracy: res.horizontalAccuracy
          });
        },
        fail: (error) => {
          reject(new Error(`定位失败: ${error.errMsg}`));
        }
      });
    });
  }

  /**
   * 逆地址解析
   */
  private async reverseGeocoding(lat: number, lng: number): Promise<Partial<LocationData>> {
    // 如果没有配置腾讯地图密钥，返回模拟数据
    if (!this.options.tencentMapKey) {
      return this.getMockAddressInfo(lat, lng);
    }

    // 实际实现中会调用腾讯地图API
    // 这里提供模拟实现
    return new Promise((resolve) => {
      // 模拟API调用延迟
      setTimeout(() => {
        resolve(this.getMockAddressInfo(lat, lng));
      }, 500);
    });
  }

  /**
   * 获取模拟地址信息（开发环境使用）
   */
  private getMockAddressInfo(lat: number, lng: number): Partial<LocationData> {
    // 根据坐标生成模拟地址信息
    const mockAddresses = [
      { address: '北京市朝阳区建国门外大街1号', city: '北京市', district: '朝阳区', province: '北京市' },
      { address: '上海市浦东新区陆家嘴环路1000号', city: '上海市', district: '浦东新区', province: '上海市' },
      { address: '广州市天河区珠江新城花城大道85号', city: '广州市', district: '天河区', province: '广东省' },
      { address: '深圳市南山区深南大道9988号', city: '深圳市', district: '南山区', province: '广东省' }
    ];
    
    // 根据坐标选择模拟地址（简单算法）
    const index = Math.abs(Math.floor((lat + lng) * 1000)) % mockAddresses.length;
    return mockAddresses[index];
  }

  /**
   * 验证定位精度
   */
  private validateAccuracy(accuracy?: number): void {
    if (accuracy === undefined) {
      return;
    }
    
    if (accuracy > ACCURACY_CONFIG.WARNING_ACCURACY_THRESHOLD) {
      console.warn('定位精度较低，可能影响使用体验');
    }
  }

  /**
   * 缓存位置信息
   */
  private cacheLocation(location: LocationData): void {
    const cacheKey = this.getCacheKey(location.latitude, location.longitude);
    const cacheItem: LocationCacheItem = {
      location,
      timestamp: Date.now(),
      accuracy: location.accuracy || 0
    };
    
    this.cache.set(cacheKey, cacheItem);
    
    // 清理过期缓存
    this.cleanupExpiredCache();
  }

  /**
   * 获取缓存的位置信息
   */
  private getCachedLocation(): LocationData | null {
    // 如果缓存为空，返回null
    if (this.cache.size === 0) {
      return null;
    }
    
    // 获取最新的缓存项
    const latestCache = Array.from(this.cache.values())
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    // 检查缓存是否过期
    const now = Date.now();
    if (now - latestCache.timestamp > (this.options.cacheTimeout || CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT)) {
      return null;
    }
    
    return latestCache.location;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(lat: number, lng: number): string {
    const precision = 4; // 坐标精度（小数点后4位，约11米精度）
    const latStr = lat.toFixed(precision);
    const lngStr = lng.toFixed(precision);
    return `${CACHE_CONFIG.LOCATION_CACHE_KEY_PREFIX}${latStr},${lngStr}`;
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const timeout = this.options.cacheTimeout || CACHE_CONFIG.DEFAULT_CACHE_TIMEOUT;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > timeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 创建位置错误
   */
  private createLocationError(error: any, type?: LocationErrorType): LocationError {
    let errorType = type || LocationErrorType.UNKNOWN_ERROR;
    let message = ERROR_MESSAGES.UNKNOWN_ERROR;
    
    if (error.message) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('permission') || errorMsg.includes('auth')) {
        errorType = LocationErrorType.PERMISSION_DENIED;
        message = ERROR_MESSAGES.PERMISSION_DENIED;
      } else if (errorMsg.includes('service') || errorMsg.includes('disabled')) {
        errorType = LocationErrorType.SERVICE_DISABLED;
        message = ERROR_MESSAGES.SERVICE_DISABLED;
      } else if (errorMsg.includes('timeout')) {
        errorType = LocationErrorType.TIMEOUT;
        message = ERROR_MESSAGES.TIMEOUT;
      } else if (errorMsg.includes('network')) {
        errorType = LocationErrorType.NETWORK_ERROR;
        message = ERROR_MESSAGES.NETWORK_ERROR;
      }
    }
    
    const locationError: LocationError = new Error(message) as LocationError;
    locationError.type = errorType;
    locationError.name = 'LocationError';
    
    if (error.code) {
      locationError.code = error.code;
    }
    
    if (error.details) {
      locationError.details = error.details;
    }
    
    return locationError;
  }

  /**
   * 获取服务状态
   */
  getServiceStatus() {
    return {
      cacheSize: this.cache.size,
      options: this.options,
      hasTencentMapKey: !!this.options.tencentMapKey
    };
  }
}

/**
 * 位置服务单例
 */
let locationServiceInstance: LocationService | null = null;

/**
 * 获取位置服务实例
 */
export const getLocationService = (options?: LocationServiceOptions): LocationService => {
  if (!locationServiceInstance) {
    locationServiceInstance = new LocationService(options);
  }
  return locationServiceInstance;
};

/**
 * 重置位置服务实例
 */
export const resetLocationService = (): void => {
  locationServiceInstance = null;
};

export default LocationService;