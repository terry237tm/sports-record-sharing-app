/**
 * 位置显示组件测试
 * 测试组件的渲染、交互和状态管理
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LocationDisplay } from '../LocationDisplay';
import { LocationData } from '../../../services/location/types';
import '@testing-library/jest-dom';

// 模拟位置数据
const mockLocationData: LocationData = {
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市朝阳区建国门外大街1号',
  city: '北京市',
  district: '朝阳区',
  province: '北京市',
  country: '中国',
  poi: '建国门外大街',
  accuracy: 15,
  timestamp: Date.now(),
};

const mockHighAccuracyLocation: LocationData = {
  ...mockLocationData,
  accuracy: 5,
};

const mockLowAccuracyLocation: LocationData = {
  ...mockLocationData,
  accuracy: 200,
};

describe('LocationDisplay', () => {
  describe('渲染测试', () => {
    it('应该正确渲染位置信息', () => {
      render(
        <LocationDisplay 
          location={mockLocationData}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('位置信息')).toBeInTheDocument();
      expect(screen.getByText('北京市朝阳区建国门外大街1号')).toBeInTheDocument();
      expect(screen.getByText('建国门外大街')).toBeInTheDocument();
      expect(screen.getByText('≤100米 · 中等精度定位')).toBeInTheDocument();
    });

    it('应该根据addressFormat属性格式化地址', () => {
      const { rerender } = render(
        <LocationDisplay 
          location={mockLocationData}
          addressFormat="full"
        />
      );
      
      expect(screen.getByText('北京市朝阳区建国门外大街1号')).toBeInTheDocument();

      rerender(
        <LocationDisplay 
          location={mockLocationData}
          addressFormat="short"
        />
      );
      
      expect(screen.getByText('建国门外大街')).toBeInTheDocument();

      rerender(
        <LocationDisplay 
          location={mockLocationData}
          addressFormat="city"
        />
      );
      
      expect(screen.getByText('北京市')).toBeInTheDocument();
    });

    it('应该根据精度显示不同的精度信息', () => {
      const { rerender } = render(
        <LocationDisplay location={mockHighAccuracyLocation} />
      );
      
      expect(screen.getByText('≤10米 · 高精度定位')).toBeInTheDocument();

      rerender(
        <LocationDisplay location={mockLocationData} />
      );
      
      expect(screen.getByText('≤100米 · 中等精度定位')).toBeInTheDocument();

      rerender(
        <LocationDisplay location={mockLowAccuracyLocation} />
      );
      
      expect(screen.getByText('>100米 · 低精度定位')).toBeInTheDocument();
    });

    it('应该显示坐标信息', () => {
      render(
        <LocationDisplay 
          location={mockLocationData}
          showAccuracy={true}
          showTimestamp={true}
        />
      );

      expect(screen.getByText('坐标:')).toBeInTheDocument();
      expect(screen.getByText('39.904200, 116.407400')).toBeInTheDocument();
    });

    it('应该根据showAccuracy和showTimestamp控制显示', () => {
      const { rerender } = render(
        <LocationDisplay 
          location={mockLocationData}
          showAccuracy={false}
          showTimestamp={false}
        />
      );
      
      expect(screen.queryByText('精度:')).not.toBeInTheDocument();
      expect(screen.queryByText('时间:')).not.toBeInTheDocument();

      rerender(
        <LocationDisplay 
          location={mockLocationData}
          showAccuracy={true}
          showTimestamp={true}
        />
      );
      
      expect(screen.getByText('精度:')).toBeInTheDocument();
      expect(screen.getByText('时间:')).toBeInTheDocument();
    });
  });

  describe('状态测试', () => {
    it('应该正确渲染加载状态', () => {
      render(
        <LocationDisplay 
          location={null}
          loading={true}
          error={null}
        />
      );

      expect(screen.getByText('正在获取位置信息...')).toBeInTheDocument();
      expect(screen.getByText('请稍候，正在定位中')).toBeInTheDocument();
    });

    it('应该正确渲染错误状态', () => {
      const errorMessage = '位置获取失败：用户拒绝了权限请求';
      render(
        <LocationDisplay 
          location={null}
          loading={false}
          error={errorMessage}
        />
      );

      expect(screen.getByText('位置获取失败')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('重试')).toBeInTheDocument();
    });

    it('应该正确渲染空状态', () => {
      render(
        <LocationDisplay 
          location={null}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('位置信息')).toBeInTheDocument();
      expect(screen.getByText('暂无位置信息')).toBeInTheDocument();
      expect(screen.getByText('刷新')).toBeInTheDocument();
    });

    it('应该处理无效的位置数据', () => {
      const invalidLocation = {
        ...mockLocationData,
        latitude: 91, // 无效的纬度
        longitude: 181, // 无效的经度
      };

      render(
        <LocationDisplay 
          location={invalidLocation}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('暂无位置信息')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该处理点击事件', () => {
      const onClick = jest.fn();
      render(
        <LocationDisplay 
          location={mockLocationData}
          onClick={onClick}
        />
      );

      const element = screen.getByText('位置信息').closest('.locationDisplay');
      fireEvent.click(element!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应该处理刷新按钮点击', () => {
      const onRefresh = jest.fn();
      render(
        <LocationDisplay 
          location={mockLocationData}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('应该处理错误状态下的重试按钮', () => {
      const onRefresh = jest.fn();
      render(
        <LocationDisplay 
          location={null}
          error="获取位置失败"
          onRefresh={onRefresh}
        />
      );

      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('不应该在加载状态下响应点击事件', () => {
      const onClick = jest.fn();
      render(
        <LocationDisplay 
          location={null}
          loading={true}
          onClick={onClick}
        />
      );

      const element = screen.getByText('正在获取位置信息...').closest('.locationDisplay');
      fireEvent.click(element!);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('刷新按钮应该阻止事件冒泡', () => {
      const onClick = jest.fn();
      const onRefresh = jest.fn();
      render(
        <LocationDisplay 
          location={mockLocationData}
          onClick={onClick}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('时间戳格式化测试', () => {
    it('应该正确格式化不同时间的时间戳', () => {
      const now = Date.now();
      
      // 刚刚（30秒前）
      const recentLocation = {
        ...mockLocationData,
        timestamp: now - 30000,
      };
      
      const { rerender } = render(
        <LocationDisplay location={recentLocation} />
      );
      
      expect(screen.getByText('刚刚')).toBeInTheDocument();

      // 几分钟前（5分钟前）
      const minutesAgoLocation = {
        ...mockLocationData,
        timestamp: now - 300000,
      };
      
      rerender(
        <LocationDisplay location={minutesAgoLocation} />
      );
      
      expect(screen.getByText('5分钟前')).toBeInTheDocument();

      // 几小时前（3小时前）
      const hoursAgoLocation = {
        ...mockLocationData,
        timestamp: now - 10800000,
      };
      
      rerender(
        <LocationDisplay location={hoursAgoLocation} />
      );
      
      expect(screen.getByText('3小时前')).toBeInTheDocument();

      // 几天前（2天前）
      const daysAgoLocation = {
        ...mockLocationData,
        timestamp: now - 172800000,
      };
      
      rerender(
        <LocationDisplay location={daysAgoLocation} />
      );
      
      expect(screen.getByText('2天前')).toBeInTheDocument();
    });

    it('应该处理没有时间戳的情况', () => {
      const locationWithoutTimestamp = {
        ...mockLocationData,
        timestamp: undefined,
      };

      render(
        <LocationDisplay location={locationWithoutTimestamp} />
      );

      expect(screen.getByText('未知时间')).toBeInTheDocument();
    });
  });

  describe('样式和类名测试', () => {
    it('应该应用自定义类名', () => {
      const customClass = 'custom-location-display';
      const { container } = render(
        <LocationDisplay 
          location={mockLocationData}
          className={customClass}
        />
      );

      const element = container.querySelector('.locationDisplay');
      expect(element).toHaveClass(customClass);
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = render(
        <LocationDisplay 
          location={mockLocationData}
          style={customStyle}
        />
      );

      const element = container.querySelector('.locationDisplay');
      expect(element).toHaveStyle('background-color: red');
      expect(element).toHaveStyle('padding: 20px');
    });

    it('应该根据精度显示不同的颜色类', () => {
      const { rerender, container } = render(
        <LocationDisplay location={mockHighAccuracyLocation} />
      );
      
      let iconWrapper = container.querySelector('.iconWrapper');
      expect(iconWrapper).toHaveClass('success');

      rerender(
        <LocationDisplay location={mockLocationData} />
      );
      
      iconWrapper = container.querySelector('.iconWrapper');
      expect(iconWrapper).toHaveClass('warning');

      rerender(
        <LocationDisplay location={mockLowAccuracyLocation} />
      );
      
      iconWrapper = container.querySelector('.iconWrapper');
      expect(iconWrapper).toHaveClass('error');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的位置数据', () => {
      render(
        <LocationDisplay location={null} />
      );

      expect(screen.getByText('暂无位置信息')).toBeInTheDocument();
    });

    it('应该处理部分位置数据', () => {
      const partialLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '',
        city: '',
        district: '',
        province: '',
      };

      render(
        <LocationDisplay location={partialLocation} />
      );

      expect(screen.getByText('未知位置')).toBeInTheDocument();
    });

    it('应该处理精度为0的情况', () => {
      const zeroAccuracyLocation = {
        ...mockLocationData,
        accuracy: 0,
      };

      render(
        <LocationDisplay location={zeroAccuracyLocation} />
      );

      expect(screen.getByText('≤10米 · 高精度定位')).toBeInTheDocument();
    });

    it('应该处理负精度值', () => {
      const negativeAccuracyLocation = {
        ...mockLocationData,
        accuracy: -10,
      };

      render(
        <LocationDisplay location={negativeAccuracyLocation} />
      );

      expect(screen.getByText('精度未知')).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该具有适当的ARIA属性', () => {
      const { container } = render(
        <LocationDisplay 
          location={mockLocationData}
          loading={false}
          error={null}
        />
      );

      const element = container.querySelector('.locationDisplay');
      expect(element).toBeInTheDocument();
    });

    it('应该支持键盘导航', () => {
      const onClick = jest.fn();
      const { container } = render(
        <LocationDisplay 
          location={mockLocationData}
          onClick={onClick}
        />
      );

      const element = container.querySelector('.locationDisplay');
      element?.focus();
      
      // 模拟回车键点击
      fireEvent.keyDown(element!, { key: 'Enter', code: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});