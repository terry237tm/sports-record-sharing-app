/**
 * 位置权限管理工具
 * 提供位置权限检查、请求和管理功能
 */

import Taro from '@tarojs/taro';
import { 
  LocationPermissionStatus, 
  LocationError, 
  LocationErrorType 
} from '../../services/location/types';
import { ERROR_MESSAGES, USER_MESSAGES } from '../../services/location/constants';

/**
 * 权限配置选项
 */
export interface PermissionOptions {
  /** 是否显示权限引导 */
  showGuide?: boolean;
  /** 自定义权限请求文案 */
  permissionText?: string;
  /** 是否强制请求权限 */
  forceRequest?: boolean;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  status: LocationPermissionStatus;
  canRequest: boolean;
  shouldShowGuide: boolean;
  message?: string;
}

/**
 * 检查位置权限状态
 * @returns 权限状态
 */
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
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
    console.error('检查位置权限失败:', error);
    return LocationPermissionStatus.NOT_DETERMINED;
  }
}

/**
 * 请求位置权限
 * @param options 权限配置选项
 * @returns 权限状态
 */
export async function requestLocationPermission(
  options: PermissionOptions = {}
): Promise<LocationPermissionStatus> {
  const { showGuide = true, permissionText = USER_MESSAGES.PERMISSION_REQUEST } = options;
  
  try {
    // 首先检查当前权限状态
    const currentStatus = await checkLocationPermission();
    
    // 如果已经授权，直接返回
    if (currentStatus === LocationPermissionStatus.GRANTED) {
      return currentStatus;
    }
    
    // 如果已被拒绝且不是强制请求，返回拒绝状态
    if (currentStatus === LocationPermissionStatus.DENIED && !options.forceRequest) {
      return currentStatus;
    }
    
    // 请求权限
    await Taro.authorize({
      scope: 'scope.userLocation'
    });
    
    return LocationPermissionStatus.GRANTED;
    
  } catch (error) {
    console.error('请求位置权限失败:', error);
    
    // 如果用户拒绝，检查是否需要显示引导
    if (showGuide) {
      await showPermissionGuide();
    }
    
    return LocationPermissionStatus.DENIED;
  }
}

/**
 * 显示权限引导
 */
export async function showPermissionGuide(): Promise<void> {
  try {
    const result = await Taro.showModal({
      title: '位置权限指引',
      content: USER_MESSAGES.PERMISSION_GUIDE,
      confirmText: '去设置',
      cancelText: '取消',
      showCancel: true
    });
    
    if (result.confirm) {
      // 打开设置页面
      await openAppSettings();
    }
  } catch (error) {
    console.error('显示权限引导失败:', error);
  }
}

/**
 * 打开应用设置页面
 */
export async function openAppSettings(): Promise<void> {
  try {
    await Taro.openSetting({
      withSubscriptions: false
    });
  } catch (error) {
    console.error('打开设置页面失败:', error);
    throw new Error('无法打开设置页面');
  }
}

/**
 * 获取权限检查结果
 * @param options 权限配置选项
 * @returns 权限检查结果
 */
export async function getPermissionCheckResult(
  options: PermissionOptions = {}
): Promise<PermissionCheckResult> {
  const status = await checkLocationPermission();
  
  let canRequest = false;
  let shouldShowGuide = false;
  let message: string | undefined;
  
  switch (status) {
    case LocationPermissionStatus.GRANTED:
      message = '位置权限已授权';
      canRequest = false;
      shouldShowGuide = false;
      break;
      
    case LocationPermissionStatus.DENIED:
      message = ERROR_MESSAGES.PERMISSION_DENIED;
      canRequest = false;
      shouldShowGuide = true;
      break;
      
    case LocationPermissionStatus.NOT_DETERMINED:
      message = '位置权限未确定，可以请求授权';
      canRequest = true;
      shouldShowGuide = false;
      break;
      
    case LocationPermissionStatus.RESTRICTED:
      message = '位置权限受限制，无法获取位置信息';
      canRequest = false;
      shouldShowGuide = true;
      break;
      
    default:
      message = '未知权限状态';
      canRequest = false;
      shouldShowGuide = false;
  }
  
  return {
    status,
    canRequest,
    shouldShowGuide,
    message
  };
}

/**
 * 确保位置权限
 * @param options 权限配置选项
 * @returns 是否有权限
 */
export async function ensureLocationPermission(
  options: PermissionOptions = {}
): Promise<boolean> {
  const result = await getPermissionCheckResult(options);
  
  if (result.status === LocationPermissionStatus.GRANTED) {
    return true;
  }
  
  if (result.canRequest) {
    const newStatus = await requestLocationPermission(options);
    return newStatus === LocationPermissionStatus.GRANTED;
  }
  
  if (result.shouldShowGuide && options.showGuide !== false) {
    await showPermissionGuide();
    // 重新检查权限状态
    const newResult = await getPermissionCheckResult();
    return newResult.status === LocationPermissionStatus.GRANTED;
  }
  
  return false;
}

