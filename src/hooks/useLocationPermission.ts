/**
 * 位置权限管理React Hook
 * 提供位置权限状态管理、请求和错误处理功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LocationPermissionStatus, 
  LocationError 
} from '../services/location/types';
import {
  checkLocationPermission,
  requestLocationPermission,
  ensureLocationPermission,
  getPermissionCheckResult,
  PermissionOptions,
  PermissionCheckResult,
  permissionManager
} from '../utils/location/permission';

/**
 * 权限Hook配置选项
 */
export interface UseLocationPermissionOptions extends PermissionOptions {
  /** 是否自动检查权限 */
  autoCheck?: boolean;
  /** 是否监听权限变化 */
  listenChanges?: boolean;
  /** 错误回调函数 */
  onError?: (error: LocationError) => void;
  /** 权限状态变化回调 */
  onStatusChange?: (status: LocationPermissionStatus) => void;
}

/**
 * 权限Hook返回结果
 */
export interface UseLocationPermissionResult {
  /** 当前权限状态 */
  status: LocationPermissionStatus;
  /** 是否已授权 */
  isGranted: boolean;
  /** 是否被拒绝 */
  isDenied: boolean;
  /** 是否未确定 */
  isNotDetermined: boolean;
  /** 是否受限制 */
  isRestricted: boolean;
  /** 是否可以请求权限 */
  canRequest: boolean;
  /** 是否显示权限引导 */
  shouldShowGuide: boolean;
  /** 是否正在检查权限 */
  isChecking: boolean;
  /** 是否正在请求权限 */
  isRequesting: boolean;
  /** 权限检查详细结果 */
  checkResult: PermissionCheckResult | null;
  /** 检查权限函数 */
  checkPermission: () => Promise<void>;
  /** 请求权限函数 */
  requestPermission: (options?: PermissionOptions) => Promise<boolean>;
  /** 确保权限函数 */
  ensurePermission: (options?: PermissionOptions) => Promise<boolean>;
  /** 刷新权限状态函数 */
  refreshPermission: () => Promise<void>;
}

/**
 * 位置权限管理Hook
 * @param options 配置选项
 * @returns 权限管理状态和函数
 */
export function useLocationPermission(
  options: UseLocationPermissionOptions = {}
): UseLocationPermissionResult {
  const {
    autoCheck = true,
    listenChanges = true,
    onError,
    onStatusChange,
    ...permissionOptions
  } = options;

  const [status, setStatus] = useState<LocationPermissionStatus>(
    LocationPermissionStatus.NOT_DETERMINED
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [checkResult, setCheckResult] = useState<PermissionCheckResult | null>(null);
  
  const listenerRef = useRef<(() => void) | null>(null);

  /**
   * 检查权限状态
   */
  const checkPermission = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await getPermissionCheckResult(permissionOptions);
      setStatus(result.status);
      setCheckResult(result);
      onStatusChange?.(result.status);
    } catch (error) {
      const locationError = error as LocationError;
      console.error('检查权限失败:', locationError);
      onError?.(locationError);
    } finally {
      setIsChecking(false);
    }
  }, [permissionOptions, onStatusChange, onError]);

  /**
   * 请求权限
   */
  const requestPermission = useCallback(
    async (requestOptions?: PermissionOptions): Promise<boolean> => {
      setIsRequesting(true);
      try {
        const mergedOptions = { ...permissionOptions, ...requestOptions };
        const newStatus = await requestLocationPermission(mergedOptions);
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        return newStatus === LocationPermissionStatus.GRANTED;
      } catch (error) {
        const locationError = error as LocationError;
        console.error('请求权限失败:', locationError);
        onError?.(locationError);
        return false;
      } finally {
        setIsRequesting(false);
      }
    },
    [permissionOptions, onStatusChange, onError]
  );

  /**
   * 确保权限
   */
  const ensurePermission = useCallback(
    async (ensureOptions?: PermissionOptions): Promise<boolean> => {
      setIsRequesting(true);
      try {
        const mergedOptions = { ...permissionOptions, ...ensureOptions };
        const hasPermission = await ensureLocationPermission(mergedOptions);
        const newStatus = hasPermission 
          ? LocationPermissionStatus.GRANTED 
          : LocationPermissionStatus.DENIED;
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        return hasPermission;
      } catch (error) {
        const locationError = error as LocationError;
        console.error('确保权限失败:', locationError);
        onError?.(locationError);
        return false;
      } finally {
        setIsRequesting(false);
      }
    },
    [permissionOptions, onStatusChange, onError]
  );

  /**
   * 刷新权限状态
   */
  const refreshPermission = useCallback(async () => {
    await checkPermission();
  }, [checkPermission]);

  /**
   * 初始化权限检查
   */
  useEffect(() => {
    if (autoCheck) {
      checkPermission();
    }
  }, [autoCheck, checkPermission]);

  /**
   * 监听权限变化
   */
  useEffect(() => {
    if (listenChanges) {
      // 使用权限管理器的监听器
      const unsubscribe = permissionManager.instance.addListener((newStatus) => {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      });
      
      listenerRef.current = unsubscribe;
      
      return () => {
        if (listenerRef.current) {
          listenerRef.current();
          listenerRef.current = null;
        }
      };
    }
  }, [listenChanges, onStatusChange]);

  /**
   * 计算权限状态
   */
  const isGranted = status === LocationPermissionStatus.GRANTED;
  const isDenied = status === LocationPermissionStatus.DENIED;
  const isNotDetermined = status === LocationPermissionStatus.NOT_DETERMINED;
  const isRestricted = status === LocationPermissionStatus.RESTRICTED;

  const canRequest = checkResult?.canRequest ?? false;
  const shouldShowGuide = checkResult?.shouldShowGuide ?? false;

  return {
    status,
    isGranted,
    isDenied,
    isNotDetermined,
    isRestricted,
    canRequest,
    shouldShowGuide,
    isChecking,
    isRequesting,
    checkResult,
    checkPermission,
    requestPermission,
    ensurePermission,
    refreshPermission
  };
}

/**
 * 简化的权限检查Hook
 * 仅返回基本的权限状态和操作函数
 */
export function useSimpleLocationPermission() {
  const {
    status,
    isGranted,
    isChecking,
    isRequesting,
    checkPermission,
    requestPermission,
    ensurePermission
  } = useLocationPermission();

  return {
    status,
    isGranted,
    isChecking,
    isRequesting,
    checkPermission,
    requestPermission,
    ensurePermission
  };
}

/**
 * 权限状态监听Hook
 * 仅用于监听权限状态变化
 */
export function useLocationPermissionListener(
  callback: (status: LocationPermissionStatus) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = permissionManager.instance.addListener(callback);
    return unsubscribe;
  }, deps);
}