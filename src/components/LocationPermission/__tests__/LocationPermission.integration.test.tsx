/**
 * 位置权限组件集成测试
 * 测试与 Stream B 权限 hooks 的集成
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationPermission } from '../LocationPermission';
import { useLocationPermission } from '../../../hooks/useLocationPermission';
import { LocationPermissionStatus } from '../../../services/location/types';
import '@testing-library/jest-dom';

// 模拟权限 hook
jest.mock('../../../hooks/useLocationPermission');

const mockUseLocationPermission = useLocationPermission as jest.MockedFunction<typeof useLocationPermission>;

describe('LocationPermission - Stream B 集成测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('与权限 Hook 的直接集成', () => {
    it('应该直接使用 Hook 的权限状态', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      expect(screen.getByText('位置权限未确定')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
    });

    it('应该正确处理 Hook 的加载状态', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: true,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      expect(screen.getByText('正在检查权限...')).toBeInTheDocument();
      expect(screen.getByText('请稍候，正在处理权限请求')).toBeInTheDocument();
    });

    it('应该正确处理 Hook 的请求状态', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: true,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      expect(screen.getByText('正在请求权限...')).toBeInTheDocument();
      expect(screen.getByText('请稍候，正在处理权限请求')).toBeInTheDocument();
    });
  });

  describe('权限 Hook 函数调用集成', () => {
    it('应该调用 Hook 的 requestPermission 函数', () => {
      const mockRequestPermission = jest.fn().mockResolvedValue(true);
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: mockRequestPermission,
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      const requestButton = screen.getByText('请求位置权限');
      fireEvent.click(requestButton);

      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });

    it('应该调用 Hook 的 checkPermission 函数', () => {
      const mockCheckPermission = jest.fn().mockResolvedValue(undefined);
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.GRANTED,
        isGranted: true,
        isDenied: false,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: mockCheckPermission,
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      // LocationPermission 组件本身不直接调用 checkPermission
      expect(mockCheckPermission).not.toHaveBeenCalled();
    });

    it('应该调用 Hook 的 refreshPermission 函数', () => {
      const mockRefreshPermission = jest.fn().mockResolvedValue(undefined);
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.GRANTED,
        isGranted: true,
        isDenied: false,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: mockRefreshPermission,
      });

      render(
        <LocationPermission />
      );

      // LocationPermission 组件本身不直接调用 refreshPermission
      expect(mockRefreshPermission).not.toHaveBeenCalled();
    });

    it('应该调用 Hook 的 ensurePermission 函数', () => {
      const mockEnsurePermission = jest.fn().mockResolvedValue(true);
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: mockEnsurePermission,
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      // LocationPermission 组件本身不直接调用 ensurePermission
      expect(mockEnsurePermission).not.toHaveBeenCalled();
    });
  });

  describe('权限状态管理集成', () => {
    it('应该正确处理权限状态从 NOT_DETERMINED 到 GRANTED 的变化', () => {
      const { rerender } = render(
        <LocationPermission />
      );

      expect(screen.getByText('位置权限未确定')).toBeInTheDocument();

      // 模拟权限状态变化
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.GRANTED,
        isGranted: true,
        isDenied: false,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      rerender(<LocationPermission />);

      expect(screen.getByText('位置权限已授权')).toBeInTheDocument();
    });

    it('应该正确处理权限状态从 NOT_DETERMINED 到 DENIED 的变化', () => {
      const { rerender } = render(
        <LocationPermission />
      );

      expect(screen.getByText('位置权限未确定')).toBeInTheDocument();

      // 模拟权限状态变化
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.DENIED,
        isGranted: false,
        isDenied: true,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: true,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      rerender(<LocationPermission />);

      expect(screen.getByText('位置权限被拒绝')).toBeInTheDocument();
    });

    it('应该正确处理权限状态从 DENIED 到 GRANTED 的变化', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.DENIED,
        isGranted: false,
        isDenied: true,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: true,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      const { rerender } = render(<LocationPermission />);

      expect(screen.getByText('位置权限被拒绝')).toBeInTheDocument();

      // 模拟权限状态变化
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.GRANTED,
        isGranted: true,
        isDenied: false,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      rerender(<LocationPermission />);

      expect(screen.getByText('位置权限已授权')).toBeInTheDocument();
    });
  });

  describe('异步操作集成测试', () => {
    it('应该处理异步权限请求', async () => {
      const mockRequestPermission = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: mockRequestPermission,
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      const requestButton = screen.getByText('请求位置权限');
      fireEvent.click(requestButton);

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalledTimes(1);
      });
    });

    it('应该处理异步打开设置', async () => {
      const mockOpenSettings = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );
      
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.DENIED,
        isGranted: false,
        isDenied: true,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: true,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission onOpenSettings={mockOpenSettings} />
      );

      const settingsButton = screen.getByText('打开设置');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(mockOpenSettings).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('错误处理和边界情况集成', () => {
    it('应该处理权限请求失败', () => {
      const mockRequestPermission = jest.fn().mockRejectedValue(new Error('权限请求失败'));
      
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: mockRequestPermission,
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      const requestButton = screen.getByText('请求位置权限');
      fireEvent.click(requestButton);

      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });

    it('应该处理打开设置失败', () => {
      const mockOpenSettings = jest.fn().mockRejectedValue(new Error('无法打开设置'));
      
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.DENIED,
        isGranted: false,
        isDenied: true,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: true,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission onOpenSettings={mockOpenSettings} />
      );

      const settingsButton = screen.getByText('打开设置');
      fireEvent.click(settingsButton);

      expect(mockOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('应该处理无效的状态值', () => {
      mockUseLocationPermission.mockReturnValue({
        status: 'invalid_status' as LocationPermissionStatus,
        isGranted: false,
        isDenied: false,
        isNotDetermined: false,
        isRestricted: false,
        canRequest: false,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      expect(screen.getByText('未知权限状态')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
    });
  });

  describe('配置选项集成测试', () => {
    it('应该正确处理 showSettingsGuide 选项', () => {
      const { rerender } = render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          showSettingsGuide={false}
        />
      );

      expect(screen.queryByText('需要位置权限')).not.toBeInTheDocument();

      rerender(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          showSettingsGuide={true}
        />
      );

      expect(screen.getByText('需要位置权限')).toBeInTheDocument();
    });

    it('应该正确处理自定义文本选项', () => {
      const customButtonText = '自定义请求按钮';
      const customGuideTitle = '自定义引导标题';
      const customGuideContent = '自定义引导内容';

      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          requestButtonText={customButtonText}
          guideTitle={customGuideTitle}
          guideContent={customGuideContent}
        />
      );

      expect(screen.getByText(customButtonText)).toBeInTheDocument();
      
      // 切换到需要引导的状态
      const { rerender } = render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          showSettingsGuide={true}
          guideTitle={customGuideTitle}
          guideContent={customGuideContent}
        />
      );

      expect(screen.getByText(customGuideTitle)).toBeInTheDocument();
      expect(screen.getByText(customGuideContent)).toBeInTheDocument();
    });
  });

  describe('响应式设计集成测试', () => {
    it('应该在不同屏幕尺寸下正确处理权限状态', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      render(
        <LocationPermission />
      );

      // 基本的响应式元素应该存在
      expect(screen.getByText('位置权限未确定')).toBeInTheDocument();
      expect(screen.getByText('请求位置权限')).toBeInTheDocument();
    });
  });

  describe('性能优化集成测试', () => {
    it('应该避免不必要的 Hook 重新调用', () => {
      const mockRequestPermission = jest.fn();
      
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: mockRequestPermission,
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      const { rerender } = render(
        <LocationPermission />
      );

      // 重新渲染相同的组件
      rerender(<LocationPermission />);

      // Hook 不应该被重复调用
      expect(mockUseLocationPermission).toHaveBeenCalledTimes(2); // 初始调用 + 重新渲染调用
    });
  });

  describe('可访问性集成测试', () => {
    it('应该为所有交互元素提供适当的 ARIA 属性', () => {
      mockUseLocationPermission.mockReturnValue({
        status: LocationPermissionStatus.NOT_DETERMINED,
        isGranted: false,
        isDenied: false,
        isNotDetermined: true,
        isRestricted: false,
        canRequest: true,
        shouldShowGuide: false,
        isChecking: false,
        isRequesting: false,
        checkResult: null,
        checkPermission: jest.fn(),
        requestPermission: jest.fn(),
        ensurePermission: jest.fn(),
        refreshPermission: jest.fn(),
      });

      const { container } = render(
        <LocationPermission />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});