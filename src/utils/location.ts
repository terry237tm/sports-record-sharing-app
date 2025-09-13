/**
 * 地理位置工具函数
 * 提供坐标验证、距离计算、格式化等功能
 */

import { LocationData } from '@/types/location'

/**
 * 验证坐标是否有效
 */
export const validateCoordinates = (latitude: number, longitude: number): boolean => {
  // 验证纬度范围: -90 到 90
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return false
  }
  
  // 验证经度范围: -180 到 180
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return false
  }
  
  return true
}

/**
 * 计算两点间的距离（米）
 * 使用Haversine公式计算球面距离
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // 验证坐标
  if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
    return -1
  }
  
  // 转换为弧度
  const toRad = (degree: number) => (degree * Math.PI) / 180
  
  const R = 6371000 // 地球半径（米）
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lon2 - lon1)
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

/**
 * 格式化坐标显示
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
  precision: number = 6
): string => {
  if (!validateCoordinates(latitude, longitude)) {
    return '无效坐标'
  }
  
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`
}

/**
 * 格式化地址显示
 */
export const formatAddress = (location: LocationData, format: 'full' | 'short' | 'city' = 'full'): string => {
  if (!location.address) {
    return formatCoordinates(location.latitude, location.longitude)
  }
  
  switch (format) {
    case 'short':
      // 返回简短地址（区县+街道）
      if (location.district && location.address.includes(location.district)) {
        return location.address
      }
      return `${location.district || location.city || ''}${location.address}`
      
    case 'city':
      // 返回城市级别地址
      return `${location.province || ''}${location.city || ''}${location.district || ''}`
      
    case 'full':
    default:
      // 返回完整地址
      return location.address
  }
}

/**
 * 格式化距离显示
 */
export const formatDistance = (distance: number): string => {
  if (distance < 0) {
    return '未知距离'
  }
  
  if (distance < 1000) {
    return `${Math.round(distance)}米`
  } else {
    return `${(distance / 1000).toFixed(1)}公里`
  }
}

/**
 * 格式化精度显示
 */
export const formatAccuracy = (accuracy?: number): string => {
  if (!accuracy || accuracy < 0) {
    return '未知精度'
  }
  
  if (accuracy < 10) {
    return '高精度'
  } else if (accuracy < 50) {
    return '中等精度'
  } else {
    return '低精度'
  }
}

/**
 * 判断位置是否在中国境内
 */
export const isLocationInChina = (latitude: number, longitude: number): boolean => {
  // 中国大致范围：纬度 18°-54°，经度 73°-135°
  return latitude >= 18 && latitude <= 54 && longitude >= 73 && longitude <= 135
}

/**
 * 转换坐标系（GCJ-02 到 WGS-84）
 * 中国地图坐标系转换
 */
export const gcj02ToWgs84 = (gcjLat: number, gcjLon: number): { lat: number; lon: number } => {
  if (!isLocationInChina(gcjLat, gcjLon)) {
    return { lat: gcjLat, lon: gcjLon }
  }
  
  // 简化的坐标转换算法
  const a = 6378245.0 // 长半轴
  const ee = 0.00669342162296594323 // 扁率
  
  const transformLat = (lng: number, lat: number) => {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0
    return ret
  }
  
  const transformLon = (lng: number, lat: number) => {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0
    return ret
  }
  
  const lat = transformLat(gcjLon - 105.0, gcjLat - 35.0)
  const lon = transformLon(gcjLon - 105.0, gcjLat - 35.0)
  const radLat = gcjLat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  
  const latTransform = lat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * Math.PI)
  const lonTransform = lon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  
  return {
    lat: gcjLat - latTransform,
    lon: gcjLon - lonTransform
  }
}

/**
 * 计算方位角（度）
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
    return 0
  }
  
  const toRad = (degree: number) => (degree * Math.PI) / 180
  const toDeg = (radian: number) => (radian * 180) / Math.PI
  
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lon2 - lon1)
  
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  
  const θ = Math.atan2(y, x)
  
  return (toDeg(θ) + 360) % 360
}

/**
 * 根据精度获取颜色类名
 */
export const getAccuracyColorClass = (accuracy?: number): string => {
  if (!accuracy) return 'text-secondary'
  
  if (accuracy < 10) {
    return 'text-success' // 高精度 - 绿色
  } else if (accuracy < 50) {
    return 'text-warning' // 中等精度 - 黄色
  } else {
    return 'text-danger' // 低精度 - 红色
  }
}

/**
 * 创建位置数据对象
 */
export const createLocationData = (
  latitude: number,
  longitude: number,
  address?: string,
  options?: Partial<LocationData>
): LocationData => {
  return {
    latitude,
    longitude,
    address: address || `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`,
    accuracy: options?.accuracy,
    timestamp: options?.timestamp || Date.now(),
    city: options?.city,
    district: options?.district,
    province: options?.province,
    country: options?.country,
    poi: options?.poi,
    ...options
  }
}

/**
 * 比较两个位置是否相同（考虑精度）
 */
export const isSameLocation = (
  loc1: LocationData,
  loc2: LocationData,
  precision: number = 0.0001 // 默认精度约11米
): boolean => {
  return Math.abs(loc1.latitude - loc2.latitude) < precision &&
         Math.abs(loc1.longitude - loc2.longitude) < precision
}

/**
 * 生成位置的唯一标识符
 */
export const generateLocationId = (location: LocationData): string => {
  return `${location.latitude.toFixed(6)}-${location.longitude.toFixed(6)}`
}

export default {
  validateCoordinates,
  calculateDistance,
  formatCoordinates,
  formatAddress,
  formatDistance,
  formatAccuracy,
  isLocationInChina,
  gcj02ToWgs84,
  calculateBearing,
  getAccuracyColorClass,
  createLocationData,
  isSameLocation,
  generateLocationId
}