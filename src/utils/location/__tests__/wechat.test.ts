/**
 * 微信定位API封装工具测试
 */

import Taro from '@tarojs/taro';
import {
  CoordinateTransformer,
  getWeChatLocation,
  getWeChatLocationWithTimeout,
  isWeChatLocationAvailable,
  getWeChatLocationErrorMessage,
  validateWeChatLocation,
  getAccuracyLevel,
  formatLocationInfo,
  WeChatLocationOptions
} from '../wechat';
import { WeChatLocation, LocationErrorType } from '../../../services/location/types';

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  getLocation: jest.fn(),
  getSystemInfo: jest.fn()
}));

describe('微信定位API封装工具', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('CoordinateTransformer', () => {
    describe('wgs84ToGcj02', () => {
      it('应该正确转换WGS84坐标到GCJ02坐标', () => {
        // 北京天安门坐标示例
        const wgs84Lat = 39.9042;
        const wgs84Lng = 116.4074;
        
        const result = CoordinateTransformer.wgs84ToGcj02(wgs84Lat, wgs84Lng);
        
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lng');
        expect(typeof result.lat).toBe('number');
        expect(typeof result.lng).toBe('number');
        // GCJ02坐标与WGS84坐标的偏差通常在几米范围内
        expect(Math.abs(result.lat - wgs84Lat)).toBeLessThan(0.01);
        expect(Math.abs(result.lng - wgs84Lng)).toBeLessThan(0.01);
      });

      it('应该处理中国境外坐标', () => {
        // 纽约坐标（中国境外）
        const lat = 40.7128;
        const lng = -74.0060;
        
        const result = CoordinateTransformer.wgs84ToGcj02(lat, lng);
        
        // 境外坐标应该返回原坐标
        expect(result.lat).toBe(lat);
        expect(result.lng).toBe(lng);
      });

      it('应该处理边界坐标', () => {
        // 中国边界坐标
        const lat = 53.0;
        const lng = 135.0;
        
        const result = CoordinateTransformer.wgs84ToGcj02(lat, lng);
        
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lng');
      });
    });

    describe('gcj02ToWgs84', () => {
      it('应该正确转换GCJ02坐标到WGS84坐标', () => {
        // GCJ02坐标示例
        const gcj02Lat = 39.9087;
        const gcj02Lng = 116.4134;
        
        const result = CoordinateTransformer.gcj02ToWgs84(gcj02Lat, gcj02Lng);
        
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lng');
        expect(typeof result.lat).toBe('number');
        expect(typeof result.lng).toBe('number');
        // 转换后的坐标应该接近原坐标
        expect(Math.abs(result.lat - gcj02Lat)).toBeLessThan(0.01);
        expect(Math.abs(result.lng - gcj02Lng)).toBeLessThan(0.01);
      });

      it('应该处理中国境外坐标', () => {
        // 境外坐标
        const lat = 40.7128;
        const lng = -74.0060;
        
        const result = CoordinateTransformer.gcj02ToWgs84(lat, lng);
        
        // 境外坐标应该返回原坐标
        expect(result.lat).toBe(lat);
        expect(result.lng).toBe(lng);
      });
    });

    describe('坐标转换双向验证', () => {
      it('WGS84 -> GCJ02 -> WGS84 应该接近原坐标', () => {
        const originalLat = 39.9042;
        const originalLng = 116.4074;
        
        const gcj02 = CoordinateTransformer.wgs84ToGcj02(originalLat, originalLng);
        const backToWgs84 = CoordinateTransformer.gcj02ToWgs84(gcj02.lat, gcj02.lng);
        
        // 允许一定的计算误差
        expect(Math.abs(backToWgs84.lat - originalLat)).toBeLessThan(0.0001);
        expect(Math.abs(backToWgs84.lng - originalLng)).toBeLessThan(0.0001);
      });
    });
  });

  describe('getWeChatLocation', () => {
    it('应该成功获取微信位置信息', async () => {
      const mockLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65,
        speed: 0,
        altitude: 50,
        verticalAccuracy: 10,
        horizontalAccuracy: 65
      };

      (Taro.getLocation as jest.Mock).mockImplementation((options) => {
        options.success(mockLocation);
      });

      const result = await getWeChatLocation();

      expect(result).toEqual(mockLocation);
      expect(Taro.getLocation).toHaveBeenCalledWith({
        type: 'gcj02',
        altitude: false,
        highAccuracyExpireTime: 3000,
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });

    it('应该处理自定义选项', async () => {
      const options: WeChatLocationOptions = {
        type: 'wgs84',
        altitude: true,
        timeout: 5000
      };

      const mockLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      (Taro.getLocation as jest.Mock).mockImplementation((config) => {
        expect(config.type).toBe('wgs84');
        expect(config.altitude).toBe(true);
        config.success(mockLocation);
      });

      const result = await getWeChatLocation(options);

      expect(result).toEqual(mockLocation);
    });

    it('应该处理微信API错误', async () => {
      const mockError = {
        errMsg: 'getLocation:fail auth deny'
      };

      (Taro.getLocation as jest.Mock).mockImplementation((options) => {
        options.fail(mockError);
      });

      await expect(getWeChatLocation()).rejects.toThrow('getLocation:fail auth deny');
    });
  });

  describe('getWeChatLocationWithTimeout', () => {
    it('应该在成功时返回位置信息', async () => {
      const mockLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      (Taro.getLocation as jest.Mock).mockImplementation((options) => {
        options.success(mockLocation);
      });

      const result = await getWeChatLocationWithTimeout({}, 1000);

      expect(result).toEqual(mockLocation);
    }, 5000);

    it('应该在超时时抛出错误', async () => {
      (Taro.getLocation as jest.Mock).mockImplementation((options) => {
        // 不调用success或fail，模拟超时
      });

      const promise = getWeChatLocationWithTimeout({}, 500);
      
      jest.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow('定位超时，请重试或检查网络连接');
    });

    it('应该使用默认超时时间', async () => {
      const mockLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      (Taro.getLocation as jest.Mock).mockImplementation((options) => {
        options.success(mockLocation);
      });

      const result = await getWeChatLocationWithTimeout();

      expect(result).toEqual(mockLocation);
    }, 5000);
  });

  describe('isWeChatLocationAvailable', () => {
    it('应该返回true当微信API可用时', async () => {
      (Taro.getSystemInfo as jest.Mock).mockResolvedValue({
        SDKVersion: '2.15.0'
      });

      const result = await isWeChatLocationAvailable();

      expect(result).toBe(true);
    });

    it('应该返回false当API版本过低时', async () => {
      (Taro.getSystemInfo as jest.Mock).mockResolvedValue({
        SDKVersion: '0.9.0'
      });

      const result = await isWeChatLocationAvailable();

      expect(result).toBe(false);
    });

    it('应该返回false当获取系统信息失败时', async () => {
      (Taro.getSystemInfo as jest.Mock).mockRejectedValue(new Error('Failed'));

      const result = await isWeChatLocationAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getWeChatLocationErrorMessage', () => {
    it('应该正确识别权限错误', () => {
      const error = { errMsg: 'getLocation:fail auth deny' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('定位权限被拒绝，请在设置中开启位置权限');
    });

    it('应该正确识别服务关闭错误', () => {
      const error = { errMsg: 'getLocation:fail service disabled' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('定位服务已关闭，请开启定位服务');
    });

    it('应该正确识别超时错误', () => {
      const error = { errMsg: 'getLocation:fail timeout' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('定位超时，请重试或检查网络连接');
    });

    it('应该正确识别网络错误', () => {
      const error = { errMsg: 'getLocation:fail network error' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('网络连接失败，请检查网络设置');
    });

    it('应该返回默认错误消息', () => {
      const error = { errMsg: 'unknown error' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('定位失败，请重试');
    });

    it('应该处理没有errMsg的错误', () => {
      const error = { message: 'Custom error' };
      const result = getWeChatLocationErrorMessage(error);
      
      expect(result).toBe('Custom error');
    });
  });

  describe('validateWeChatLocation', () => {
    it('应该验证有效的位置数据', () => {
      const validLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      const result = validateWeChatLocation(validLocation);

      expect(result).toBe(true);
    });

    it('应该拒绝无效的位置数据', () => {
      const invalidLocation = {
        latitude: 'invalid',
        longitude: 116.4074,
        accuracy: 65
      } as any;

      const result = validateWeChatLocation(invalidLocation);

      expect(result).toBe(false);
    });

    it('应该拒绝null位置数据', () => {
      const result = validateWeChatLocation(null as any);

      expect(result).toBe(false);
    });

    it('应该拒绝超出纬度范围的坐标', () => {
      const invalidLocation: WeChatLocation = {
        latitude: 91,
        longitude: 116.4074,
        accuracy: 65
      };

      const result = validateWeChatLocation(invalidLocation);

      expect(result).toBe(false);
    });

    it('应该拒绝超出经度范围的坐标', () => {
      const invalidLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 181,
        accuracy: 65
      };

      const result = validateWeChatLocation(invalidLocation);

      expect(result).toBe(false);
    });

    it('应该拒绝负精度值', () => {
      const invalidLocation: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: -10
      };

      const result = validateWeChatLocation(invalidLocation);

      expect(result).toBe(false);
    });
  });

  describe('getAccuracyLevel', () => {
    it('应该返回高精度等级', () => {
      const result = getAccuracyLevel(30);
      expect(result).toBe('high');
    });

    it('应该返回中精度等级', () => {
      const result = getAccuracyLevel(100);
      expect(result).toBe('medium');
    });

    it('应该返回低精度等级', () => {
      const result = getAccuracyLevel(300);
      expect(result).toBe('low');
    });

    it('应该返回极低精度等级', () => {
      const result = getAccuracyLevel(600);
      expect(result).toBe('very_low');
    });

    it('应该处理边界值', () => {
      expect(getAccuracyLevel(50)).toBe('high');
      expect(getAccuracyLevel(200)).toBe('medium');
      expect(getAccuracyLevel(500)).toBe('low');
    });
  });

  describe('formatLocationInfo', () => {
    it('应该正确格式化位置信息', () => {
      const location: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65
      };

      const result = formatLocationInfo(location);

      expect(result).toContain('纬度: 39.904200');
      expect(result).toContain('经度: 116.407400');
      expect(result).toContain('中精度');
      expect(result).toContain('65米');
    });

    it('应该处理高精度位置', () => {
      const location: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 30
      };

      const result = formatLocationInfo(location);

      expect(result).toContain('高精度');
    });

    it('应该处理低精度位置', () => {
      const location: WeChatLocation = {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 400
      };

      const result = formatLocationInfo(location);

      expect(result).toContain('低精度');
    });
  });
});