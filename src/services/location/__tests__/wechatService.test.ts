/**
 * 微信定位服务测试
 */

import { WeChatLocationService, createWeChatLocationService, weChatLocationService } from '../wechatService';
import * as wechatUtils from '../../../utils/location/wechat';
// Mock permission utilities before importing
jest.mock('../../../utils/location/permission', () => ({
  checkLocationPermission: jest.fn(),
  permissionManager: {
    instance: {
      addListener: jest.fn(),
      getStatus: jest.fn()
    }
  }
}));

// Mock wechat utilities
jest.mock('../../../utils/location/wechat', () => ({
  getWeChatLocation: jest.fn(),
  getWeChatLocationWithTimeout: jest.fn(),
  validateWeChatLocation: jest.fn(),
  CoordinateTransformer: {
    gcj02ToWgs84: jest.fn().mockReturnValue({ lat: 39.9042, lng: 116.4074 }),
    wgs84ToGcj02: jest.fn().mockReturnValue({ lat: 39.9042, lng: 116.4074 })
  }
}));

import * as permissionUtils from '../../../utils/location/permission';
import { 
  LocationPermissionStatus, 
  LocationErrorType,
  LocationData,
  WeChatLocation,
  LocationServiceOptions
} from '../types';

// Mock utilities
jest.mock('../../../utils/location/wechat');
jest.mock('../../../utils/location/permission');

const mockGetWeChatLocationWithTimeout = wechatUtils.getWeChatLocationWithTimeout as jest.Mock;
const mockValidateWeChatLocation = wechatUtils.validateWeChatLocation as jest.Mock;
const mockCheckLocationPermission = permissionUtils.checkLocationPermission as jest.Mock;

