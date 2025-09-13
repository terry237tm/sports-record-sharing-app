/**
 * LocationService Hook
 * 提供位置服务的便捷访问
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { LocationService } from '@/services/location/LocationService'
import { 
  LocationData, 
  LocationServiceOptions, 
  LocationError,
  LocationPermissionStatus 
} from '@/services/location/types'
import { locationConfig } from '@/config/location'

/**
 * LocationService Hook 返回类型
 */
export interface UseLocationServiceReturn {
  // 服务状态
  isLoading: boolean
  error: LocationError | null
  permissionStatus: LocationPermissionStatus
  
  // 位置数据
  currentLocation: LocationData | null
  
  // 操作方法
  getCurrentLocation: () => Promise<LocationData>
  getLocationByStrategy: (strategy: 'highAccuracy' | 'balanced' | 'lowPower' | 'cacheFirst') => Promise<LocationData>
  reverseGeocoding: (latitude: number, longitude: number) => Promise<LocationData>
  searchLocation: (keyword: string) => Promise<LocationData[]>
  checkPermission: () => Promise<LocationPermissionStatus>
  requestPermission: () => Promise<boolean>
  
  // 工具方法
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
  validateCoordinates: (latitude: number, longitude: number) => boolean
}

/**
 * LocationService Hook
 */
export const useLocationService = (options?: LocationServiceOptions): UseLocationServiceReturn => {
  const [service] = useState(() => new LocationService({
    ...locationConfig.serviceOptions,
    ...options
  }))
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LocationError | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>(
    LocationPermissionStatus.NOT_DETERMINED
  )
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)

  // 初始化权限状态
  useEffect(() => {
    const initPermission = async () => {
      try {
        const status = await service.checkPermission()
        setPermissionStatus(status)
      } catch (error) {
        console.error('检查权限失败:', error)
      }
    }
    
    initPermission()
  }, [service])

  /**
   * 获取当前位置
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const location = await service.getCurrentLocation()
      setCurrentLocation(location)
      return location
    } catch (error) {
      setError(error as LocationError)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [service])

  /**
   * 根据策略获取位置
   */
  const getLocationByStrategy = useCallback(
    async (strategy: 'highAccuracy' | 'balanced' | 'lowPower' | 'cacheFirst'): Promise<LocationData> => {
      setIsLoading(true)
      setError(null)
      
      try {
        let location: LocationData
        
        switch (strategy) {
          case 'highAccuracy':
            location = await service.highAccuracy()
            break
          case 'balanced':
            location = await service.balanced()
            break
          case 'lowPower':
            location = await service.lowPower()
            break
          case 'cacheFirst':
            location = await service.cacheFirst()
            break
          default:
            location = await service.getCurrentLocation()
        }
        
        setCurrentLocation(location)
        return location
      } catch (error) {
        setError(error as LocationError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [service]
  )

  /**
   * 逆地址解析
   */
  const reverseGeocoding = useCallback(
    async (latitude: number, longitude: number): Promise<LocationData> => {
      setIsLoading(true)
      setError(null)
      
      try {
        const location = await service.reverseGeocoding(latitude, longitude)
        return location
      } catch (error) {
        setError(error as LocationError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [service]
  )

  /**
   * 地址搜索
   */
  const searchLocation = useCallback(
    async (keyword: string): Promise<LocationData[]> => {
      if (!keyword.trim()) {
        return []
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const results = await service.searchLocation(keyword)
        return results
      } catch (error) {
        setError(error as LocationError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [service]
  )

  /**
   * 检查权限
   */
  const checkPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      const status = await service.checkPermission()
      setPermissionStatus(status)
      return status
    } catch (error) {
      setError(error as LocationError)
      throw error
    }
  }, [service])

  /**
   * 请求权限
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await service.requestPermission()
      if (granted) {
        setPermissionStatus(LocationPermissionStatus.GRANTED)
      } else {
        setPermissionStatus(LocationPermissionStatus.DENIED)
      }
      return granted
    } catch (error) {
      setError(error as LocationError)
      return false
    }
  }, [service])

  /**
   * 计算距离
   */
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      return service.calculateDistance(lat1, lon1, lat2, lon2)
    },
    [service]
  )

  /**
   * 验证坐标
   */
  const validateCoordinates = useCallback(
    (latitude: number, longitude: number): boolean => {
      return service.validateCoordinates(latitude, longitude)
    },
    [service]
  )

  return {
    isLoading,
    error,
    permissionStatus,
    currentLocation,
    getCurrentLocation,
    getLocationByStrategy,
    reverseGeocoding,
    searchLocation,
    checkPermission,
    requestPermission,
    calculateDistance,
    validateCoordinates
  }
}

/**
 * 防抖 Hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 位置变化监听 Hook
 */
export const useLocationChange = (
  callback: (location: LocationData) => void,
  interval = 5000
) => {
  const locationService = useLocationService()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const watchLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation()
        callback(location)
      } catch (error) {
        console.error('监听位置变化失败:', error)
      }
    }

    // 立即获取一次位置
    watchLocation()

    // 设置定时监听
    intervalRef.current = setInterval(watchLocation, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [locationService, callback, interval])
}

/**
 * 地理位置权限 Hook
 */
export const useLocationPermission = () => {
  const locationService = useLocationService()
  const [hasPermission, setHasPermission] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      setIsChecking(true)
      try {
        const status = await locationService.checkPermission()
        setHasPermission(status === LocationPermissionStatus.GRANTED)
      } catch (error) {
        console.error('检查权限失败:', error)
        setHasPermission(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkPermission()
  }, [locationService])

  const requestPermission = useCallback(async () => {
    try {
      const granted = await locationService.requestPermission()
      setHasPermission(granted)
      return granted
    } catch (error) {
      console.error('请求权限失败:', error)
      return false
    }
  }, [locationService])

  return {
    hasPermission,
    isChecking,
    requestPermission
  }
}

export default useLocationService