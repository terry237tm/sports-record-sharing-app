/**
 * 位置显示组件
 * 显示位置信息，包括地址、精度、时间戳等，支持加载状态和错误处理
 */

import React, { useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { LocationData } from '../../services/location/types';
import { 
  LocationDisplayProps 
} from '../../types/location';
import { 
  formatAddress, 
  getAccuracyConfig, 
  formatTimestamp, 
  getLocationIcon,
  isValidLocation,
  formatAccuracy 
} from '../../utils/location/format';
import styles from './LocationDisplay.module.scss';

/**
 * 位置显示组件
 * 用于显示位置信息，支持多种显示模式和交互功能
 */
export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  loading = false,
  error = null,
  className = '',
  style,
  showAccuracy = true,
  showTimestamp = true,
  addressFormat = 'short',
  onClick,
  onRefresh,
}) => {
  // 格式化地址信息
  const formattedAddress = useMemo(() => {
    return formatAddress(location, addressFormat);
  }, [location, addressFormat]);

  // 获取精度配置
  const accuracyConfig = useMemo(() => {
    return getAccuracyConfig(location?.accuracy);
  }, [location?.accuracy]);

  // 格式化时间戳
  const formattedTime = useMemo(() => {
    return formatTimestamp(location?.timestamp);
  }, [location?.timestamp]);

  // 获取状态图标
  const statusIcon = useMemo(() => {
    return getLocationIcon(location, loading, error);
  }, [location, loading, error]);

  // 验证位置数据
  const isValid = useMemo(() => {
    return isValidLocation(location);
  }, [location]);

  // 处理点击事件
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  // 处理刷新事件
  const handleRefresh = (e: any) => {
    e.stopPropagation();
    if (onRefresh && !loading) {
      onRefresh();
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <View 
        className={`${styles.locationDisplay} ${styles.loading} ${className}`}
        style={style}
      >
        <View className={styles.header}>
          <View className={styles.iconWrapper}>
            <View className={`${styles.icon} ${styles.loadingIcon}`} />
          </View>
          <Text className={styles.title}>正在获取位置信息...</Text>
        </View>
        <View className={styles.content}>
          <Text className={styles.loadingText}>请稍候，正在定位中</Text>
        </View>
      </View>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <View 
        className={`${styles.locationDisplay} ${styles.error} ${className}`}
        style={style}
      >
        <View className={styles.header}>
          <View className={styles.iconWrapper}>
            <View className={`${styles.icon} ${styles.errorIcon}`} />
          </View>
          <Text className={styles.title}>位置获取失败</Text>
          {onRefresh && (
            <Button 
              className={styles.refreshButton}
              onClick={handleRefresh}
              size="mini"
            >
              重试
            </Button>
          )}
        </View>
        <View className={styles.content}>
          <Text className={styles.errorMessage}>{error}</Text>
        </View>
      </View>
    );
  }

  // 渲染无位置数据状态
  if (!location || !isValid) {
    return (
      <View 
        className={`${styles.locationDisplay} ${styles.empty} ${className}`}
        style={style}
        onClick={handleClick}
      >
        <View className={styles.header}>
          <View className={styles.iconWrapper}>
            <View className={`${styles.icon} ${styles.emptyIcon}`} />
          </View>
          <Text className={styles.title}>位置信息</Text>
          {onRefresh && (
            <Button 
              className={styles.refreshButton}
              onClick={handleRefresh}
              size="mini"
            >
              刷新
            </Button>
          )}
        </View>
        <View className={styles.content}>
          <Text className={styles.emptyMessage}>暂无位置信息</Text>
        </View>
      </View>
    );
  }

  // 渲染正常位置信息
  return (
    <View 
      className={`${styles.locationDisplay} ${styles.normal} ${className}`}
      style={style}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <View className={`${styles.iconWrapper} ${styles[accuracyConfig.color]}`}>
          <View className={`${styles.icon} ${styles[statusIcon]}`} />
        </View>
        <Text className={styles.title}>位置信息</Text>
        {onRefresh && (
          <Button 
            className={styles.refreshButton}
            onClick={handleRefresh}
            size="mini"
          >
            刷新
          </Button>
        )}
      </View>
      
      <View className={styles.content}>
        <View className={styles.addressSection}>
          <Text className={styles.address} numberOfLines={2}>
            {formattedAddress.full}
          </Text>
          {formattedAddress.poi && (
            <Text className={styles.poi}>{formattedAddress.poi}</Text>
          )}
        </View>
        
        <View className={styles.details}>
          {showAccuracy && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>精度:</Text>
              <Text className={`${styles.detailValue} ${styles[accuracyConfig.color]}`}>
                {formatAccuracy(location.accuracy)}
              </Text>
            </View>
          )}
          
          {showTimestamp && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>时间:</Text>
              <Text className={styles.detailValue}>{formattedTime}</Text>
            </View>
          )}
          
          {location.latitude && location.longitude && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>坐标:</Text>
              <Text className={styles.detailValue}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * 位置显示组件（默认导出）
 */
export default LocationDisplay;