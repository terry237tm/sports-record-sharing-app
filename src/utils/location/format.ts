/**
 * 位置信息格式化工具
 * 提供位置信息的格式化和处理功能
 */

import { LocationData } from '../../services/location/types';
import { FormattedAddress, AccuracyConfig } from '../../types/location';

/**
 * 格式化地址信息
 * @param location 位置数据
 * @param format 格式类型
 * @returns 格式化后的地址信息
 */
export function formatAddress(location: LocationData | null, format: 'full' | 'short' | 'city' = 'full'): FormattedAddress {
  if (!location) {
    return {
      full: '未知位置',
      short: '未知位置',
      city: '未知城市',
      district: '',
      province: '',
    };
  }

  const { address, city, district, province, poi } = location;
  
  // 构建不同格式的地址
  const full = address || (poi ? `${poi}附近` : '未知位置');
  const short = poi || district || city || province || '未知位置';
  const cityText = city || district || province || '未知城市';

  return {
    full,
    short,
    city: cityText,
    district: district || '',
    province: province || '',
    poi: poi || undefined,
  };
}

/**
 * 获取精度配置
 * @param accuracy 精度值（米）
 * @returns 精度配置
 */
export function getAccuracyConfig(accuracy?: number): AccuracyConfig {
  if (accuracy === undefined) {
    return {
      range: '未知',
      level: 'low',
      color: 'error',
      description: '精度信息不可用',
    };
  }

  if (accuracy <= 10) {
    return {
      range: '≤10米',
      level: 'high',
      color: 'success',
      description: '高精度定位',
    };
  } else if (accuracy <= 100) {
    return {
      range: '≤100米',
      level: 'medium',
      color: 'warning',
      description: '中等精度定位',
    };
  } else {
    return {
      range: `>100米`,
      level: 'low',
      color: 'error',
      description: '低精度定位',
    };
  }
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @returns 格式化的时间字符串
 */
export function formatTimestamp(timestamp?: number): string {
  if (!timestamp) {
    return '未知时间';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  // 超过7天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 获取位置状态图标
 * @param location 位置数据
 * @param loading 是否加载中
 * @param error 错误信息
 * @returns 状态图标类名
 */
export function getLocationIcon(location: LocationData | null, loading?: boolean, error?: string | null): string {
  if (loading) {
    return 'icon-loading';
  }
  
  if (error) {
    return 'icon-error';
  }
  
  if (!location) {
    return 'icon-unknown';
  }
  
  if (location.accuracy <= 10) {
    return 'icon-high-accuracy';
  } else if (location.accuracy <= 100) {
    return 'icon-medium-accuracy';
  } else {
    return 'icon-low-accuracy';
  }
}

/**
 * 验证位置数据
 * @param location 位置数据
 * @returns 是否有效
 */
export function isValidLocation(location: LocationData | null): boolean {
  if (!location) {
    return false;
  }

  // 检查经纬度是否在有效范围内
  const validLatitude = location.latitude >= -90 && location.latitude <= 90;
  const validLongitude = location.longitude >= -180 && location.longitude <= 180;
  
  return validLatitude && validLongitude;
}

/**
 * 计算两个位置之间的距离
 * @param loc1 位置1
 * @param loc2 位置2
 * @returns 距离（米）
 */
export function calculateDistance(loc1: LocationData, loc2: LocationData): number {
  const R = 6371000; // 地球半径（米）
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 创建默认位置数据
 * @returns 默认位置数据
 */
export function createDefaultLocation(): LocationData {
  return {
    latitude: 0,
    longitude: 0,
    address: '未知位置',
    timestamp: Date.now(),
    accuracy: 0,
  };
}

/**
 * 克隆位置数据
 * @param location 原始位置数据
 * @returns 克隆后的位置数据
 */
export function cloneLocation(location: LocationData): LocationData {
  return {
    ...location,
    timestamp: location.timestamp || Date.now(),
  };
}

/**
 * 比较两个位置是否相同
 * @param loc1 位置1
 * @param loc2 位置2
 * @param tolerance 容差（米）
 * @returns 是否相同
 */
export function isSameLocation(loc1: LocationData | null, loc2: LocationData | null, tolerance: number = 10): boolean {
  if (!loc1 || !loc2) {
    return loc1 === loc2;
  }

  const distance = calculateDistance(loc1, loc2);
  return distance <= tolerance;
}

/**
 * 获取位置描述
 * @param location 位置数据
 * @param format 格式类型
 * @returns 位置描述
 */
export function getLocationDescription(location: LocationData | null, format: 'full' | 'short' | 'city' = 'short'): string {
  if (!location) {
    return '未知位置';
  }

  const formatted = formatAddress(location, format);
  
  // 根据格式返回相应的描述
  switch (format) {
    case 'full':
      return formatted.full;
    case 'city':
      return formatted.city;
    case 'short':
    default:
      return formatted.short;
  }
}

/**
 * 格式化精度信息
 * @param accuracy 精度值（米）
 * @returns 格式化的精度字符串
 */
export function formatAccuracy(accuracy?: number): string {
  if (accuracy === undefined) {
    return '精度未知';
  }

  const config = getAccuracyConfig(accuracy);
  return `${config.range} · ${config.description}`;
}

/**
 * 格式化坐标
 * @param latitude 纬度
 * @param longitude 经度
 * @param precision 精度
 * @returns 格式化的坐标字符串
 */
export function formatCoordinate(latitude: number, longitude: number, precision: number = 6): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}