describe('WeChatLocationService', () => {
  let service: WeChatLocationService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // 默认mock返回值
    mockCheckLocationPermission.mockResolvedValue(LocationPermissionStatus.GRANTED);
    mockValidateWeChatLocation.mockReturnValue(true);
    
    service = new WeChatLocationService();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.destroy();
  });

  describe('构造函数', () => {
    it('应该使用默认选项初始化', () => {
      const defaultService = new WeChatLocationService();
      
      const options = defaultService.getOptions();
      expect(options.cacheTimeout).toBe(300000); // 5分钟
      expect(options.timeout).toBe(10000); // 10秒
      expect(options.highAccuracy).toBe(true);
      
      defaultService.destroy();
    });

    it('应该使用自定义选项初始化', () => {
      const customOptions: LocationServiceOptions = {
        cacheTimeout: 600000, // 10分钟
        timeout: 15000, // 15秒
        highAccuracy: false,
        tencentMapKey: 'test-key'
      };
      
      const customService = new WeChatLocationService(customOptions);
      const options = customService.getOptions();
      
      expect(options.cacheTimeout).toBe(600000);
      expect(options.timeout).toBe(15000);
      expect(options.highAccuracy).toBe(false);
      expect(options.tencentMapKey).toBe('test-key');
      
      customService.destroy();
    });
  });

  describe('定位策略', () => {
    const mockWeChatLocation: WeChatLocation = {
      latitude: 39.9042,
      longitude: 116.4074,
      accuracy: 65,
      speed: 0,
      altitude: 50
    };

    beforeEach(() => {
      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockWeChatLocation);
    });

    describe('highAccuracy', () => {
      it('应该使用高精度配置获取位置', async () => {
        const location = await service.highAccuracy();

        expect(mockCheckLocationPermission).toHaveBeenCalled();
        expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalledWith(
          {
            type: 'gcj02',
            altitude: true,
            highAccuracyExpireTime: 3000
          },
          15000 // 高精度超时时间
        );
        expect(mockValidateWeChatLocation).toHaveBeenCalledWith(mockWeChatLocation);
        
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
        expect(location).toHaveProperty('accuracy', 65);
        expect(location).toHaveProperty('timestamp');
      });
    });

    describe('balanced', () => {
      it('应该使用平衡配置获取位置', async () => {
        const location = await service.balanced();

        expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalledWith(
          {
            type: 'gcj02',
            altitude: false
          },
          10000 // 默认超时时间
        );
        
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
      });
    });

    describe('lowPower', () => {
      it('应该使用低功耗配置获取位置', async () => {
        const location = await service.lowPower();

        expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalledWith(
          {
            type: 'gcj02',
            altitude: false
          },
          10000 // 默认超时时间
        );
        
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
      });
    });

    describe('cacheFirst', () => {
      it('应该优先使用缓存位置', async () => {
        // 首先设置缓存
        const cachedLocation: LocationData = {
          latitude: 39.9050,
          longitude: 116.4080,
          address: '缓存地址',
          accuracy: 50,
          timestamp: Date.now()
        };
        
        // 手动设置缓存
        service.clearCache();
        await service.highAccuracy(); // 创建缓存
        
        // 重置mock以验证缓存被使用
        mockGetWeChatLocationWithTimeout.mockClear();
        
        // 使用缓存优先模式
        const location = await service.cacheFirst();
        
        // 不应该调用微信API，应该使用缓存
        expect(mockGetWeChatLocationWithTimeout).not.toHaveBeenCalled();
        expect(location).toBeDefined();
      });

      it('应该在缓存不存在时获取新位置', async () => {
        // 清空缓存
        service.clearCache();
        
        const location = await service.cacheFirst();

        // 应该调用微信API获取位置
        expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalled();
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
      });
    });
  });

  describe('权限检查', () => {
    it('应该成功检查权限', async () => {
      mockGetWeChatLocationWithTimeout.mockResolvedValue({
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      });

      await service.highAccuracy();

      expect(mockCheckLocationPermission).toHaveBeenCalled();
    });

    it('应该抛出权限错误当权限被拒绝时', async () => {
      mockCheckLocationPermission.mockResolvedValue(LocationPermissionStatus.DENIED);

      await expect(service.highAccuracy()).rejects.toThrow('定位权限被拒绝，请在设置中开启位置权限');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.PERMISSION_DENIED);
        expect(error.name).toBe('LocationPermissionError');
      }
    });
  });

  describe('坐标转换', () => {
    it('应该正确转换GCJ02坐标到WGS84', async () => {
      const gcj02Location: WeChatLocation = {
        latitude: 39.9042, // GCJ02坐标
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(gcj02Location);

      const location = await service.highAccuracy();

      // 验证坐标被转换（微信坐标是GCJ02，内部存储为WGS84）
      // 由于我们mock了坐标转换，验证转换函数被调用即可
      expect(wechatUtils.CoordinateTransformer.gcj02ToWgs84).toHaveBeenCalledWith(
        gcj02Location.latitude,
        gcj02Location.longitude
      );
      expect(location.accuracy).toBe(gcj02Location.accuracy);
    });

    it('应该验证微信位置数据的有效性', async () => {
      const invalidLocation: WeChatLocation = {
        latitude: 91, // 无效的纬度
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(invalidLocation);
      mockValidateWeChatLocation.mockReturnValue(false);

      await expect(service.highAccuracy()).rejects.toThrow('无效的坐标数据');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.INVALID_COORDINATES);
        expect(error.name).toBe('InvalidCoordinatesError');
      }
    });
  });

  describe('缓存管理', () => {
    it('应该正确缓存位置', async () => {
      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 第一次获取位置，应该缓存
      const location1 = await service.highAccuracy();
      
      // 重置mock
      mockGetWeChatLocationWithTimeout.mockClear();
      
      // 第二次获取位置，应该使用缓存
      const location2 = await service.highAccuracy();

      // 第二次不应该调用微信API
      expect(mockGetWeChatLocationWithTimeout).not.toHaveBeenCalled();
      expect(location2.latitude).toBe(location1.latitude);
      expect(location2.longitude).toBe(location1.longitude);
    });

    it('应该处理缓存过期', async () => {
      const serviceWithShortTimeout = new WeChatLocationService({
        cacheTimeout: 1000 // 1秒超时
      });

      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 第一次获取位置
      await serviceWithShortTimeout.highAccuracy();
      
      // 推进时间，使缓存过期
      jest.advanceTimersByTime(2000);
      
      // 重置mock
      mockGetWeChatLocationWithTimeout.mockClear();
      
      // 再次获取位置，应该重新调用API
      await serviceWithShortTimeout.highAccuracy();

      expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalled();
      
      serviceWithShortTimeout.destroy();
    });

    it('应该清除缓存', async () => {
      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 首先获取位置创建缓存
      await service.highAccuracy();
      
      // 清除缓存
      service.clearCache();
      
      // 重置mock
      mockGetWeChatLocationWithTimeout.mockClear();
      
      // 再次获取位置，应该重新调用API
      await service.highAccuracy();

      expect(mockGetWeChatLocationWithTimeout).toHaveBeenCalled();
    });

    it('应该限制缓存大小', async () => {
      // 创建缓存限制较小的服务进行测试
      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 多次获取位置
      for (let i = 0; i < 60; i++) {
        await service.highAccuracy();
      }

      const stats = service.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it('应该获取缓存统计', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('timeout');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
      expect(typeof stats.timeout).toBe('number');
    });
  });

  describe('错误处理', () => {
    it('应该处理微信API错误', async () => {
      const wechatError = {
        errMsg: 'getLocation:fail auth deny'
      };

      mockGetWeChatLocationWithTimeout.mockRejectedValue(wechatError);

      await expect(service.highAccuracy()).rejects.toThrow('定位权限被拒绝，请在设置中开启位置权限');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.PERMISSION_DENIED);
        expect(error.name).toBe('WeChatLocationServiceError');
        expect(error.details).toHaveProperty('originalError', wechatError);
        expect(error.details).toHaveProperty('strategy', 'highAccuracy');
      }
    });

    it('应该处理超时错误', async () => {
      const timeoutError = {
        errMsg: 'getLocation:fail timeout'
      };

      mockGetWeChatLocationWithTimeout.mockRejectedValue(timeoutError);

      await expect(service.highAccuracy()).rejects.toThrow('定位超时，请重试或检查网络连接');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.TIMEOUT);
      }
    });

    it('应该处理服务关闭错误', async () => {
      const serviceError = {
        errMsg: 'getLocation:fail service disabled'
      };

      mockGetWeChatLocationWithTimeout.mockRejectedValue(serviceError);

      await expect(service.highAccuracy()).rejects.toThrow('定位服务已关闭，请开启定位服务');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.SERVICE_DISABLED);
      }
    });

    it('应该处理网络错误', async () => {
      const networkError = {
        errMsg: 'getLocation:fail network error'
      };

      mockGetWeChatLocationWithTimeout.mockRejectedValue(networkError);

      await expect(service.highAccuracy()).rejects.toThrow('网络连接失败，请检查网络设置');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.NETWORK_ERROR);
      }
    });

    it('应该处理未知错误', async () => {
      const unknownError = new Error('Unknown error');

      mockGetWeChatLocationWithTimeout.mockRejectedValue(unknownError);

      await expect(service.highAccuracy()).rejects.toThrow('Unknown error');
      
      try {
        await service.highAccuracy();
      } catch (error: any) {
        expect(error.type).toBe(LocationErrorType.UNKNOWN_ERROR);
        expect(error.message).toBe('Unknown error');
      }
    });
  });

  describe('服务管理', () => {
    it('应该获取最后位置', async () => {
      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      expect(service.getLastLocation()).toBe(null);

      const location = await service.highAccuracy();
      const lastLocation = service.getLastLocation();

      expect(lastLocation).not.toBe(null);
      expect(lastLocation!.latitude).toBe(location.latitude);
      expect(lastLocation!.longitude).toBe(location.longitude);
    });

    it('应该更新服务选项', () => {
      const newOptions: Partial<LocationServiceOptions> = {
        cacheTimeout: 10000,
        highAccuracy: false
      };

      service.updateOptions(newOptions);
      const updatedOptions = service.getOptions();

      expect(updatedOptions.cacheTimeout).toBe(10000);
      expect(updatedOptions.highAccuracy).toBe(false);
    });

    it('应该正确销毁服务', () => {
      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 先获取位置创建缓存
      service.highAccuracy().then(() => {
        service.destroy();

        expect(service.getLastLocation()).toBe(null);
        expect(service.getCacheStats().size).toBe(0);
      });
    });
  });

  describe('创建函数', () => {
    it('应该使用createWeChatLocationService创建服务实例', () => {
      const options: LocationServiceOptions = {
        cacheTimeout: 20000,
        highAccuracy: false
      };

      const newService = createWeChatLocationService(options);
      
      expect(newService).toBeInstanceOf(WeChatLocationService);
      expect(newService.getOptions().cacheTimeout).toBe(20000);
      expect(newService.getOptions().highAccuracy).toBe(false);
      
      newService.destroy();
    });

    it('应该创建默认服务实例', () => {
      expect(weChatLocationService).toBeInstanceOf(WeChatLocationService);
      expect(weChatLocationService.getOptions().highAccuracy).toBe(true);
    });
  });

  describe('缓存清理', () => {
    it('应该定期清理过期缓存', async () => {
      const serviceWithShortCleanup = new WeChatLocationService({
        cacheTimeout: 1000 // 1秒过期
      });

      const mockLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      mockGetWeChatLocationWithTimeout.mockResolvedValue(mockLocation);

      // 获取位置创建缓存
      await serviceWithShortCleanup.highAccuracy();
      
      expect(serviceWithShortCleanup.getCacheStats().size).toBe(1);
      
      // 推进时间，使缓存过期
      jest.advanceTimersByTime(2000);
      
      // 再次推进清理间隔时间
      jest.advanceTimersByTime(60 * 60 * 1000); // 1小时
      
      // 缓存应该被清理
      expect(serviceWithShortCleanup.getCacheStats().size).toBe(0);
      
      serviceWithShortCleanup.destroy();
    });
  });
});