/**
 * MapView 组件演示
 * 展示地图组件的各种功能和用法
 */

import React, { useState } from 'react';
import { View, Button, Text } from '@tarojs/components';
import { MapView, MapMarker, MapOverlay } from './index';
import { LocationData } from '@/services/location/types';
import { useLocationEcosystem } from '@/hooks/useLocationEcosystem';
import styles from './demo.module.scss';

/**
 * 模拟位置数据
 */
const mockLocations: LocationData[] = [
  {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市朝阳区建国门外大街1号',
    city: '北京市',
    district: '朝阳区',
    province: '北京市',
    accuracy: 50,
    timestamp: Date.now()
  },
  {
    latitude: 39.9142,
    longitude: 116.4174,
    address: '北京市朝阳区国贸中心',
    city: '北京市',
    district: '朝阳区',
    province: '北京市',
    accuracy: 30,
    timestamp: Date.now()
  },
  {
    latitude: 39.9242,
    longitude: 116.4274,
    address: '北京市朝阳区中央电视台',
    city: '北京市',
    district: '朝阳区',
    province: '北京市',
    accuracy: 20,
    timestamp: Date.now()
  }
];

/**
 * 模拟标记点
 */
const mockMarkers: MapMarker[] = [
  {
    id: 1,
    latitude: 39.9042,
    longitude: 116.4074,
    title: '起点',
    description: '运动开始位置',
    iconPath: '/assets/icons/start-point.png',
    width: 32,
    height: 32,
    clickable: true,
    callout: {
      content: '运动起点\n从这里开始记录',
      display: 'BYCLICK',
      bgColor: '#4CAF50',
      color: '#FFFFFF',
      fontSize: 14,
      borderRadius: 8,
      padding: 10
    }
  },
  {
    id: 2,
    latitude: 39.9142,
    longitude: 116.4174,
    title: '中途点',
    description: '运动中途位置',
    iconPath: '/assets/icons/mid-point.png',
    width: 32,
    height: 32,
    clickable: true,
    callout: {
      content: '中途点\n距离起点约1.5公里',
      display: 'BYCLICK',
      bgColor: '#2196F3',
      color: '#FFFFFF',
      fontSize: 14,
      borderRadius: 8,
      padding: 10
    }
  },
  {
    id: 3,
    latitude: 39.9242,
    longitude: 116.4274,
    title: '终点',
    description: '运动结束位置',
    iconPath: '/assets/icons/end-point.png',
    width: 32,
    height: 32,
    clickable: true,
    callout: {
      content: '运动终点\n总距离约3公里',
      display: 'BYCLICK',
      bgColor: '#F44336',
      color: '#FFFFFF',
      fontSize: 14,
      borderRadius: 8,
      padding: 10
    }
  }
];

/**
 * 模拟覆盖层
 */
const mockOverlays: MapOverlay[] = [
  {
    id: 1,
    type: 'circle',
    center: { latitude: 39.9042, longitude: 116.4074 },
    radius: 500,
    styles: {
      fillColor: '#4CAF5030',
      color: '#4CAF50',
      borderWidth: 2
    },
    points: []
  },
  {
    id: 2,
    type: 'polyline',
    points: [
      { latitude: 39.9042, longitude: 116.4074 },
      { latitude: 39.9142, longitude: 116.4174 },
      { latitude: 39.9242, longitude: 116.4274 }
    ],
    styles: {
      color: '#2196F3',
      width: 4,
      dottedLine: false
    }
  }
];

/**
 * MapView 演示组件
 */
