/**
 * 位置服务生态系统 Hook
 * 提供统一的位置服务功能，集成所有Stream组件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationData, LocationPermissionStatus } from '@/services/location/types';
import { LocationEcosystem, getLocationEcosystem } from '@/services/location/LocationEcosystem';
import { useLocationPermission } from './useLocationPermission';

/**
 * 位置生态系统配置
 */
export interface UseLocationEcosystemOptions {
  /** 是否自动获取位置 */
  autoFetch?: boolean;
  /** 获取间隔（毫秒） */
  interval?: number;
  /** 策略类型 */
  strategy?: 'smart' | 'highAccuracy' | 'balanced' | 'lowPower' | 'cacheFirst';
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 是否启用隐私保护 */
  enablePrivacy?: boolean;
  /** 访问者信息 */
  accessor?: any;
  /** 是否启用监控 */
  enableMonitoring?: boolean;
}

/**
 * 位置生态系统状态
 */
export interface LocationEcosystemState {
  /** 位置数据 */
  location: LocationData | null;
  /** 位置历史 */
  locationHistory: LocationData[];
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 权限状态 */
  permissionStatus: LocationPermissionStatus;
  /** 生态系统状态 */
  ecosystemStatus: any;
  /** 性能指标 */
  performanceMetrics: any;
  /** 是否启用缓存 */
  isCacheEnabled: boolean;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 当前策略 */
  currentStrategy: string;
  /** 是否启用隐私保护 */
  isPrivacyEnabled: boolean;
}

/**
 * 位置生态系统 Hook 返回值
 */
export interface UseLocationEcosystemReturn extends LocationEcosystemState {
  /** 获取当前位置 */
  getCurrentLocation: (options?: Partial<UseLocationEcosystemOptions>) => Promise<LocationData | null>;
  /** 刷新位置 */
  refreshLocation: () => Promise<LocationData | null>;
  /** 获取位置历史 */
  getLocationHistory: (options?: { limit?: number; startTime?: number; endTime?: number }) => Promise<LocationData[]>;
  /** 搜索附近位置 */
  searchNearbyLocations: (center: LocationData, radius: number) => Promise<LocationData[]>;
  /** 清除缓存 */
  clearCache: () => void;
  /** 重置生态系统 */
  resetEcosystem: () => void;
  /** 更新配置 */
  updateConfig: (config: Partial<UseLocationEcosystemOptions>) => void;
}

/**
 * 位置服务生态系统 Hook
 * 
 * @param options - 配置选项
 * @returns 位置服务功能
 */
