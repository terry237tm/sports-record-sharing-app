/**
 * 位置服务配置文件
 * 包含腾讯地图API配置、环境变量处理等
 */

import { LocationServiceOptions } from '../services/location/types';

/**
 * 位置服务配置
 */
export interface LocationConfig {
  // 腾讯地图API密钥
  tencentMapKey: string;
  
  // 服务选项
  serviceOptions: LocationServiceOptions;
  
  // 环境配置
  environment: {
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
  };
}

/**
 * 获取环境变量配置
 */
const getEnvConfig = () => {
  // 检查环境变量
  const tencentMapKey = process.env.TENCENT_MAP_KEY || '';
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // 验证必要配置
  if (!tencentMapKey) {
    if (nodeEnv === 'production') {
      throw new Error('生产环境必须配置 TENCENT_MAP_KEY 环境变量');
    } else {
      console.warn('警告: 未配置 TENCENT_MAP_KEY 环境变量，将使用模拟数据');
    }
  }
  
  return {
    tencentMapKey,
    environment: {
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isTest: nodeEnv === 'test'
    }
  };
};

/**
 * 获取默认服务选项
 */
const getDefaultServiceOptions = (): LocationServiceOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    // 缓存超时时间（5分钟）
    cacheTimeout: 5 * 60 * 1000,
    
    // 定位超时时间（10秒）
    timeout: 10000,
    
    // 是否使用高精度定位
    highAccuracy: true,
    
    // 腾讯地图API密钥（将在服务初始化时设置）
    tencentMapKey: process.env.TENCENT_MAP_KEY || ''
  };
};

/**
 * 创建位置服务配置
 */
export const createLocationConfig = (): LocationConfig => {
  const envConfig = getEnvConfig();
  const serviceOptions = getDefaultServiceOptions();
  
  return {
    ...envConfig,
    serviceOptions
  };
};

/**
 * 验证配置
 */
export const validateLocationConfig = (config: LocationConfig): boolean => {
  // 验证腾讯地图API密钥
  if (config.environment.isProduction && !config.tencentMapKey) {
    throw new Error('生产环境必须提供腾讯地图API密钥');
  }
  
  // 验证缓存超时时间
  if (config.serviceOptions.cacheTimeout < 0) {
    throw new Error('缓存超时时间不能小于0');
  }
  
  // 验证定位超时时间
  if (config.serviceOptions.timeout < 1000) {
    throw new Error('定位超时时间不能小于1秒');
  }
  
  return true;
};

/**
 * 获取不同环境的配置
 */
export const getLocationConfigByEnvironment = (): LocationConfig => {
  const baseConfig = createLocationConfig();
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return {
        ...baseConfig,
        serviceOptions: {
          ...baseConfig.serviceOptions,
          cacheTimeout: 10 * 60 * 1000, // 10分钟
          timeout: 15000, // 15秒
          highAccuracy: true
        }
      };
      
    case 'test':
      return {
        ...baseConfig,
        serviceOptions: {
          ...baseConfig.serviceOptions,
          cacheTimeout: 1000, // 1秒
          timeout: 5000, // 5秒
          highAccuracy: false
        }
      };
      
    case 'development':
    default:
      return baseConfig;
  }
};

/**
 * 全局配置实例
 */
export const locationConfig: LocationConfig = getLocationConfigByEnvironment();

/**
 * 重新加载配置（用于动态配置更新）
 */
export const reloadLocationConfig = (): LocationConfig => {
  const newConfig = getLocationConfigByEnvironment();
  Object.assign(locationConfig, newConfig);
  return locationConfig;
};

export default locationConfig;