export const MapViewDemo: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'traffic'>('standard');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // 使用位置生态系统
  const {
    location,
    loading,
    error,
    getCurrentLocation,
    searchNearbyLocations,
    ecosystemStatus,
    performanceMetrics,
    cacheHitRate,
    currentStrategy
  } = useLocationEcosystem({
    autoFetch: true,
    strategy: 'smart',
    enableCache: true,
    enablePrivacy: true,
    enableMonitoring: true
  });

  /**
   * 处理标记点击
   */
  const handleMarkerTap = (marker: MapMarker) => {
    setSelectedMarker(marker);
    console.log('标记点击:', marker);
  };

  /**
   * 处理气泡点击
   */
  const handleCalloutTap = (marker: MapMarker) => {
    console.log('气泡点击:', marker);
  };

  /**
   * 处理地图点击
   */
  const handleMapTap = (event: any) => {
    console.log('地图点击:', event);
  };

  /**
   * 处理地图区域变化
   */
  const handleRegionChange = (region: any) => {
    console.log('地图区域变化:', region);
  };

  /**
   * 处理获取当前位置
   */
  const handleGetCurrentLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setCurrentLocation(loc);
      }
    } catch (err) {
      console.error('获取位置失败:', err);
    }
  };

  /**
   * 处理搜索附近位置
   */
  const handleSearchNearby = async () => {
    if (currentLocation) {
      try {
        const nearby = await searchNearbyLocations(currentLocation, 1000);
        console.log('附近位置:', nearby);
      } catch (err) {
        console.error('搜索附近位置失败:', err);
      }
    }
  };

  /**
   * 处理切换地图类型
   */
  const handleMapTypeChange = (type: 'standard' | 'satellite' | 'traffic') => {
    setMapType(type);
  };

  /**
   * 处理切换控件显示
   */
  const handleToggleControls = () => {
    setShowControls(!showControls);
  };

  /**
   * 处理切换覆盖层显示
   */
  const handleToggleOverlays = () => {
    setShowOverlays(!showOverlays);
  };

  return (
    <View className={styles.demoContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>MapView 组件演示</Text>
        <Text className={styles.subtitle}>展示完整的地图功能和位置服务集成</Text>
      </View>

      {/* 控制面板 */}
      <View className={styles.controlPanel}>
        <View className={styles.controlGroup}>
          <Text className={styles.controlLabel}>地图类型:</Text>
          <View className={styles.buttonGroup}>
            <Button
              className={`${styles.mapTypeButton} ${mapType === 'standard' ? styles.active : ''}`}
              onClick={() => handleMapTypeChange('standard')}
            >
              标准
            </Button>
            <Button
              className={`${styles.mapTypeButton} ${mapType === 'satellite' ? styles.active : ''}`}
              onClick={() => handleMapTypeChange('satellite')}
            >
              卫星
            </Button>
            <Button
              className={`${styles.mapTypeButton} ${mapType === 'traffic' ? styles.active : ''}`}
              onClick={() => handleMapTypeChange('traffic')}
            >
              路况
            </Button>
          </View>
        </View>

        <View className={styles.controlGroup}>
          <Button
            className={`${styles.toggleButton} ${showControls ? styles.active : ''}`}
            onClick={handleToggleControls}
          >
            {showControls ? '隐藏' : '显示'}控件
          </Button>
          <Button
            className={`${styles.toggleButton} ${showOverlays ? styles.active : ''}`}
            onClick={handleToggleOverlays}
          >
            {showOverlays ? '隐藏' : '显示'}覆盖层
          </Button>
          <Button
            className={styles.actionButton}
            onClick={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? '获取中...' : '获取当前位置'}
          </Button>
          <Button
            className={styles.actionButton}
            onClick={handleSearchNearby}
            disabled={!currentLocation}
          >
            搜索附近
          </Button>
        </View>
      </View>

      {/* 状态信息 */}
      {ecosystemStatus && (
        <View className={styles.statusPanel}>
          <View className={styles.statusRow}>
            <Text className={styles.statusLabel}>当前策略:</Text>
            <Text className={styles.statusValue}>{currentStrategy}</Text>
          </View>
          <View className={styles.statusRow}>
            <Text className={styles.statusLabel}>缓存命中率:</Text>
            <Text className={styles.statusValue}>{(cacheHitRate * 100).toFixed(1)}%</Text>
          </View>
          <View className={styles.statusRow}>
            <Text className={styles.statusLabel}>总请求数:</Text>
            <Text className={styles.statusValue}>{ecosystemStatus.monitoring.totalRequests}</Text>
          </View>
          <View className={styles.statusRow}>
            <Text className={styles.statusLabel}>成功率:</Text>
            <Text className={styles.statusValue}>{(ecosystemStatus.monitoring.successRate * 100).toFixed(1)}%</Text>
          </View>
        </View>
      )}

      {/* 错误信息 */}
      {error && (
        <View className={styles.errorPanel}>
          <Text className={styles.errorText}>错误: {error}</Text>
        </View>
      )}

      {/* 当前位置信息 */}
      {currentLocation && (
        <View className={styles.locationInfo}>
          <Text className={styles.locationTitle}>当前位置:</Text>
          <Text className={styles.locationAddress}>{currentLocation.address}</Text>
          <Text className={styles.locationCoords}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          {currentLocation.accuracy && (
            <Text className={styles.locationAccuracy}>精度: ±{currentLocation.accuracy}米</Text>
          )}
        </View>
      )}

      {/* 地图组件 */}
      <View className={styles.mapContainer}>
        <MapView
          className={styles.mapView}
          mapType={mapType}
          showUserLocation={true}
          markers={mockMarkers}
          overlays={showOverlays ? mockOverlays : []}
          center={currentLocation ? 
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude } :
            { latitude: 39.9042, longitude: 116.4074 }
          }
          zoom={16}
          width="100%"
          height="400px"
          enableZoom={showControls}
          enableScroll={showControls}
          enableRotate={showControls}
          enableLocation={showControls}
          showScale={showControls}
          showCompass={showControls}
          showTraffic={mapType === 'traffic'}
          enable3D={false}
          enablePoi={true}
          enableRoad={true}
          onMarkerTap={handleMarkerTap}
          onCalloutTap={handleCalloutTap}
          onTap={handleMapTap}
          onRegionChange={handleRegionChange}
          onLocationSuccess={setCurrentLocation}
          onLocationError={(error) => console.error('定位失败:', error)}
        />
      </View>

      {/* 标记信息 */}
      {selectedMarker && (
        <View className={styles.markerInfo}>
          <Text className={styles.markerTitle}>{selectedMarker.title}</Text>
          <Text className={styles.markerDescription}>{selectedMarker.description}</Text>
        </View>
      )}

      {/* 性能指标 */}
      {performanceMetrics && (
        <View className={styles.performancePanel}>
          <Text className={styles.performanceTitle}>性能指标</Text>
          <View className={styles.performanceGrid}>
            <View className={styles.performanceItem}>
              <Text className={styles.performanceLabel}>平均响应时间</Text>
              <Text className={styles.performanceValue}>
                {performanceMetrics.performance.averageResponseTime.toFixed(0)}ms
              </Text>
            </View>
            <View className={styles.performanceItem}>
              <Text className={styles.performanceLabel}>成功率</Text>
              <Text className={styles.performanceValue}>
                {(performanceMetrics.performance.successRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View className={styles.performanceItem}>
              <Text className={styles.performanceLabel}>缓存命中</Text>
              <Text className={styles.performanceValue}>
                {performanceMetrics.cache.hitCount}
              </Text>
            </View>
            <View className={styles.performanceItem}>
              <Text className={styles.performanceLabel}>缓存未命中</Text>
              <Text className={styles.performanceValue}>
                {performanceMetrics.cache.missCount}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 功能说明 */}
      <View className={styles.featuresPanel}>
        <Text className={styles.featuresTitle}>功能特性</Text>
        <View className={styles.featuresList}>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>🗺️</Text>
            <Text className={styles.featureText}>多种地图类型切换</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>📍</Text>
            <Text className={styles.featureText}>智能位置获取和缓存</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>🎯</Text>
            <Text className={styles.featureText}>自定义标记和覆盖层</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>🔒</Text>
            <Text className={styles.featureText}>隐私保护和数据安全</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>📊</Text>
            <Text className={styles.featureText}>实时性能监控</Text>
          </View>
          <View className={styles.featureItem}>
            <Text className={styles.featureIcon}>⚡</Text>
            <Text className={styles.featureText}>自适应策略优化</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MapViewDemo;