export function useLocationEcosystem(
  options: UseLocationEcosystemOptions = {}
): UseLocationEcosystemReturn {
  // 默认配置
  const defaultOptions: UseLocationEcosystemOptions = {
    autoFetch: false,
    interval: 0,
    strategy: 'smart',
    enableCache: true,
    enablePrivacy: true,
    enableMonitoring: true
  };

  const [currentOptions, setCurrentOptions] = useState<UseLocationEcosystemOptions>({
    ...defaultOptions,
    ...options
  });

  // 状态管理
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ecosystemStatus, setEcosystemStatus] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);
  const [currentStrategy, setCurrentStrategy] = useState<string>('smart');

  // 权限 Hook
  const { 
    status: permissionStatus, 
    isGranted, 
    requestPermission 
  } = useLocationPermission();

  // 生态系统实例
  const ecosystemRef = useRef<LocationEcosystem | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 获取生态系统实例
   */
  const getEcosystem = useCallback((): LocationEcosystem => {
    if (!ecosystemRef.current) {
      ecosystemRef.current = getLocationEcosystem({
        cache: {
          maxSize: 100,
          ttl: 5 * 60 * 1000, // 5分钟
          enablePersistence: currentOptions.enableCache
        },
        strategy: {
          enableAdaptiveSelection: currentOptions.strategy === 'smart',
          performanceWeight: 0.4,
          accuracyWeight: 0.3,
          powerWeight: 0.3
        },
        privacy: {
          enableEncryption: currentOptions.enablePrivacy,
          enableMasking: currentOptions.enablePrivacy,
          maskingAccuracy: 100,
          enableAccessControl: currentOptions.enablePrivacy
        },
        monitoring: {
          enablePerformanceMonitoring: currentOptions.enableMonitoring,
          enableErrorTracking: currentOptions.enableMonitoring,
          enableUsageAnalytics: currentOptions.enableMonitoring
        }
      });
    }
    return ecosystemRef.current;
  }, [currentOptions]);

  /**
   * 获取当前位置
   */
  const getCurrentLocation = useCallback(async (
    fetchOptions: Partial<UseLocationEcosystemOptions> = {}
  ): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      // 检查权限
      if (!isGranted) {
        await requestPermission();
        if (!isGranted) {
          throw new Error('位置权限被拒绝');
        }
      }

      const ecosystem = getEcosystem();
      const mergedOptions = { ...currentOptions, ...fetchOptions };
      
      const locationData = await ecosystem.getCurrentLocation({
        useCache: mergedOptions.enableCache,
        strategy: mergedOptions.strategy,
        enablePrivacy: mergedOptions.enablePrivacy,
        accessor: mergedOptions.accessor
      });

      setLocation(locationData);
      setCurrentStrategy(mergedOptions.strategy || 'smart');
      
      // 更新状态信息
      await updateStatusInfo();
      
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取位置失败';
      setError(errorMessage);
      
      // 记录错误到监控系统
      const ecosystem = getEcosystem();
      const errorReport = ecosystem.getErrorReport();
      console.error('位置获取失败:', errorMessage, errorReport);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [getEcosystem, currentOptions, isGranted, requestPermission]);

  /**
   * 刷新位置
   */
  const refreshLocation = useCallback(async (): Promise<LocationData | null> => {
    return getCurrentLocation({ enableCache: false });
  }, [getCurrentLocation]);

  /**
   * 获取位置历史
   */
  const getLocationHistory = useCallback(async (
    historyOptions: { limit?: number; startTime?: number; endTime?: number } = {}
  ): Promise<LocationData[]> => {
    try {
      const ecosystem = getEcosystem();
      const history = await ecosystem.getLocationHistory({
        ...historyOptions,
        enablePrivacy: currentOptions.enablePrivacy
      });
      
      setLocationHistory(history);
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取位置历史失败';
      setError(errorMessage);
      return [];
    }
  }, [getEcosystem, currentOptions.enablePrivacy]);

  /**
   * 搜索附近位置
   */
  const searchNearbyLocations = useCallback(async (
    center: LocationData,
    radius: number
  ): Promise<LocationData[]> => {
    try {
      const ecosystem = getEcosystem();
      const nearbyLocations = await ecosystem.searchNearbyLocations(center, radius);
      return nearbyLocations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '搜索附近位置失败';
      setError(errorMessage);
      return [];
    }
  }, [getEcosystem]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback((): void => {
    const ecosystem = getEcosystem();
    const cacheManager = (ecosystem as any).cacheManager;
    if (cacheManager) {
      cacheManager.clear();
      setCacheHitRate(0);
    }
  }, [getEcosystem]);

  /**
   * 重置生态系统
   */
  const resetEcosystem = useCallback((): void => {
    if (ecosystemRef.current) {
      ecosystemRef.current.destroy();
      ecosystemRef.current = null;
    }
    
    // 重置状态
    setLocation(null);
    setLocationHistory([]);
    setError(null);
    setCacheHitRate(0);
    setEcosystemStatus(null);
    setPerformanceMetrics(null);
    
    // 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((config: Partial<UseLocationEcosystemOptions>): void => {
    setCurrentOptions(prev => ({ ...prev, ...config }));
  }, []);

  /**
   * 更新状态信息
   */
  const updateStatusInfo = useCallback(async (): Promise<void> => {
    try {
      const ecosystem = getEcosystem();
      const status = ecosystem.getStatus();
      const metrics = ecosystem.getPerformanceMetrics();
      
      setEcosystemStatus(status);
      setPerformanceMetrics(metrics);
      setCacheHitRate(status.cache.hitRate);
    } catch (err) {
      console.warn('更新状态信息失败:', err);
    }
  }, [getEcosystem]);

  /**
   * 初始化生态系统
   */
  useEffect(() => {
    const initializeEcosystem = async (): Promise<void> => {
      try {
        // 获取初始状态
        await updateStatusInfo();
        
        // 如果启用了自动获取，获取初始位置
        if (currentOptions.autoFetch) {
          await getCurrentLocation();
        }
        
        // 获取位置历史
        if (currentOptions.enableCache) {
          await getLocationHistory({ limit: 50 });
        }
      } catch (err) {
        console.error('初始化生态系统失败:', err);
      }
    };

    initializeEcosystem();
  }, []); // 只在组件挂载时执行一次

  /**
   * 设置定时器
   */
  useEffect(() => {
    if (currentOptions.interval && currentOptions.interval > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        getCurrentLocation();
      }, currentOptions.interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentOptions.interval, getCurrentLocation]);

  /**
   * 权限变化监听
   */
  useEffect(() => {
    if (isGranted && currentOptions.autoFetch && !location) {
      getCurrentLocation();
    }
  }, [isGranted, currentOptions.autoFetch, location, getCurrentLocation]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // 不销毁生态系统实例，以便在组件间共享
      // 但可以选择性地清理监听器
    };
  }, []);

  return {
    // 状态
    location,
    locationHistory,
    loading,
    error,
    permissionStatus,
    ecosystemStatus,
    performanceMetrics,
    isCacheEnabled: currentOptions.enableCache || false,
    cacheHitRate,
    currentStrategy,
    isPrivacyEnabled: currentOptions.enablePrivacy || false,
    
    // 方法
    getCurrentLocation,
    refreshLocation,
    getLocationHistory,
    searchNearbyLocations,
    clearCache,
    resetEcosystem,
    updateConfig
  };
}

export default useLocationEcosystem;