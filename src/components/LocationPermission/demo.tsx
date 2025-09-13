/**
 * 位置权限组件演示
 * 展示 LocationPermission 组件的不同状态和使用方式
 */

import React, { useState } from 'react';
import { View, Button } from '@tarojs/components';
import { LocationPermission } from './LocationPermission';
import { LocationPermissionStatus } from '../../services/location/types';

/**
 * 位置权限组件演示
 */
export const LocationPermissionDemo: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<LocationPermissionStatus>(
    LocationPermissionStatus.NOT_DETERMINED
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // 模拟权限检查
  const handleCheckPermission = () => {
    setIsChecking(true);
    
    setTimeout(() => {
      setIsChecking(false);
      // 随机返回不同的权限状态
      const statuses = [
        LocationPermissionStatus.GRANTED,
        LocationPermissionStatus.DENIED,
        LocationPermissionStatus.NOT_DETERMINED,
        LocationPermissionStatus.RESTRICTED,
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setCurrentStatus(randomStatus);
    }, 1500);
  };

  // 模拟权限请求
  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      // 模拟权限请求过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 随机返回成功或失败
      const success = Math.random() > 0.3;
      
      if (success) {
        setCurrentStatus(LocationPermissionStatus.GRANTED);
        console.log('权限请求成功');
      } else {
        setCurrentStatus(LocationPermissionStatus.DENIED);
        console.log('权限请求被拒绝');
      }
    } catch (error) {
      console.error('权限请求失败:', error);
      setCurrentStatus(LocationPermissionStatus.DENIED);
    } finally {
      setIsRequesting(false);
    }
  };

  // 模拟打开设置
  const handleOpenSettings = async () => {
    console.log('打开系统设置页面');
    
    try {
      // 模拟用户设置权限
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStatus(LocationPermissionStatus.GRANTED);
      console.log('用户在设置中授权了位置权限');
    } catch (error) {
      console.error('打开设置失败:', error);
    }
  };

  // 设置不同的权限状态
  const setPermissionStatus = (status: LocationPermissionStatus) => {
    setCurrentStatus(status);
  };

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '20px' }}>
        <Button onClick={handleCheckPermission}>检查权限</Button>
        <Button onClick={handleRequestPermission} style={{ marginLeft: '10px' }}>
          请求权限
        </Button>
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h4>设置权限状态：</h4>
        <Button onClick={() => setPermissionStatus(LocationPermissionStatus.NOT_DETERMINED)}>
          未确定
        </Button>
        <Button 
          onClick={() => setPermissionStatus(LocationPermissionStatus.GRANTED)}
          style={{ marginLeft: '10px' }}
        >
          已授权
        </Button>
        <Button 
          onClick={() => setPermissionStatus(LocationPermissionStatus.DENIED)}
          style={{ marginLeft: '10px' }}
        >
          被拒绝
        </Button>
        <Button 
          onClick={() => setPermissionStatus(LocationPermissionStatus.RESTRICTED)}
          style={{ marginLeft: '10px' }}
        >
          受限制
        </Button>
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>当前权限状态：</h3>
        <LocationPermission
          status={currentStatus}
          isChecking={isChecking}
          isRequesting={isRequesting}
          onRequestPermission={handleRequestPermission}
          onOpenSettings={handleOpenSettings}
          onStatusChange={(status) => {
            console.log('权限状态变化:', status);
            setCurrentStatus(status);
          }}
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>自定义文本</h3>
        <LocationPermission
          status={currentStatus}
          isChecking={isChecking}
          isRequesting={isRequesting}
          requestButtonText="获取我的位置"
          guideTitle="需要您的位置信息"
          guideContent="为了提供个性化的运动记录服务，我们需要获取您的位置权限。这将帮助我们记录您的运动轨迹和位置信息。"
          onRequestPermission={handleRequestPermission}
          onOpenSettings={handleOpenSettings}
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>不显示设置引导</h3>
        <LocationPermission
          status={LocationPermissionStatus.DENIED}
          isChecking={false}
          isRequesting={false}
          showSettingsGuide={false}
          onRequestPermission={handleRequestPermission}
        />
      </View>

      <View style={{ marginBottom: '20px' }}>
        <h3>自定义样式</h3>
        <LocationPermission
          status={currentStatus}
          isChecking={isChecking}
          isRequesting={isRequesting}
          className="custom-permission-component"
          style={{ 
            backgroundColor: '#f6ffed', 
            borderColor: '#52c41a',
            borderWidth: '2px'
          }}
          onRequestPermission={handleRequestPermission}
          onOpenSettings={handleOpenSettings}
        />
      </View>
    </View>
  );
};

export default LocationPermissionDemo;