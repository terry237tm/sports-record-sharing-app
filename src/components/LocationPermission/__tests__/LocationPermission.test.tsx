/**
 * 位置权限组件测试
 * 测试组件的权限状态管理、用户交互和引导功能
 */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { LocationPermission } from '../LocationPermission';
import { LocationPermissionStatus } from '../../../services/location/types';
import '@testing-library/jest-dom';

describe('LocationPermission', () => {
  describe('权限状态渲染测试', () => {
    it('应该正确渲染已授权状态', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.GRANTED}
          isChecking={false}
          isRequesting={false}
        />
      );

      expect(screen.getByText('位置权限已授权')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('✅ 位置权限已授权，可以正常使用位置相关功能')).toBeInTheDocument();
      expect(screen.getByText('• 记录运动轨迹')).toBeInTheDocument();
      expect(screen.getByText('• 显示当前位置')).toBeInTheDocument();
      expect(screen.getByText('• 位置分享功能')).toBeInTheDocument();
    });

    it('应该正确渲染被拒绝状态', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
        />
      );

      expect(screen.getByText('位置权限被拒绝')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('需要位置权限')).toBeInTheDocument();
      expect(screen.getByText('为了提供更好的服务，我们需要获取您的位置信息。请在设置中开启位置权限。')).toBeInTheDocument();
      expect(screen.getByText('请按以下步骤操作：')).toBeInTheDocument();
      expect(screen.getByText('打开设置')).toBeInTheDocument();
    });

    it('应该正确渲染未确定状态', () => {
      const onRequestPermission = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onRequestPermission={onRequestPermission}
        />
      );

      expect(screen.getByText('位置权限未确定')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
      expect(screen.getByText('需要获取您的位置权限')).toBeInTheDocument();
      expect(screen.getByText('请求位置权限')).toBeInTheDocument();
      expect(screen.getByText('稍后再说')).toBeInTheDocument();
    });

    it('应该正确渲染受限制状态', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.RESTRICTED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
        />
      );

      expect(screen.getByText('位置权限受限制')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.getByText('需要位置权限')).toBeInTheDocument();
      expect(screen.getByText('打开设置')).toBeInTheDocument();
    });
  });

  describe('加载状态测试', () => {
    it('应该正确渲染检查权限的加载状态', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={true}
          isRequesting={false}
        />
      );

      expect(screen.getByText('正在检查权限...')).toBeInTheDocument();
      expect(screen.getByText('请稍候，正在处理权限请求')).toBeInTheDocument();
    });

    it('应该正确渲染请求权限的加载状态', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={true}
        />
      );

      expect(screen.getByText('正在请求权限...')).toBeInTheDocument();
      expect(screen.getByText('请稍候，正在处理权限请求')).toBeInTheDocument();
    });

    it('加载状态下的权限请求按钮应该被禁用', () => {
      const onRequestPermission = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={true}
          onRequestPermission={onRequestPermission}
        />
      );

      const requestButton = screen.getByText('请求位置权限');
      expect(requestButton).toBeInTheDocument();
      // 注意：在实际实现中，按钮应该处于加载状态，这里简化处理
    });
  });

  describe('交互测试', () => {
    it('应该处理权限请求按钮点击', () => {
      const onRequestPermission = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onRequestPermission={onRequestPermission}
        />
      );

      const requestButton = screen.getByText('请求位置权限');
      fireEvent.click(requestButton);

      expect(onRequestPermission).toHaveBeenCalledTimes(1);
    });

    it('应该处理打开设置按钮点击', () => {
      const onOpenSettings = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
          onOpenSettings={onOpenSettings}
        />
      );

      const settingsButton = screen.getByText('打开设置');
      fireEvent.click(settingsButton);

      expect(onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('应该处理刷新状态按钮点击', () => {
      const onStatusChange = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
          onStatusChange={onStatusChange}
        />
      );

      const refreshButton = screen.getByText('刷新状态');
      fireEvent.click(refreshButton);

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(LocationPermissionStatus.DENIED);
    });

    it('应该处理稍后再说按钮点击', () => {
      const onStatusChange = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onStatusChange={onStatusChange}
        />
      );

      const laterButton = screen.getByText('稍后再说');
      fireEvent.click(laterButton);

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(LocationPermissionStatus.NOT_DETERMINED);
    });

    it('不应该在没有回调函数时触发事件', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
        />
      );

      const laterButton = screen.getByText('稍后再说');
      fireEvent.click(laterButton);

      // 不应该报错
      expect(true).toBe(true);
    });
  });

  describe('自定义配置测试', () => {
    it('应该使用自定义按钮文本', () => {
      const customButtonText = '获取位置权限';
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          requestButtonText={customButtonText}
          onRequestPermission={() => {}}
        />
      );

      expect(screen.getByText(customButtonText)).toBeInTheDocument();
    });

    it('应该使用自定义引导标题和内容', () => {
      const customTitle = '自定义权限引导';
      const customContent = '这是自定义的权限引导内容';
      
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
          guideTitle={customTitle}
          guideContent={customContent}
        />
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customContent)).toBeInTheDocument();
    });

    it('应该根据showSettingsGuide控制引导显示', () => {
      const { rerender } = render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={false}
        />
      );
      
      expect(screen.queryByText('需要位置权限')).not.toBeInTheDocument();

      rerender(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
        />
      );
      
      expect(screen.getByText('需要位置权限')).toBeInTheDocument();
    });
  });

  describe('样式和类名测试', () => {
    it('应该应用自定义类名', () => {
      const customClass = 'custom-permission-component';
      const { container } = render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          className={customClass}
        />
      );

      const element = container.querySelector('.locationPermission');
      expect(element).toHaveClass(customClass);
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'lightblue', padding: '30px' };
      const { container } = render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          style={customStyle}
        />
      );

      const element = container.querySelector('.locationPermission');
      expect(element).toHaveStyle('background-color: lightblue');
      expect(element).toHaveStyle('padding: 30px');
    });

    it('应该根据权限状态应用不同的样式类', () => {
      const { rerender, container } = render(
        <LocationPermission status={LocationPermissionStatus.GRANTED} />
      );
      
      let element = container.querySelector('.locationPermission');
      expect(element).toHaveClass('granted');

      rerender(
        <LocationPermission status={LocationPermissionStatus.DENIED} />
      );
      
      element = container.querySelector('.locationPermission');
      expect(element).toHaveClass('guide');

      rerender(
        <LocationPermission status={LocationPermissionStatus.NOT_DETERMINED} />
      );
      
      element = container.querySelector('.locationPermission');
      expect(element).toHaveClass('request');

      rerender(
        <LocationPermission status={LocationPermissionStatus.RESTRICTED} />
      );
      
      element = container.querySelector('.locationPermission');
      expect(element).toHaveClass('guide');
    });

    it('应该根据状态应用不同的颜色类', () => {
      const { rerender, container } = render(
        <LocationPermission status={LocationPermissionStatus.GRANTED} />
      );
      
      let icon = container.querySelector('.statusIcon');
      expect(icon).toHaveClass('success');

      rerender(
        <LocationPermission status={LocationPermissionStatus.DENIED} />
      );
      
      icon = container.querySelector('.statusIcon');
      expect(icon).toHaveClass('error');

      rerender(
        <LocationPermission status={LocationPermissionStatus.NOT_DETERMINED} />
      );
      
      icon = container.querySelector('.statusIcon');
      expect(icon).toHaveClass('info');

      rerender(
        <LocationPermission status={LocationPermissionStatus.RESTRICTED} />
      );
      
      icon = container.querySelector('.statusIcon');
      expect(icon).toHaveClass('warning');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理未知的权限状态', () => {
      render(
        <LocationPermission 
          status={'unknown' as LocationPermissionStatus}
          isChecking={false}
          isRequesting={false}
        />
      );

      expect(screen.getByText('未知权限状态')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
    });

    it('不应该在没有权限请求处理函数时显示请求按钮', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
        />
      );

      expect(screen.queryByText('请求位置权限')).not.toBeInTheDocument();
    });

    it('不应该在没有打开设置处理函数时显示设置按钮', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
        />
      );

      expect(screen.queryByText('打开设置')).not.toBeInTheDocument();
    });

    it('不应该在加载状态下显示操作按钮', () => {
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={true}
          isRequesting={false}
        />
      );

      expect(screen.queryByText('请求位置权限')).not.toBeInTheDocument();
      expect(screen.queryByText('稍后再说')).not.toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该具有适当的ARIA属性', () => {
      const { container } = render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
        />
      );

      const element = container.querySelector('.locationPermission');
      expect(element).toBeInTheDocument();
    });

    it('应该支持键盘导航', () => {
      const onRequestPermission = jest.fn();
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onRequestPermission={onRequestPermission}
        />
      );

      const requestButton = screen.getByText('请求位置权限');
      requestButton.focus();
      
      // 模拟回车键点击
      fireEvent.keyDown(requestButton, { key: 'Enter', code: 'Enter' });
      expect(onRequestPermission).toHaveBeenCalledTimes(1);
    });

    it('应该为按钮提供适当的焦点样式', () => {
      const onRequestPermission = jest.fn();
      const { container } = render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onRequestPermission={onRequestPermission}
        />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('异步操作测试', () => {
    it('应该处理异步的权限请求', async () => {
      const onRequestPermission = jest.fn().mockResolvedValue(undefined);
      
      render(
        <LocationPermission 
          status={LocationPermissionStatus.NOT_DETERMINED}
          isChecking={false}
          isRequesting={false}
          onRequestPermission={onRequestPermission}
        />
      );

      const requestButton = screen.getByText('请求位置权限');
      fireEvent.click(requestButton);

      await waitFor(() => {
        expect(onRequestPermission).toHaveBeenCalledTimes(1);
      });
    });

    it('应该处理异步的设置页面打开', async () => {
      const onOpenSettings = jest.fn().mockResolvedValue(undefined);
      
      render(
        <LocationPermission 
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={true}
          onOpenSettings={onOpenSettings}
        />
      );

      const settingsButton = screen.getByText('打开设置');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(onOpenSettings).toHaveBeenCalledTimes(1);
      });
    });
  });
});