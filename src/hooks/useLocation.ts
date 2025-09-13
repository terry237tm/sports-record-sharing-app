/**
 * 位置 Hook
 * 提供基础的位置获取功能
 */

import { useState, useEffect, useCallback } from 'react';
import { LocationData } from '@/services/location/types';
import { getLocationService } from '@/services/location/LocationService';

/**
 * 位置 Hook 配置选项
 */
export interface LocationOptions {
  /** 是否自动获取位置 */
  autoFetch?: boolean;
  /** 获取间隔（毫秒） */
  interval?: number;
  /** 是否启用高精度 */
  highAccuracy?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否使用缓存 */
  useCache?: boolean;
}

/**
 * 位置 Hook 返回值
 */
export interface UseLocationReturn {
  /** 位置数据 */
  location: LocationData | null;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 获取当前位置 */
  getCurrentLocation: (options?: Partial<LocationOptions>) => Promise<LocationData | null>;
  /** 刷新位置 */
  refreshLocation: () => Promise<LocationData | null>;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 基础位置 Hook
 * 
 * @param options - 配置选项
 * @returns 位置服务功能
 */
export function useLocation(options: LocationOptions = {}): UseLocationReturn {
  // 默认配置
  const defaultOptions: LocationOptions = {
    autoFetch: false,
    interval: 0,
    highAccuracy: true,
    timeout: 10000,
    useCache: true
  };

  const [currentOptions, setCurrentOptions] = useState<LocationOptions>({
    ...defaultOptions,
    ...options
  });

  // 状态管理
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 位置服务实例
  const locationService = getLocationService({
    highAccuracy: currentOptions.highAccuracy,
    timeout: currentOptions.timeout,
    cacheTimeout: currentOptions.useCache ? 5 * 60 * 1000 : 0
  });

  /**
   * 获取当前位置
   */
  const getCurrentLocation = useCallback(async (fetchOptions: Partial<LocationOptions> = {}): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      const mergedOptions = { ...currentOptions, ...fetchOptions };
      
      // 根据选项选择不同的策略
      let locationData: LocationData;
      
      if (mergedOptions.useCache) {
        // 使用缓存优先策略
        locationData = await locationService.cacheFirst();
      } else if (mergedOptions.highAccuracy) {
        // 使用高精度策略
        locationData = await locationService.highAccuracy();
      } else {
        // 使用平衡策略
        locationData = await locationService.balanced();
      }

      setLocation(locationData);
      return locationData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取位置失败';
      setError(errorMessage);
      console.error('位置获取失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [locationService, currentOptions]);

  /**
   * 刷新位置（强制获取最新位置）
   */
  const refreshLocation = useCallback(async (): Promise<LocationData | null> => {
    return getCurrentLocation({ useCache: false });
  }, [getCurrentLocation]);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((newOptions: Partial<LocationOptions>) => {
    setCurrentOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  /**
   * 初始化位置获取
   */
  useEffect(() => {
    if (currentOptions.autoFetch) {
      getCurrentLocation();
    }
  }, []); // 只在组件挂载时执行一次

  /**
   * 设置定时器
   */
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (currentOptions.interval && currentOptions.interval > 0) {
      intervalId = setInterval(() => {
        getCurrentLocation();
      }, currentOptions.interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentOptions.interval, getCurrentLocation]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    refreshLocation,
    clearError
  };
}

export default useLocation;