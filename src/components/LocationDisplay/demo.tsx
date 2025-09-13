/**
 * 位置显示组件演示
 * 展示 LocationDisplay 组件的不同状态和使用方式
 */

import React, { useState } from 'react';
import { View, Button } from '@tarojs/components';
import { LocationDisplay } from './LocationDisplay';
import { LocationData } from '../../services/location/types';

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

/**
 * 位置显示组件演示
 */
export const LocationDisplayDemo: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(mockLocationData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟获取位置
  const handleGetLocation = () => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      setCurrentLocation(mockLocationData);
    }, 2000);
  };

  // 模拟获取位置失败
  const handleGetLocationError = () => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      setError('位置获取失败：用户拒绝了权限请求');
    }, 2000);
  };

  // 模拟刷新位置
  const handleRefreshLocation = () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // 随机返回不同的精度
      const locations = [mockHighAccuracyLocation, mockLocationData, mockLowAccuracyLocation];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setCurrentLocation({
        ...randomLocation,
        timestamp: Date.now(),
      });
    }, 1500);
  };

  // 清除位置
  const handleClearLocation = () => {
    setCurrentLocation(null);
    setError(null);
  };

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '20px' }}>
        <Button onClick={handleGetLocation}>获取位置</Button>
        <Button onClick={handleGetLocationError} style={{ marginLeft: '10px' }}>
          模拟错误
        </Button>
        <Button onClick={handleClearLocation} style={{ marginLeft: '10px' }}>
          清除位置
        </Button>
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>完整位置信息显示</h3>
        <LocationDisplay
          location={currentLocation}
          loading={loading}
          error={error}
          onRefresh={handleRefreshLocation}
          showAccuracy={true}
          showTimestamp={true}
          addressFormat="full"
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>简洁模式</h3>
        <LocationDisplay
          location={currentLocation}
          loading={false}
          error={null}
          showAccuracy={false}
          showTimestamp={false}
          addressFormat="short"
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>仅显示城市</h3>
        <LocationDisplay
          location={currentLocation}
          loading={false}
          error={null}
          showAccuracy={true}
          showTimestamp={false}
          addressFormat="city"
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>自定义样式</h3>
        <LocationDisplay
          location={currentLocation}
          loading={false}
          error={null}
          className="custom-location-display"
          style={{ backgroundColor: '#f0f8ff', borderColor: '#1890ff' }}
          onClick={() => console.log('位置显示被点击')}
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>高精度位置</h3>
        <LocationDisplay
          location={mockHighAccuracyLocation}
          loading={false}
          error={null}
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>低精度位置</h3>
        <LocationDisplay
          location={mockLowAccuracyLocation}
          loading={false}
          error={null}
        />
      </View>
    </View>
  );
};

export default LocationDisplayDemo;