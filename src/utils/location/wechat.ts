/**
 * 微信定位API封装工具
 * 提供微信定位API的Promise封装和坐标系转换功能
 */

import Taro from '@tarojs/taro';
import { WeChatLocation, LocationError, LocationErrorType } from '../../services/location/types';
import { WECHAT_LOCATION_CONFIG, ERROR_MESSAGES } from '../../services/location/constants';

/**
 * 微信定位配置选项
 */
export interface WeChatLocationOptions {
  /** 坐标系类型，默认为gcj02 */
  type?: 'wgs84' | 'gcj02';
  /** 是否返回高度信息 */
  altitude?: boolean;
  /** 高精度定位过期时间（毫秒） */
  highAccuracyExpireTime?: number;
  /** 定位超时时间（毫秒） */
  timeout?: number;
}

/**
 * 坐标系转换工具
 */
export class CoordinateTransformer {
  /**
   * WGS84坐标系转GCJ02坐标系（国测局坐标系）
   * @param lat 纬度
   * @param lng 经度
   * @returns 转换后的坐标
   */
  static wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
    if (this.outOfChina(lat, lng)) {
      return { lat, lng };
    }
    
    let dlat = this.transformLat(lng - 105.0, lat - 35.0);
    let dlng = this.transformLng(lng - 105.0, lat - 35.0);
    const radlat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radlat);
    magic = 1 - 0.00669342162296594323 * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((6378245.0 * (1 - 0.00669342162296594323)) / (magic * sqrtmagic) * Math.PI);
    dlng = (dlng * 180.0) / (6378245.0 / sqrtmagic * Math.cos(radlat) * Math.PI);
    
    return {
      lat: lat + dlat,
      lng: lng + dlng
    };
  }

  /**
   * GCJ02坐标系转WGS84坐标系
   * @param lat 纬度
   * @param lng 经度
   * @returns 转换后的坐标
   */
  static gcj02ToWgs84(lat: number, lng: number): { lat: number; lng: number } {
    if (this.outOfChina(lat, lng)) {
      return { lat, lng };
    }
    
    try {
      let dlat = this.transformLat(lng - 105.0, lat - 35.0);
      let dlng = this.transformLng(lng - 105.0, lat - 35.0);
      const radlat = lat / 180.0 * Math.PI;
      let magic = Math.sin(radlat);
      magic = 1 - 0.00669342162296594323 * magic * magic;
      const sqrtmagic = Math.sqrt(magic);
      dlat = (dlat * 180.0) / ((6378245.0 * (1 - 0.00669342162296594323)) / (magic * sqrtmagic) * Math.PI);
      dlng = (dlng * 180.0) / (6378245.0 / sqrtmagic * Math.cos(radlat) * Math.PI);
      
      return {
        lat: lat - dlat,
        lng: lng - dlng
      };
    } catch (error) {
      // 如果转换失败，返回原始坐标
      console.warn('坐标转换失败，返回原始坐标:', error);
      return { lat, lng };
    }
  }

  /**
   * 判断是否在中国境外
   */
  private static outOfChina(lat: number, lng: number): boolean {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  /**
   * 转换纬度
   */
  private static transformLat(lng: number, lat: number): number {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  /**
   * 转换经度
   */
  private static transformLng(lng: number, lat: number): number {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }
}

/**
 * 获取微信位置信息
 * @param options 定位选项
 * @returns 位置信息
 */
export async function getWeChatLocation(options: WeChatLocationOptions = {}): Promise<WeChatLocation> {
  const config = {
    type: WECHAT_LOCATION_CONFIG.COORDINATE_TYPE,
    altitude: WECHAT_LOCATION_CONFIG.ALTITUDE_ENABLED,
    highAccuracyExpireTime: WECHAT_LOCATION_CONFIG.HIGH_ACCURACY_EXPIRE_TIME,
    ...options
  };

  return new Promise((resolve, reject) => {
    Taro.getLocation({
      type: config.type as 'wgs84' | 'gcj02',
      altitude: config.altitude,
      highAccuracyExpireTime: config.highAccuracyExpireTime,
      success: (res) => {
        const location: WeChatLocation = {
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          speed: res.speed,
          altitude: res.altitude,
          verticalAccuracy: res.verticalAccuracy,
          horizontalAccuracy: res.horizontalAccuracy
        };
        resolve(location);
      },
      fail: (error) => {
        const errorMessage = error.errMsg || '获取位置失败';
        const locationError = new Error(errorMessage) as LocationError;
        locationError.type = LocationErrorType.UNKNOWN_ERROR;
        locationError.name = 'WeChatLocationError';
        reject(locationError);
      }
    });
  });
}

/**
 * 获取微信位置信息（带超时处理）
 * @param options 定位选项
 * @param timeout 超时时间（毫秒）
 * @returns 位置信息
 */
export async function getWeChatLocationWithTimeout(
  options: WeChatLocationOptions = {},
  timeout: number = WECHAT_LOCATION_CONFIG.DEFAULT_TIMEOUT
): Promise<WeChatLocation> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new Error(ERROR_MESSAGES.TIMEOUT) as LocationError;
      error.type = LocationErrorType.TIMEOUT;
      error.name = 'LocationTimeoutError';
      reject(error);
    }, timeout);
  });

  return Promise.race([getWeChatLocation(options), timeoutPromise]);
}

