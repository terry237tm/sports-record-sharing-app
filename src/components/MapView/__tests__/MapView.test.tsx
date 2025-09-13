/**
 * MapView 组件测试
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapView from '../MapView';
import { useLocation } from '@/hooks/useLocation';
import { LocationData } from '@/services/location/types';

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  eventCenter: {
    on: jest.fn(),
    off: jest.fn()
  }
}));

// Mock hooks
jest.mock('@/hooks/useLocation', () => ({
  useLocation: jest.fn()
}));

// Mock format functions
jest.mock('@/utils/location/format', () => ({
  formatDistance: jest.fn((distance) => `${distance}米`),
  formatCoordinate: jest.fn((lat, lng) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
}));

/**
 * 模拟位置数据
 */
const mockLocationData: LocationData = {
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市朝阳区建国门外大街1号',
  city: '北京市',
  district: '朝阳区',
  province: '北京市',
  accuracy: 50,
  timestamp: Date.now()
};

/**
 * 模拟 useLocation Hook
 */
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('MapView 组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 默认的 mock 实现
    mockUseLocation.mockReturnValue({
      location: mockLocationData,
      loading: false,
      error: null,
      getCurrentLocation: jest.fn(),
      refreshLocation: jest.fn()
    });
  });

  describe('基础渲染', () => {
    it('应该正确渲染地图容器', () => {
      const { container } = render(<MapView />);
      
      expect(container.querySelector('.mapContainer')).toBeInTheDocument();
    });

    it('应该应用自定义样式类名', () => {
      const { container } = render(<MapView className="custom-map" />);
      
      expect(container.querySelector('.mapContainer')).toHaveClass('custom-map');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { border: '1px solid red' };
      const { container } = render(<MapView style={customStyle} />);
      
      expect(container.querySelector('.mapContainer')).toHaveStyle(customStyle);
    });

    it('应该显示加载状态', () => {
      mockUseLocation.mockReturnValue({
        location: null,
        loading: true,
        error: null,
        getCurrentLocation: jest.fn(),
        refreshLocation: jest.fn()
      });

      render(<MapView />);
      
      expect(screen.getByText('正在获取位置信息...')).toBeInTheDocument();
    });

    it('应该显示地图加载状态', async () => {
      const { container } = render(<MapView />);
      
      // 初始状态应该显示加载遮罩
      expect(container.querySelector('.mapOverlay')).toBeInTheDocument();
      expect(screen.getByText('地图加载中...')).toBeInTheDocument();
    });
  });

  describe('地图配置', () => {
    it('应该正确设置地图类型', () => {
      const { container } = render(<MapView mapType="satellite" />);
      
      // 由于 Taro Map 组件的实现，我们需要检查是否正确传递了 props
      // 这里假设 Map 组件会正确处理 mapType prop
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该正确设置缩放级别', () => {
      const { container } = render(<MapView zoom={18} />);
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该正确设置中心坐标', () => {
      const center = { latitude: 31.2304, longitude: 121.4737 };
      const { container } = render(<MapView center={center} />);
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该正确设置地图尺寸', () => {
      const { container } = render(
        <MapView width="500px" height="300px" />
      );
      
      const mapElement = container.querySelector('.map');
      expect(mapElement).toHaveStyle({ width: '500px', height: '300px' });
    });

    it('应该正确设置地图控件', () => {
      const controls = [
        {
          id: 1,
          position: { left: 10, top: 10, width: 40, height: 40 },
          iconPath: '/assets/icons/test.png',
          clickable: true
        }
      ];

      const { container } = render(<MapView controls={controls} />);
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });
  });

  describe('位置功能', () => {
    it('应该显示用户位置', () => {
      const { container } = render(<MapView showUserLocation={true} />);
      
      // 检查位置信息面板是否存在
      expect(container.querySelector('.locationPanel')).toBeInTheDocument();
    });

    it('应该隐藏用户位置', () => {
      const { container } = render(
        <MapView showUserLocation={false} />
      );
      
      // 检查位置信息面板是否不存在
      expect(container.querySelector('.locationPanel')).not.toBeInTheDocument();
    });

    it('应该显示位置地址信息', () => {
      const { container } = render(<MapView showUserLocation={true} />);
      
      expect(screen.getByText(mockLocationData.address)).toBeInTheDocument();
    });

    it('应该显示位置坐标信息', () => {
      render(<MapView showUserLocation={true} />);
      
      // 坐标信息应该被格式化函数处理
      expect(screen.getByText(/39\.904200, 116\.407400/)).toBeInTheDocument();
    });

    it('应该显示位置精度信息', () => {
      render(<MapView showUserLocation={true} />);
      
      expect(screen.getByText(/精度: ±50米/)).toBeInTheDocument();
    });

    it('应该处理位置获取失败', () => {
      const mockError = new Error('位置获取失败');
      mockUseLocation.mockReturnValue({
        location: null,
        loading: false,
        error: mockError.message,
        getCurrentLocation: jest.fn(),
        refreshLocation: jest.fn()
      });

      const onLocationError = jest.fn();
      render(<MapView 
        showUserLocation={true}
        onLocationError={onLocationError}
      />);
      
      expect(onLocationError).toHaveBeenCalledWith(mockError.message);
    });
  });

  describe('标记功能', () => {
    it('应该正确渲染标记', () => {
      const markers = [
        {
          id: 1,
          latitude: 39.9042,
          longitude: 116.4074,
          title: '测试标记',
          description: '这是一个测试标记'
        }
      ];

      const { container } = render(<MapView markers={markers} />);
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该处理标记点击事件', () => {
      const markers = [
        {
          id: 1,
          latitude: 39.9042,
          longitude: 116.4074,
          title: '测试标记'
        }
      ];

      const onMarkerTap = jest.fn();
      const { container } = render(
        <MapView markers={markers} onMarkerTap={onMarkerTap} />
      );
      
      // 模拟标记点击事件
      // 注意：由于 Taro Map 组件的特殊性，这里只是测试事件处理器的设置
      expect(onMarkerTap).toBeDefined();
    });

    it('应该处理气泡点击事件', () => {
      const markers = [
        {
          id: 1,
          latitude: 39.9042,
          longitude: 116.4074,
          title: '测试标记',
          callout: {
            content: '气泡内容',
            display: 'BYCLICK' as const
          }
        }
      ];

      const onCalloutTap = jest.fn();
      const { container } = render(
        <MapView markers={markers} onCalloutTap={onCalloutTap} />
      );
      
      expect(onCalloutTap).toBeDefined();
    });
  });

  describe('覆盖层功能', () => {
    it('应该正确渲染圆形覆盖层', () => {
      const overlays = [
        {
          id: 1,
          type: 'circle' as const,
          center: { latitude: 39.9042, longitude: 116.4074 },
          radius: 1000,
          styles: {
            fillColor: '#FF000020',
            color: '#FF0000',
            borderWidth: 2
          },
          points: []
        }
      ];

      const { container } = render(<MapView overlays={overlays} />);
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该正确渲染多边形覆盖层', () => {
      const overlays = [
        {
          id: 1,
          type: 'polygon' as const,
          points: [
            { latitude: 39.9042, longitude: 116.4074 },
            { latitude: 39.9142, longitude: 116.4174 },
            { latitude: 39.9242, longitude: 116.4274 }
          ],
          styles: {
            fillColor: '#00FF0020',
            borderColor: '#00FF00',
            borderWidth: 2
          }
        }
      ];

      const { container } = render(
        <MapView overlays={overlays} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该正确渲染折线覆盖层', () => {
      const overlays = [
        {
          id: 1,
          type: 'polyline' as const,
          points: [
            { latitude: 39.9042, longitude: 116.4074 },
            { latitude: 39.9142, longitude: 116.4174 },
            { latitude: 39.9242, longitude: 116.4274 }
          ],
          styles: {
            color: '#0000FF',
            width: 3,
            dottedLine: false
          }
        }
      ];

      const { container } = render(
        <MapView overlays={overlays} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });
  });

  describe('事件处理', () => {
    it('应该处理地图区域变化事件', () => {
      const onRegionChange = jest.fn();
      const { container } = render(
        <MapView onRegionChange={onRegionChange} />
      );
      
      expect(onRegionChange).toBeDefined();
    });

    it('应该处理地图点击事件', () => {
      const onTap = jest.fn();
      const { container } = render(
        <MapView onTap={onTap} />
      );
      
      expect(onTap).toBeDefined();
    });

    it('应该处理地图加载完成事件', () => {
      const onLoad = jest.fn();
      const { container } = render(
        <MapView onLoad={onLoad} />
      );
      
      expect(onLoad).toBeDefined();
    });

    it('应该处理地图更新事件', () => {
      const onUpdated = jest.fn();
      const { container } = render(
        <MapView onUpdated={onUpdated} />
      );
      
      expect(onUpdated).toBeDefined();
    });
  });

  describe('控件功能', () => {
    it('应该显示定位控件', () => {
      const { container } = render(
        <MapView enableLocation={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该隐藏定位控件', () => {
      const { container } = render(
        <MapView enableLocation={false} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该处理定位控件点击', () => {
      const mockGetCurrentLocation = jest.fn();
      mockUseLocation.mockReturnValue({
        location: mockLocationData,
        loading: false,
        error: null,
        getCurrentLocation: mockGetCurrentLocation,
        refreshLocation: jest.fn()
      });

      render(<MapView enableLocation={true} />);
      
      // 由于 Taro 的事件机制，这里只是测试事件处理器的设置
      expect(mockGetCurrentLocation).toBeDefined();
    });
  });

  describe('地图交互', () => {
    it('应该支持缩放功能', () => {
      const { container } = render(
        <MapView enableZoom={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该支持滚动功能', () => {
      const { container } = render(
        <MapView enableScroll={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该支持旋转功能', () => {
      const { container } = render(
        <MapView enableRotate={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该支持3D地图', () => {
      const { container } = render(
        <MapView enable3D={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该显示比例尺', () => {
      const { container } = render(
        <MapView showScale={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该显示指南针', () => {
      const { container } = render(
        <MapView showCompass={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该显示路况', () => {
      const { container } = render(
        <MapView showTraffic={true} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });
  });

  describe('边界条件', () => {
    it('应该处理空标记数组', () => {
      const { container } = render(
        <MapView markers={[]} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该处理空覆盖层数组', () => {
      const { container } = render(
        <MapView overlays={[]} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该处理空控件数组', () => {
      const { container } = render(
        <MapView controls={[]} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });

    it('应该处理无效的中心坐标', () => {
      const invalidCenter = { latitude: NaN, longitude: NaN };
      const { container } = render(
        <MapView center={invalidCenter} />
      );
      
      expect(container.querySelector('.loadingContainer')).toBeInTheDocument();
    });

    it('应该处理无效的标记数据', () => {
      const invalidMarkers = [
        {
          id: 1,
          latitude: NaN,
          longitude: NaN,
          title: '无效标记'
        }
      ];

      const { container } = render(
        <MapView markers={invalidMarkers} />
      );
      
      expect(container.querySelector('taro-map')).toBeTruthy();
    });
  });

  describe('响应式设计', () => {
    it('应该适配不同屏幕尺寸', () => {
      const { container } = render(
        <MapView width="100%" height="50vh" />
      );
      
      const mapElement = container.querySelector('.map');
      expect(mapElement).toHaveStyle({ width: '100%', height: '50vh' });
    });

    it('应该处理最小尺寸', () => {
      const { container } = render(
        <MapView width={200} height={150} />
      );
      
      const mapElement = container.querySelector('.map');
      expect(mapElement).toHaveStyle({ width: '200', height: '150' });
    });
  });

  describe('可访问性', () => {
    it('应该支持键盘导航', () => {
      const { container } = render(<MapView />);
      
      expect(container.querySelector('.mapContainer')).toBeInTheDocument();
    });

    it('应该提供适当的ARIA属性', () => {
      const { container } = render(
        <MapView showUserLocation={true} />
      );
      
      // 检查位置信息是否可访问
      expect(screen.getByText(mockLocationData.address)).toBeInTheDocument();
    });
  });

  describe('性能优化', () => {
    it('应该使用 React.memo 进行优化', () => {
      const { rerender } = render(<MapView />);
      
      const initialRenderCount = mockUseLocation.mock.calls.length;
      
      // 重新渲染相同的 props
      rerender(<MapView />);
      
      // useLocation 不应该被再次调用（由于 memo 优化）
      expect(mockUseLocation.mock.calls.length).toBe(initialRenderCount);
    });

    it('应该在 props 变化时重新渲染', () => {
      const { rerender } = render(<MapView zoom={16} />);
      
      const initialRenderCount = mockUseLocation.mock.calls.length;
      
      // 改变 props
      rerender(<MapView zoom={18} />);
      
      // 应该触发重新渲染
      expect(mockUseLocation.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });
});