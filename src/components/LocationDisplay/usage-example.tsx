/**
 * 位置显示组件使用示例
 * 展示如何与 Stream B 权限 hooks 集成使用
 */

import React, { useState, useEffect } from 'react';
import { View, Button } from '@tarojs/components';
import { LocationDisplay } from './LocationDisplay';
import { LocationPermission } from '../LocationPermission';
import { useLocationPermission } from '../../hooks/useLocationPermission';
import { getCurrentLocation } from '../../utils/location/location';
import { LocationData } from '../../services/location/types';

/**
 * 位置功能完整示例
 * 展示如何结合权限管理和位置显示
 */
export const LocationExample: React.FC = () => {
  // 使用 Stream B 的权限 hook
  const {
    status,
    isGranted,
    isChecking,
    isRequesting,
    requestPermission,
    refreshPermission,
  } = useLocationPermission({
    autoCheck: true,
    listenChanges: true,
  });

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 获取当前位置
  const fetchCurrentLocation = async () => {
    if (!isGranted) {
      setLocationError('请先授权位置权限');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation({
        type: 'wgs84',
        highAccuracy: true,
      });
      setCurrentLocation(location);
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : '获取位置失败'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // 处理权限请求
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // 权限获取成功后自动获取位置
      await fetchCurrentLocation();
    }
  };

  // 处理打开设置
  const handleOpenSettings = async () => {
    try {
      // 打开系统设置页面
      await wx.openSetting();
      // 刷新权限状态
      await refreshPermission();
    } catch (error) {
      console.error('打开设置失败:', error);
    }
  };

  // 监听权限状态变化
  useEffect(() => {
    if (isGranted && !currentLocation) {
      // 权限变为已授权时自动获取位置
      fetchCurrentLocation();
    }
  }, [isGranted, currentLocation]);

  return (
    <View style={{ padding: '20px' }}>
      <h2>位置功能演示</h2>

      {/* 权限管理组件 */}
      <View style={{ marginBottom: '30px' }}>
        <h3>位置权限管理</h3>
        <LocationPermission
          status={status}
          isChecking={isChecking}
          isRequesting={isRequesting}
          onRequestPermission={handleRequestPermission}
          onOpenSettings={handleOpenSettings}
          onStatusChange={(newStatus) => {
            console.log('权限状态变化:', newStatus);
          }}
        />
      </View>

      {/* 位置信息显示 */}
      <View style={{ marginBottom: '30px' }}>
        <h3>当前位置信息</h3>
        <LocationDisplay
          location={currentLocation}
          loading={locationLoading}
          error={locationError}
          onRefresh={fetchCurrentLocation}
          showAccuracy={true}
          showTimestamp={true}
          addressFormat="full"
          onClick={() => {
            console.log('位置信息被点击');
          }}
        />
      </View>

      {/* 操作按钮 */}
      <View style={{ marginBottom: '30px' }}>
        <Button
          onClick={fetchCurrentLocation}
          disabled={!isGranted || locationLoading}
          style={{ marginRight: '10px' }}
        >
          {locationLoading ? '获取位置中...' : '刷新位置'}
        </Button>
        <Button
          onClick={() => setCurrentLocation(null)}
          style={{ marginRight: '10px' }}
        >
          清除位置
        </Button>
        <Button onClick={refreshPermission}>刷新权限</Button>
      </View>

      {/* 状态信息 */}
      <View style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>当前状态：</h4>
        <View>权限状态: {status}</View>
        <View>是否已授权: {isGranted ? '是' : '否'}</View>
        <View>是否检查中: {isChecking ? '是' : '否'}</View>
        <View>是否请求中: {isRequesting ? '是' : '否'}</View>
        <View>位置加载中: {locationLoading ? '是' : '否'}</View>
        <View>位置错误: {locationError || '无'}</View>
      </View>

      {/* 不同地址格式的对比 */}
      {currentLocation && (
        <View style={{ marginBottom: '30px' }}>
          <h3>不同地址格式对比</h3>
          
          <View style={{ marginBottom: '15px' }}>
            <h4>完整地址：</h4>
            <LocationDisplay
              location={currentLocation}
              loading={false}
              error={null}
              addressFormat="full"
            />
          </View>
          
          <View style={{ marginBottom: '15px' }}>
            <h4>简短地址：</h4>
            <LocationDisplay
              location={currentLocation}
              loading={false}
              error={null}
              addressFormat="short"
            />
          </View>
          
          <View>
            <h4>仅城市：</h4>
            <LocationDisplay
              location={currentLocation}
              loading={false}
              error={null}
              addressFormat="city"
            />
          </View>
        </View>
      )}

      {/* 使用说明 */}
      <View style={{ 
        backgroundColor: '#e6f7ff', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #91d5ff'
      }}>
        <h4>使用说明：</h4>
        <View style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <View>• 首先检查位置权限状态</View>
          <View>• 如果权限未确定，点击"请求权限"按钮</View>
          <View>• 如果权限被拒绝，可以按照引导打开设置页面</View>
          <View>• 权限授权后，位置信息会自动获取并显示</View>
          <View>• 可以随时点击"刷新位置"获取最新位置</View>
          <View>• 组件支持多种地址格式和自定义样式</View>
        </View>
      </View>
    </View>
  );
};

export default LocationExample;

/**
 * 使用说明：
 * 
 * 1. 基本使用：
 *    ```tsx
 *    // 使用权限 hook 管理权限状态
 *    const { status, isGranted, requestPermission } = useLocationPermission();
 *    
 *    // 显示权限管理界面
 *    <LocationPermission
 *      status={status}
 *      onRequestPermission={requestPermission}
 *    />
 *    
 *    // 显示位置信息
 *    <LocationDisplay
 *      location={currentLocation}
 *      loading={loading}
 *      error={error}
 *    />
 *    ```
 * 
 * 2. 高级配置：
 *    ```tsx
 *    <LocationDisplay
 *      location={location}
 *      showAccuracy={true}      // 显示精度信息
 *      showTimestamp={true}     // 显示时间戳
 *      addressFormat="full"     // 地址格式：full|short|city
 *      onRefresh={handleRefresh} // 刷新按钮回调
 *      onClick={handleClick}    // 点击事件回调
 *      className="custom-class" // 自定义样式类
 *      style={{...}}           // 自定义样式
 *    />
 *    ```
 * 
 * 3. 权限组件配置：
 *    ```tsx
 *    <LocationPermission
 *      status={status}
 *      isChecking={isChecking}
 *      isRequesting={isRequesting}
 *      requestButtonText="获取位置权限"
 *      guideTitle="需要位置权限"
 *      guideContent="为了提供更好的服务..."
 *      showSettingsGuide={true}
 *      onRequestPermission={handleRequest}
 *      onOpenSettings={handleOpenSettings}
 *      onStatusChange={handleStatusChange}
 *    />
 *    ```
 */