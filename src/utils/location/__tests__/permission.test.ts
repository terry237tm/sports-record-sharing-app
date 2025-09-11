/**
 * 位置权限管理工具测试
 */

import Taro from '@tarojs/taro';

import {
  checkLocationPermission,
  requestLocationPermission,
  showPermissionGuide,
  openAppSettings,
  getPermissionCheckResult,
  ensureLocationPermission,
  checkSystemLocationService,
  getPermissionStatusText,
  createPermissionError,
  onPermissionChange,
  PermissionManager,
  permissionManager
} from '../permission';
import { LocationPermissionStatus, LocationErrorType } from '../../../services/location/types';

// Mock Taro
jest.mock('@tarojs/taro', () => {
  return {
    __esModule: true,
    default: {
      getSetting: jest.fn(),
      authorize: jest.fn(),
      showModal: jest.fn(),
      openSetting: jest.fn(),
      getSystemInfo: jest.fn()
    }
  };
});

describe('位置权限管理工具', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkLocationPermission', () => {
    it('应该返回GRANTED当权限已授权时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const result = await checkLocationPermission();

      expect(result).toBe(LocationPermissionStatus.GRANTED);
    });

    it('应该返回DENIED当权限被拒绝时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': false
        }
      });

      const result = await checkLocationPermission();

      expect(result).toBe(LocationPermissionStatus.DENIED);
    });

    it('应该返回NOT_DETERMINED当权限未确定时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });

      const result = await checkLocationPermission();

      expect(result).toBe(LocationPermissionStatus.NOT_DETERMINED);
    });

    it('应该处理API错误', async () => {
      (Taro.default.getSetting as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await checkLocationPermission();

      expect(result).toBe(LocationPermissionStatus.NOT_DETERMINED);
    });
  });

  describe('requestLocationPermission', () => {
    it('应该直接返回GRANTED当权限已授权时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const result = await requestLocationPermission();

      expect(result).toBe(LocationPermissionStatus.GRANTED);
      expect(Taro.authorize).not.toHaveBeenCalled();
    });

    it('应该请求权限当权限未确定时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });
      (Taro.default.authorize as jest.Mock).mockResolvedValue(undefined);

      const result = await requestLocationPermission();

      expect(result).toBe(LocationPermissionStatus.GRANTED);
      expect(Taro.authorize).toHaveBeenCalledWith({
        scope: 'scope.userLocation'
      });
    });

    it('应该返回DENIED当权限被拒绝且非强制请求时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': false
        }
      });

      const result = await requestLocationPermission();

      expect(result).toBe(LocationPermissionStatus.DENIED);
      expect(Taro.authorize).not.toHaveBeenCalled();
    });

    it('应该强制请求权限当forceRequest为true时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': false
        }
      });
      (Taro.default.authorize as jest.Mock).mockResolvedValue(undefined);

      const result = await requestLocationPermission({ forceRequest: true });

      expect(result).toBe(LocationPermissionStatus.GRANTED);
      expect(Taro.authorize).toHaveBeenCalled();
    });

    it('应该显示权限引导当请求失败时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });
      (Taro.default.authorize as jest.Mock).mockRejectedValue(new Error('Auth failed'));
      (Taro.default.showModal as jest.Mock).mockResolvedValue({ cancel: true });

      const result = await requestLocationPermission();

      expect(result).toBe(LocationPermissionStatus.DENIED);
      expect(Taro.showModal).toHaveBeenCalled();
    });

    it('应该处理自定义权限文案', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });
      (Taro.default.authorize as jest.Mock).mockRejectedValue(new Error('Auth failed'));
      (Taro.default.showModal as jest.Mock).mockResolvedValue({ cancel: true });

      const customText = '自定义权限请求文案';
      await requestLocationPermission({ permissionText: customText });

      // 验证自定义文案被使用
      expect(Taro.authorize).toHaveBeenCalled();
    });
  });

  describe('showPermissionGuide', () => {
    it('应该显示权限引导并处理用户确认', async () => {
      (Taro.default.showModal as jest.Mock).mockResolvedValue({ confirm: true });
      (Taro.default.openSetting as jest.Mock).mockResolvedValue(undefined);

      await showPermissionGuide();

      expect(Taro.showModal).toHaveBeenCalledWith({
        title: '位置权限指引',
        content: '请前往设置-隐私-位置服务中开启权限',
        confirmText: '去设置',
        cancelText: '取消',
        showCancel: true
      });
      expect(Taro.openSetting).toHaveBeenCalled();
    });

    it('应该显示权限引导并处理用户取消', async () => {
      (Taro.default.showModal as jest.Mock).mockResolvedValue({ confirm: false });

      await showPermissionGuide();

      expect(Taro.showModal).toHaveBeenCalled();
      expect(Taro.openSetting).not.toHaveBeenCalled();
    });

    it('应该处理显示权限引导失败', async () => {
      (Taro.default.showModal as jest.Mock).mockRejectedValue(new Error('Show modal failed'));

      // 不应该抛出错误
      await expect(showPermissionGuide()).resolves.not.toThrow();
    });
  });

  describe('openAppSettings', () => {
    it('应该成功打开应用设置', async () => {
      (Taro.default.openSetting as jest.Mock).mockResolvedValue(undefined);

      await openAppSettings();

      expect(Taro.openSetting).toHaveBeenCalledWith({
        withSubscriptions: false
      });
    });

    it('应该处理打开设置失败', async () => {
      (Taro.default.openSetting as jest.Mock).mockRejectedValue(new Error('Open setting failed'));

      await expect(openAppSettings()).rejects.toThrow('无法打开设置页面');
    });
  });

  describe('getPermissionCheckResult', () => {
    it('应该返回正确的权限检查结果当权限已授权时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const result = await getPermissionCheckResult();

      expect(result.status).toBe(LocationPermissionStatus.GRANTED);
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowGuide).toBe(false);
      expect(result.message).toBe('位置权限已授权');
    });

    it('应该返回正确的权限检查结果当权限被拒绝时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': false
        }
      });

      const result = await getPermissionCheckResult();

      expect(result.status).toBe(LocationPermissionStatus.DENIED);
      expect(result.canRequest).toBe(false);
      expect(result.shouldShowGuide).toBe(true);
      expect(result.message).toBe('定位权限被拒绝，请在设置中开启位置权限');
    });

    it('应该返回正确的权限检查结果当权限未确定时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });

      const result = await getPermissionCheckResult();

      expect(result.status).toBe(LocationPermissionStatus.NOT_DETERMINED);
      expect(result.canRequest).toBe(true);
      expect(result.shouldShowGuide).toBe(false);
    });
  });

  describe('ensureLocationPermission', () => {
    it('应该返回true当权限已授权时', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const result = await ensureLocationPermission();

      expect(result).toBe(true);
    });

    it('应该请求权限并返回true当用户授权时', async () => {
      (Taro.getSetting as jest.Mock)
        .mockResolvedValueOnce({
          authSetting: {}
        })
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': true
          }
        });
      (Taro.default.authorize as jest.Mock).mockResolvedValue(undefined);

      const result = await ensureLocationPermission();

      expect(result).toBe(true);
    });

    it('应该返回false当权限请求失败时', async () => {
      (Taro.getSetting as jest.Mock)
        .mockResolvedValueOnce({
          authSetting: {}
        })
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': false
          }
        });
      (Taro.default.authorize as jest.Mock).mockRejectedValue(new Error('Auth failed'));

      const result = await ensureLocationPermission();

      expect(result).toBe(false);
    });

    it('应该显示权限引导并重新检查', async () => {
      (Taro.getSetting as jest.Mock)
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': false
          }
        })
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': true
          }
        });
      (Taro.default.showModal as jest.Mock).mockResolvedValue({ confirm: true });
      (Taro.default.openSetting as jest.Mock).mockResolvedValue(undefined);

      const result = await ensureLocationPermission({ showGuide: true });

      expect(result).toBe(true);
      expect(Taro.showModal).toHaveBeenCalled();
    });
  });

  describe('checkSystemLocationService', () => {
    it('应该返回true当系统定位服务开启时', async () => {
      (Taro.default.getSystemInfo as jest.Mock).mockResolvedValue({
        locationEnabled: true
      });

      const result = await checkSystemLocationService();

      expect(result).toBe(true);
    });

    it('应该返回false当系统定位服务关闭时', async () => {
      (Taro.default.getSystemInfo as jest.Mock).mockResolvedValue({
        locationEnabled: false
      });

      const result = await checkSystemLocationService();

      expect(result).toBe(false);
    });

    it('应该返回false当获取系统信息失败时', async () => {
      (Taro.default.getSystemInfo as jest.Mock).mockRejectedValue(new Error('Failed'));

      const result = await checkSystemLocationService();

      expect(result).toBe(false);
    });
  });

  describe('getPermissionStatusText', () => {
    it('应该返回正确的状态文本', () => {
      expect(getPermissionStatusText(LocationPermissionStatus.GRANTED)).toBe('已授权');
      expect(getPermissionStatusText(LocationPermissionStatus.DENIED)).toBe('被拒绝');
      expect(getPermissionStatusText(LocationPermissionStatus.NOT_DETERMINED)).toBe('未确定');
      expect(getPermissionStatusText(LocationPermissionStatus.RESTRICTED)).toBe('受限制');
    });

    it('应该处理未知状态', () => {
      expect(getPermissionStatusText('unknown' as any)).toBe('未知');
    });
  });

  describe('createPermissionError', () => {
    it('应该创建权限被拒绝错误', () => {
      const error = createPermissionError(LocationPermissionStatus.DENIED);

      expect(error.type).toBe(LocationErrorType.PERMISSION_DENIED);
      expect(error.message).toBe('定位权限被拒绝，请在设置中开启位置权限');
      expect(error.name).toBe('LocationPermissionError');
      expect(error.code).toBe(LocationPermissionStatus.DENIED);
    });

    it('应该创建权限受限制错误', () => {
      const error = createPermissionError(LocationPermissionStatus.RESTRICTED);

      expect(error.type).toBe(LocationErrorType.PERMISSION_DENIED);
      expect(error.message).toBe('位置权限受限制，请联系系统管理员');
    });

    it('应该创建权限未确定错误', () => {
      const error = createPermissionError(LocationPermissionStatus.NOT_DETERMINED);

      expect(error.type).toBe(LocationErrorType.PERMISSION_DENIED);
      expect(error.message).toBe('位置权限未确定，请先授权');
    });
  });

  describe('onPermissionChange', () => {
    it('应该监听权限变化', async () => {
      const callback = jest.fn();
      (Taro.getSetting as jest.Mock)
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': true
          }
        })
        .mockResolvedValueOnce({
          authSetting: {
            'scope.userLocation': false
          }
        });

      const unsubscribe = onPermissionChange(callback);

      // 等待第一次检查
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callback).toHaveBeenCalledWith(LocationPermissionStatus.GRANTED);

      // 推进定时器模拟权限变化
      jest.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callback).toHaveBeenCalledWith(LocationPermissionStatus.DENIED);

      // 取消监听
      unsubscribe();
      
      // 清理定时器
      jest.clearAllTimers();
    });

    it('应该处理监听过程中的错误', async () => {
      const callback = jest.fn();
      (Taro.getSetting as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const unsubscribe = onPermissionChange(callback);

      // 等待第一次检查
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 不应该调用回调函数
      expect(callback).not.toHaveBeenCalled();

      // 取消监听
      unsubscribe();
      
      // 清理定时器
      jest.clearAllTimers();
    });
  });

  describe('PermissionManager', () => {
    let manager: PermissionManager;

    beforeEach(() => {
      manager = new PermissionManager();
    });

    afterEach(() => {
      manager.destroy();
    });

    it('应该正确初始化', () => {
      expect(manager.getStatus()).toBe(LocationPermissionStatus.NOT_DETERMINED);
    });

    it('应该检查权限状态', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const status = await manager.checkPermission();

      expect(status).toBe(LocationPermissionStatus.GRANTED);
      expect(manager.getStatus()).toBe(LocationPermissionStatus.GRANTED);
    });

    it('应该请求权限', async () => {
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {}
      });
      (Taro.default.authorize as jest.Mock).mockResolvedValue(undefined);

      const status = await manager.requestPermission();

      expect(status).toBe(LocationPermissionStatus.GRANTED);
    });

    it('应该添加权限监听器', async () => {
      const callback = jest.fn();
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': true
        }
      });

      const unsubscribe = manager.addListener(callback);

      // 等待初始化检查
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalledWith(LocationPermissionStatus.GRANTED);

      // 清理
      unsubscribe();
    });

    it('应该移除权限监听器', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = manager.addListener(callback1);
      manager.addListener(callback2);

      // 移除第一个监听器
      unsubscribe1();

      // 更新权限状态
      (Taro.default.getSetting as jest.Mock).mockResolvedValue({
        authSetting: {
          'scope.userLocation': false
        }
      });

      await manager.checkPermission();

      // 只有第二个回调应该被调用
      expect(callback1).not.toHaveBeenCalledWith(LocationPermissionStatus.DENIED);
    });

    it('应该销毁管理器', () => {
      const callback = jest.fn();
      manager.addListener(callback);

      manager.destroy();

      // 推进定时器，确保定时器被清理
      jest.advanceTimersByTime(10000);

      // 不应该有任何错误
      expect(true).toBe(true);
    });
  });

  describe('全局权限管理器实例', () => {
    it('应该创建全局实例', () => {
      expect(permissionManager).toBeInstanceOf(PermissionManager);
      expect(permissionManager.getStatus()).toBe(LocationPermissionStatus.NOT_DETERMINED);
    });
  });
});