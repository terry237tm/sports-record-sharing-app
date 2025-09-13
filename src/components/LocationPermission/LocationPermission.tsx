/**
 * 位置权限组件
 * 处理位置权限请求，显示权限状态和用户引导界面
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { LocationPermissionStatus } from '../../services/location/types';
import { 
  LocationPermissionProps 
} from '../../types/location';
import { getPermissionStatusText } from '../../utils/location/permission';
import styles from './LocationPermission.module.scss';

/**
 * 位置权限组件
 * 用于显示权限状态、请求权限和提供用户引导
 */
export const LocationPermission: React.FC<LocationPermissionProps> = ({
  status = LocationPermissionStatus.NOT_DETERMINED,
  isChecking = false,
  isRequesting = false,
  className = '',
  style,
  requestButtonText = '请求位置权限',
  guideTitle = '需要位置权限',
  guideContent = '为了提供更好的服务，我们需要获取您的位置信息。请在设置中开启位置权限。',
  showSettingsGuide = true,
  onRequestPermission,
  onStatusChange,
  onOpenSettings,
}) => {
  // 获取权限状态配置
  const statusConfig = useMemo(() => {
    switch (status) {
      case LocationPermissionStatus.GRANTED:
        return {
          text: '位置权限已授权',
          icon: '✅',
          color: 'success',
          showRequestButton: false,
          showSettingsGuide: false,
        };
      case LocationPermissionStatus.DENIED:
        return {
          text: '位置权限被拒绝',
          icon: '❌',
          color: 'error',
          showRequestButton: false,
          showSettingsGuide: true,
        };
      case LocationPermissionStatus.NOT_DETERMINED:
        return {
          text: '位置权限未确定',
          icon: '❓',
          color: 'info',
          showRequestButton: true,
          showSettingsGuide: false,
        };
      case LocationPermissionStatus.RESTRICTED:
        return {
          text: '位置权限受限制',
          icon: '🔒',
          color: 'warning',
          showRequestButton: false,
          showSettingsGuide: true,
        };
      default:
        return {
          text: '未知权限状态',
          icon: '❓',
          color: 'info',
          showRequestButton: false,
          showSettingsGuide: false,
        };
    }
  }, [status]);

  // 处理权限请求
  const handleRequestPermission = useCallback(async () => {
    if (onRequestPermission) {
      await onRequestPermission();
    }
  }, [onRequestPermission]);

  // 处理打开设置
  const handleOpenSettings = useCallback(async () => {
    if (onOpenSettings) {
      await onOpenSettings();
    }
  }, [onOpenSettings]);

  // 渲染加载状态
  if (isChecking || isRequesting) {
    return (
      <View 
        className={`${styles.locationPermission} ${styles.loading} ${className}`}
        style={style}
      >
        <View className={styles.statusSection}>
          <View className={styles.statusIcon}>
            <View className={styles.loadingIcon} />
          </View>
          <Text className={styles.statusText}>
            {isChecking ? '正在检查权限...' : '正在请求权限...'}
          </Text>
        </View>
        <View className={styles.content}>
          <Text className={styles.loadingText}>请稍候，正在处理权限请求</Text>
        </View>
      </View>
    );
  }

  // 渲染已授权状态
  if (status === LocationPermissionStatus.GRANTED) {
    return (
      <View 
        className={`${styles.locationPermission} ${styles.granted} ${className}`}
        style={style}
      >
        <View className={styles.statusSection}>
          <View className={`${styles.statusIcon} ${styles[statusConfig.color]}`}>
            {statusConfig.icon}
          </View>
          <Text className={styles.statusText}>{statusConfig.text}</Text>
        </View>
        <View className={styles.content}>
          <Text className={styles.successMessage}>
            ✅ 位置权限已授权，可以正常使用位置相关功能
          </Text>
          <View className={styles.features}>
            <Text className={styles.featureItem}>• 记录运动轨迹</Text>
            <Text className={styles.featureItem}>• 显示当前位置</Text>
            <Text className={styles.featureItem}>• 位置分享功能</Text>
          </View>
        </View>      </View>
    );
  }

  // 渲染权限引导
  if (statusConfig.showSettingsGuide && showSettingsGuide) {
    return (
      <View 
        className={`${styles.locationPermission} ${styles.guide} ${className}`}
        style={style}
      >
        <View className={styles.statusSection}>
          <View className={`${styles.statusIcon} ${styles[statusConfig.color]}`}>
            {statusConfig.icon}
          </View>
          <Text className={styles.statusText}>{statusConfig.text}</Text>
        </View>
        
        <View className={styles.content}>
          <View className={styles.guideSection}>
            <Text className={styles.guideTitle}>{guideTitle}</Text>
            <Text className={styles.guideContent}>{guideContent}</Text>
          </View>
          
          <View className={styles.guideSteps}>
            <Text className={styles.stepTitle}>请按以下步骤操作：</Text>
            <View className={styles.stepItem}>
              <Text className={styles.stepNumber}>1</Text>
              <Text className={styles.stepText}>点击"打开设置"按钮</Text>
            </View>
            <View className={styles.stepItem}>
              <Text className={styles.stepNumber}>2</Text>
              <Text className={styles.stepText}>在设置页面中找到"位置"选项</Text>
            </View>
            <View className={styles.stepItem}>
              <Text className={styles.stepNumber}>3</Text>
              <Text className={styles.stepText}>开启位置权限</Text>
            </View>
            <View className={styles.stepItem}>
              <Text className={styles.stepNumber}>4</Text>
              <Text className={styles.stepText}>返回应用并刷新页面</Text>
            </View>
          </View>
          
          <View className={styles.guideActions}>
            <Button 
              className={styles.settingsButton}
              onClick={handleOpenSettings}
              type="primary"
            >
              打开设置
            </Button>
            <Button 
              className={styles.refreshButton}
              onClick={() => onStatusChange?.(status)}
            >
              刷新状态
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // 渲染权限请求界面
  return (
    <View 
      className={`${styles.locationPermission} ${styles.request} ${className}`}
      style={style}
    >
      <View className={styles.statusSection}>
        <View className={`${styles.statusIcon} ${styles[statusConfig.color]}`}>
          {statusConfig.icon}
        </View>
        <Text className={styles.statusText}>{statusConfig.text}</Text>
      </View>
      
      <View className={styles.content}>
        <View className={styles.requestSection}>
          <Text className={styles.requestTitle}>需要获取您的位置权限</Text>
          <Text className={styles.requestMessage}>
            为了提供更好的服务体验，我们需要获取您的位置信息。位置信息将用于：
          </Text>
          
          <View className={styles.benefits}>
            <Text className={styles.benefitItem}>🎯 记录运动的起点和终点位置</Text>
            <Text className={styles.benefitItem}>📍 显示当前位置信息</Text>
            <Text className={styles.benefitItem}>🗺️ 提供基于位置的服务</Text>
            <Text className={styles.benefitItem}>🔒 我们不会收集或分享您的位置数据</Text>
          </View>
          
          <Text className={styles.privacyNote}>
            💡 提示：您可以随时在系统设置中管理位置权限
          </Text>
        </View>
        
        <View className={styles.requestActions}>
          {statusConfig.showRequestButton && onRequestPermission && (
            <Button 
              className={styles.requestButton}
              onClick={handleRequestPermission}
              type="primary"
              loading={isRequesting}
            >
              {requestButtonText}
            </Button>
          )}
          
          <Button 
            className={styles.laterButton}
            onClick={() => onStatusChange?.(status)}
          >
            稍后再说
          </Button>
        </View>
      </View>
    </View>
  );
};

/**
 * 位置权限组件（默认导出）
 */
export default LocationPermission;