/**
 * 检查系统定位服务是否开启
 * @returns 是否开启
 */
export async function checkSystemLocationService(): Promise<boolean> {
  try {
    const systemInfo = await Taro.getSystemInfo();
    
    // 检查是否支持定位
    if (!systemInfo.locationEnabled) {
      return false;
    }
    
    // 检查定位服务是否开启
    return systemInfo.locationEnabled === true;
  } catch (error) {
    console.error('检查系统定位服务失败:', error);
    return false;
  }
}

/**
 * 获取权限状态描述
 * @param status 权限状态
 * @returns 状态描述
 */
export function getPermissionStatusText(status: LocationPermissionStatus): string {
  switch (status) {
    case LocationPermissionStatus.GRANTED:
      return '已授权';
    case LocationPermissionStatus.DENIED:
      return '被拒绝';
    case LocationPermissionStatus.NOT_DETERMINED:
      return '未确定';
    case LocationPermissionStatus.RESTRICTED:
      return '受限制';
    default:
      return '未知';
  }
}

/**
 * 创建权限错误
 * @param status 权限状态
 * @returns 权限错误
 */
export function createPermissionError(status: LocationPermissionStatus): LocationError {
  let message = ERROR_MESSAGES.PERMISSION_DENIED;
  
  switch (status) {
    case LocationPermissionStatus.DENIED:
      message = ERROR_MESSAGES.PERMISSION_DENIED;
      break;
    case LocationPermissionStatus.RESTRICTED:
      message = '位置权限受限制，请联系系统管理员';
      break;
    case LocationPermissionStatus.NOT_DETERMINED:
      message = '位置权限未确定，请先授权';
      break;
  }
  
  const error = new Error(message) as LocationError;
  error.type = LocationErrorType.PERMISSION_DENIED;
  error.name = 'LocationPermissionError';
  error.code = status;
  
  return error;
}

/**
 * 监听权限变化
 * @param callback 权限变化回调函数
 * @returns 取消监听的函数
 */
export function onPermissionChange(
  callback: (status: LocationPermissionStatus) => void
): () => void {
  let isListening = true;
  
  const checkPermission = async () => {
    if (!isListening) return;
    
    try {
      const status = await checkLocationPermission();
      callback(status);
    } catch (error) {
      console.error('检查权限状态失败:', error);
    }
    
    // 继续监听
    if (isListening) {
      setTimeout(checkPermission, 1000);
    }
  };
  
  // 开始监听
  checkPermission();
  
  // 返回取消监听函数
  return () => {
    isListening = false;
  };
}

/**
 * 权限管理器类
 */
export class PermissionManager {
  private currentStatus: LocationPermissionStatus = LocationPermissionStatus.NOT_DETERMINED;
  private listeners: Set<(status: LocationPermissionStatus) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startPermissionMonitoring();
  }
  
  /**
   * 获取当前权限状态
   */
  getStatus(): LocationPermissionStatus {
    return this.currentStatus;
  }
  
  /**
   * 检查权限
   */
  async checkPermission(): Promise<LocationPermissionStatus> {
    this.currentStatus = await checkLocationPermission();
    this.notifyListeners();
    return this.currentStatus;
  }
  
  /**
   * 请求权限
   */
  async requestPermission(options?: PermissionOptions): Promise<LocationPermissionStatus> {
    this.currentStatus = await requestLocationPermission(options);
    this.notifyListeners();
    return this.currentStatus;
  }
  
  /**
   * 添加权限变化监听器
   */
  addListener(callback: (status: LocationPermissionStatus) => void): () => void {
    this.listeners.add(callback);
    
    // 立即通知当前状态
    callback(this.currentStatus);
    
    // 返回移除监听器函数
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * 开始权限监控
   */
  private startPermissionMonitoring(): void {
    // 立即检查一次权限
    this.checkPermission();
    
    // 定期检查权限状态
    this.updateInterval = setInterval(async () => {
      await this.checkPermission();
    }, 5000); // 每5秒检查一次
  }
  
  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentStatus);
      } catch (error) {
        console.error('权限监听器执行失败:', error);
      }
    });
  }
  
  /**
   * 销毁权限管理器
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.listeners.clear();
  }
}

// 创建全局权限管理器实例（懒加载）
let _permissionManager: PermissionManager | null = null;

export const permissionManager = {
  get instance(): PermissionManager {
    if (!_permissionManager) {
      _permissionManager = new PermissionManager();
    }
    return _permissionManager;
  },
  
  destroy(): void {
    if (_permissionManager) {
      _permissionManager.destroy();
      _permissionManager = null;
    }
  }
};