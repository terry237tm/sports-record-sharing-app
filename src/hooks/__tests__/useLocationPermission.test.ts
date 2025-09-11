/**
 * 位置权限管理React Hook测试
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocationPermission, useSimpleLocationPermission, useLocationPermissionListener } from '../useLocationPermission';
import * as permissionModule from '../../utils/location/permission';
import { LocationPermissionStatus } from '../../services/location/types';

// Mock permission module
jest.mock('../../utils/location/permission', () => ({
  getPermissionCheckResult: jest.fn(),
  requestLocationPermission: jest.fn(),
  ensureLocationPermission: jest.fn(),
  permissionManager: {
    instance: {
      addListener: jest.fn(),
      getStatus: jest.fn()
    }
  }
}));

describe('useLocationPermission Hook', () => {
  const mockGetPermissionCheckResult = permissionModule.getPermissionCheckResult as jest.Mock;
  const mockRequestLocationPermission = permissionModule.requestLocationPermission as jest.Mock;
  const mockEnsureLocationPermission = permissionModule.ensureLocationPermission as jest.Mock;
  const mockAddListener = permissionModule.permissionManager.instance.addListener as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本功能', () => {
    it('应该初始化正确的默认状态', () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        canRequest: true,
        shouldShowGuide: false,
        message: '位置权限未确定'
      });

      const { result } = renderHook(() => useLocationPermission());

      expect(result.current.status).toBe(LocationPermissionStatus.NOT_DETERMINED);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isNotDetermined).toBe(true);
      expect(result.current.isRestricted).toBe(false);
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isRequesting).toBe(false);
      expect(result.current.canRequest).toBe(false); // 初始为false，需要等待异步检查
      expect(result.current.shouldShowGuide).toBe(false);
      expect(result.current.checkResult).toBe(null);
    });

    it('应该自动检查权限当autoCheck为true时', async () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.GRANTED,
        canRequest: false,
        shouldShowGuide: false,
        message: '位置权限已授权'
      });

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: true })
      );

      await waitFor(() => {
        expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      });

      expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      expect(result.current.isGranted).toBe(true);
      expect(result.current.canRequest).toBe(false);
      expect(result.current.checkResult).not.toBe(null);
    });

    it('不应该自动检查权限当autoCheck为false时', () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        canRequest: true,
        shouldShowGuide: false
      });

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      expect(result.current.status).toBe(LocationPermissionStatus.NOT_DETERMINED);
      expect(mockGetPermissionCheckResult).not.toHaveBeenCalled();
    });
  });

  describe('权限检查', () => {
    it('应该正确执行checkPermission函数', async () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.DENIED,
        canRequest: false,
        shouldShowGuide: true,
        message: '权限被拒绝'
      });

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      await act(async () => {
        await result.current.checkPermission();
      });

      expect(result.current.status).toBe(LocationPermissionStatus.DENIED);
      expect(result.current.isDenied).toBe(true);
      expect(result.current.shouldShowGuide).toBe(true);
      expect(mockGetPermissionCheckResult).toHaveBeenCalled();
    });

    it('应该处理权限检查错误', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Permission check failed');
      mockGetPermissionCheckResult.mockRejectedValue(mockError);

      const onError = jest.fn();
      const { result } = renderHook(() =
        useLocationPermission({ autoCheck: false, onError })
      );

      await act(async () => {
        await result.current.checkPermission();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('检查权限失败:', mockError);
      expect(onError).toHaveBeenCalledWith(mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('权限请求', () => {
    it('应该成功请求权限', async () => {
      mockRequestLocationPermission.mockResolvedValue(LocationPermissionStatus.GRANTED);

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(true);
      expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      expect(result.current.isGranted).toBe(true);
      expect(mockRequestLocationPermission).toHaveBeenCalled();
    });

    it('应该处理权限请求失败', async () => {
      mockRequestLocationPermission.mockResolvedValue(LocationPermissionStatus.DENIED);

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(false);
      expect(result.current.status).toBe(LocationPermissionStatus.DENIED);
      expect(result.current.isDenied).toBe(true);
    });

    it('应该处理权限请求错误', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Permission request failed');
      mockRequestLocationPermission.mockRejectedValue(mockError);

      const onError = jest.fn();
      const { result } = renderHook(() =
        useLocationPermission({ autoCheck: false, onError })
      );

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('请求权限失败:', mockError);
      expect(onError).toHaveBeenCalledWith(mockError);

      consoleErrorSpy.mockRestore();
    });

    it('应该合并请求选项', async () => {
      mockRequestLocationPermission.mockResolvedValue(LocationPermissionStatus.GRANTED);

      const { result } = renderHook(() =>
        useLocationPermission({ 
          autoCheck: false,
          showGuide: false,
          forceRequest: true
        })
      );

      await act(async () => {
        await result.current.requestPermission({ showGuide: true });
      });

      expect(mockRequestLocationPermission).toHaveBeenCalledWith({
        showGuide: true,
        forceRequest: true
      });
    });
  });

  describe('确保权限', () => {
    it('应该成功确保权限', async () => {
      mockEnsureLocationPermission.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      let ensureResult: boolean;
      await act(async () => {
        ensureResult = await result.current.ensurePermission();
      });

      expect(ensureResult!).toBe(true);
      expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      expect(result.current.isGranted).toBe(true);
    });

    it('应该处理确保权限失败', async () => {
      mockEnsureLocationPermission.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      let ensureResult: boolean;
      await act(async () => {
        ensureResult = await result.current.ensurePermission();
      });

      expect(ensureResult!).toBe(false);
      expect(result.current.status).toBe(LocationPermissionStatus.DENIED);
    });

    it('应该刷新权限状态', async () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.GRANTED,
        canRequest: false,
        shouldShowGuide: false
      });

      const { result } = renderHook(() =>
        useLocationPermission({ autoCheck: false })
      );

      await act(async () => {
        await result.current.refreshPermission();
      });

      expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      expect(mockGetPermissionCheckResult).toHaveBeenCalledTimes(2); // 初始化 + 刷新
    });
  });

  describe('权限变化监听', () => {
    it('应该监听权限变化当listenChanges为true时', () => {
      const mockUnsubscribe = jest.fn();
      mockAddListener.mockReturnValue(mockUnsubscribe);

      const onStatusChange = jest.fn();
      const { result } = renderHook(() =
        useLocationPermission({ 
          autoCheck: false, 
          listenChanges: true,
          onStatusChange 
        })
      );

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));

      // 模拟权限变化
      const listenerCallback = mockAddListener.mock.calls[0][0];
      act(() => {
        listenerCallback(LocationPermissionStatus.GRANTED);
      });

      expect(result.current.status).toBe(LocationPermissionStatus.GRANTED);
      expect(onStatusChange).toHaveBeenCalledWith(LocationPermissionStatus.GRANTED);
    });

    it('不应该监听权限变化当listenChanges为false时', () => {
      const { unmount } = renderHook(() =
        useLocationPermission({ 
          autoCheck: false, 
          listenChanges: false 
        })
      );

      expect(mockAddListener).not.toHaveBeenCalled();

      unmount();
    });

    it('应该正确清理监听器', () => {
      const mockUnsubscribe = jest.fn();
      mockAddListener.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() =>
        useLocationPermission({ 
          autoCheck: false, 
          listenChanges: true 
        })
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('useSimpleLocationPermission Hook', () => {
    it('应该返回简化的权限状态', () => {
      mockGetPermissionCheckResult.mockResolvedValue({
        status: LocationPermissionStatus.GRANTED,
        canRequest: false,
        shouldShowGuide: false
      });

      const { result } = renderHook(() =>
        useSimpleLocationPermission()
      );

      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('isGranted');
      expect(result.current).toHaveProperty('isChecking');
      expect(result.current).toHaveProperty('isRequesting');
      expect(result.current).toHaveProperty('checkPermission');
      expect(result.current).toHaveProperty('requestPermission');
      expect(result.current).toHaveProperty('ensurePermission');
      
      // 不应该有复杂的状态
      expect(result.current).not.toHaveProperty('canRequest');
      expect(result.current).not.toHaveProperty('shouldShowGuide');
      expect(result.current).not.toHaveProperty('checkResult');
    });
  });

  describe('useLocationPermissionListener Hook', () => {
    it('应该添加权限监听器', () => {
      const mockUnsubscribe = jest.fn();
      mockAddListener.mockReturnValue(mockUnsubscribe);

      const callback = jest.fn();
      const { unmount } = renderHook(() =>
        useLocationPermissionListener(callback)
      );

      expect(mockAddListener).toHaveBeenCalledWith(callback);

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('应该处理依赖数组', () => {
      const mockUnsubscribe = jest.fn();
      mockAddListener.mockReturnValue(mockUnsubscribe);

      const callback = jest.fn();
      const deps = [1, 2, 3];
      
      const { rerender, unmount } = renderHook(
        ({ deps }) => useLocationPermissionListener(callback, deps),
        { initialProps: { deps } }
      );

      expect(mockAddListener).toHaveBeenCalledTimes(1);

      // 改变依赖
      rerender({ deps: [4, 5, 6] });

      // 应该重新添加监听器
      expect(mockAddListener).toHaveBeenCalledTimes(2);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe('错误处理', () => {
    it('应该处理回调函数中的错误', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockGetPermissionCheckResult.mockImplementation(() => {
        throw new Error('Callback error');
      });

      const onError = jest.fn().mockImplementation(() => {
        throw new Error('onError callback error');
      });

      const { result } = renderHook(() =>
        useLocationPermission({ 
          autoCheck: false, 
          onError 
        })
      );

      await act(async () => {
        await result.current.checkPermission();
      });

      // 不应该导致Hook崩溃
      expect(result.current.status).toBe(LocationPermissionStatus.NOT_DETERMINED);
      
      consoleErrorSpy.mockRestore();
    });
  });
});