/**
 * 检查微信定位API是否可用
 * @returns 是否可用
 */
export async function isWeChatLocationAvailable(): Promise<boolean> {
  try {
    // 检查是否在微信环境中
    if (typeof wx === 'undefined' && typeof Taro === 'undefined') {
      return false;
    }

    // 检查getLocation API是否存在
    const systemInfo = await Taro.getSystemInfo();
    const sdkVersion = systemInfo.SDKVersion;
    
    // 基础库版本检查（getLocation API需要基础库版本 >= 1.0.0）
    if (sdkVersion) {
      const versionParts = sdkVersion.split('.').map(Number);
      if (versionParts[0] >= 1) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * 获取微信定位错误信息
 * @param error 原始错误
 * @returns 处理后的错误信息
 */
export function getWeChatLocationErrorMessage(error: any): string {
  if (error.errMsg) {
    const errMsg = error.errMsg.toLowerCase();
    
    if (errMsg.includes('auth') || errMsg.includes('permission')) {
      return ERROR_MESSAGES.PERMISSION_DENIED;
    } else if (errMsg.includes('service') || errMsg.includes('disabled')) {
      return ERROR_MESSAGES.SERVICE_DISABLED;
    } else if (errMsg.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    } else if (errMsg.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * 验证微信位置数据的有效性
 * @param location 位置数据
 * @returns 是否有效
 */
export function validateWeChatLocation(location: WeChatLocation): boolean {
  if (!location) {
    return false;
  }
  
  // 验证经纬度范围
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return false;
  }
  
  // 纬度范围：-90 到 90
  if (location.latitude < -90 || location.latitude > 90) {
    return false;
  }
  
  // 经度范围：-180 到 180
  if (location.longitude < -180 || location.longitude > 180) {
    return false;
  }
  
  // 验证精度
  if (typeof location.accuracy !== 'number' || location.accuracy < 0) {
    return false;
  }
  
  return true;
}

/**
 * 获取定位精度等级
 * @param accuracy 精度（米）
 * @returns 精度等级
 */
export function getAccuracyLevel(accuracy: number): 'high' | 'medium' | 'low' | 'very_low' {
  if (accuracy <= 50) {
    return 'high';
  } else if (accuracy <= 200) {
    return 'medium';
  } else if (accuracy <= 500) {
    return 'low';
  } else {
    return 'very_low';
  }
}

/**
 * 格式化位置信息
 * @param location 位置数据
 * @returns 格式化的位置描述
 */
export function formatLocationInfo(location: WeChatLocation): string {
  const accuracyLevel = getAccuracyLevel(location.accuracy);
  const levelText = {
    high: '高精度',
    medium: '中精度',
    low: '低精度',
    very_low: '极低精度'
  }[accuracyLevel];
  
  return `纬度: ${location.latitude.toFixed(6)}, 经度: ${location.longitude.toFixed(6)}, 精度: ${levelText} (${location.accuracy}米)`;
}