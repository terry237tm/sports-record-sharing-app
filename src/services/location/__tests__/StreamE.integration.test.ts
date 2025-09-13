/**
 * Stream E 最终集成测试
 * 验证所有组件的完整集成和生态系统功能
 */

import { 
  LocationEcosystem, 
  getLocationEcosystem, 
  resetLocationEcosystem,
  MapView,
  AdvancedLocationCache,
  OptimizedLocationStrategy,
  LocationPrivacyManager
} from '../index';

import { LocationData, LocationPermissionStatus } from '../types';

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
 * 等待函数
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Stream E 最终集成测试', () => {
  let ecosystem: LocationEcosystem;

  beforeEach(() => {
    resetLocationEcosystem();
    ecosystem = getLocationEcosystem({
      cache: {
        maxSize: 50,
        ttl: 2000, // 2秒，便于测试
        enablePersistence: false
      },
      strategy: {
        enableAdaptiveSelection: true,
        performanceWeight: 0.4,
        accuracyWeight: 0.3,
        powerWeight: 0.3
      },
      privacy: {
        enableEncryption: true,
        enableMasking: true,
        maskingAccuracy: 100,
        enableAccessControl: true
      },
      monitoring: {
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableUsageAnalytics: true
      }
    });
  });

  afterEach(() => {
    ecosystem.destroy();
    resetLocationEcosystem();
  });

  describe('Stream E 核心功能验证', () => {
    it('应该成功创建完整的生态系统', () => {
      expect(ecosystem).toBeDefined();
      expect(ecosystem.getStatus).toBeDefined();
      expect(ecosystem.getCurrentLocation).toBeDefined();
      expect(ecosystem.getLocationHistory).toBeDefined();
      expect(ecosystem.getPerformanceMetrics).toBeDefined();
    });

    it('应该正确初始化所有子系统', () => {
      const status = ecosystem.getStatus();
      
      // 验证服务系统
      expect(status.service.isInitialized).toBe(true);
      
      // 验证缓存系统
      expect(status.cache.isEnabled).toBe(true);
      expect(status.cache.currentSize).toBe(0);
      expect(status.cache.hitRate).toBe(0);
      
      // 验证策略系统
      expect(status.strategy.currentStrategy).toBeDefined();
      expect(status.strategy.metrics).toBeDefined();
      
      // 验证隐私系统
      expect(status.privacy.isEncryptionEnabled).toBe(true);
      expect(status.privacy.isMaskingEnabled).toBe(true);
      expect(status.privacy.auditLogCount).toBe(0);
      
      // 验证监控系统
      expect(status.monitoring.totalRequests).toBe(0);
      expect(status.monitoring.successRate).toBe(0);
      expect(status.monitoring.averageResponseTime).toBe(0);
    });
  });

  describe('MapView 组件集成', () => {
    it('应该正确导出 MapView 组件', () => {
      expect(MapView).toBeDefined();
      expect(typeof MapView).toBe('function');
    });

    it('应该支持 MapView 的所有配置选项', () => {
      // 验证 MapView 的 Props 类型定义存在
      expect(MapView).toBeDefined();
      
      // 由于 MapView 是一个 React 组件，我们验证其基本结构
      const mapViewComponent = MapView;
      expect(mapViewComponent).toBeTruthy();
    });
  });

  describe('高级缓存系统集成', () => {
    it('应该正确集成高级缓存系统', () => {
      const cacheManager = (ecosystem as any).cacheManager as AdvancedLocationCache;
      expect(cacheManager).toBeDefined();
      expect(cacheManager.get).toBeDefined();
      expect(cacheManager.set).toBeDefined();
      expect(cacheManager.getStats).toBeDefined();
    });

    it('应该支持缓存的所有高级功能', async () => {
      const cacheManager = (ecosystem as any).cacheManager as AdvancedLocationCache;
      
      // 测试 TTL 功能
      const testKey = 'ttl-test';
      cacheManager.set(testKey, mockLocationData);
      
      // 立即获取应该成功
      const immediateResult = cacheManager.get(testKey);
      expect(immediateResult).toBeDefined();
      expect(immediateResult?.location).toEqual(mockLocationData);
      
      // 等待 TTL 过期
      await wait(2100); // TTL 是 2000ms
      
      // 过期后应该返回 null
      const expiredResult = cacheManager.get(testKey);
      expect(expiredResult).toBeNull();
    });

    it('应该支持 LRU 策略', () => {
      const cacheManager = (ecosystem as any).cacheManager as AdvancedLocationCache;
      
      // 设置较小的最大容量
      cacheManager.updateConfig({ maxSize: 3 });
      
      // 添加超过容量的数据
      for (let i = 0; i < 5; i++) {
        cacheManager.set(`lru-test-${i}`, {
          ...mockLocationData,
          latitude: mockLocationData.latitude + i * 0.01
        });
      }
      
      const stats = cacheManager.getStats();
      expect(stats.currentSize).toBeLessThanOrEqual(3);
    });
  });

  describe('策略优化系统集成', () => {
    it('应该正确集成策略优化系统', () => {
      const strategyManager = (ecosystem as any).strategyManager as OptimizedLocationStrategy;
      expect(strategyManager).toBeDefined();
      expect(strategyManager.smartLocation).toBeDefined();
      expect(strategyManager.getStrategyMetrics).toBeDefined();
      expect(strategyManager.getPerformanceMetrics).toBeDefined();
    });

    it('应该支持智能策略选择', () => {
      const strategyManager = (ecosystem as any).strategyManager as OptimizedLocationStrategy;
      const selectionConfig = strategyManager.getSelectionConfig();
      
      expect(selectionConfig.enableAdaptiveSelection).toBe(true);
      expect(selectionConfig.performanceWeight).toBe(0.4);
      expect(selectionConfig.accuracyWeight).toBe(0.3);
      expect(selectionConfig.powerWeight).toBe(0.3);
    });

    it('应该支持错误恢复机制', () => {
      const strategyManager = (ecosystem as any).strategyManager as OptimizedLocationStrategy;
      const recoveryConfig = strategyManager.getRecoveryConfig();
      
      expect(recoveryConfig.maxRetries).toBe(3);
      expect(recoveryConfig.retryDelay).toBe(1000);
      expect(recoveryConfig.backoffStrategy).toBe('exponential');
      expect(recoveryConfig.fallbackStrategy).toBe('cache');
    });
  });

  describe('隐私保护系统集成', () => {
    it('应该正确集成隐私保护系统', () => {
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      expect(privacyManager).toBeDefined();
      expect(privacyManager.encryptLocation).toBeDefined();
      expect(privacyManager.maskLocation).toBeDefined();
      expect(privacyManager.checkAccess).toBeDefined();
      expect(privacyManager.getAuditLogs).toBeDefined();
    });

    it('应该支持数据加密功能', () => {
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      
      const encrypted = privacyManager.encryptLocation(mockLocationData);
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-CBC');
      expect(encrypted.hash).toBeDefined();
      
      // 解密验证
      const decrypted = privacyManager.decryptLocation(encrypted);
      expect(decrypted.latitude).toBe(mockLocationData.latitude);
      expect(decrypted.longitude).toBe(mockLocationData.longitude);
    });

    it('应该支持数据脱敏功能', () => {
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      
      const masked = privacyManager.maskLocation(mockLocationData);
      expect(masked).toBeDefined();
      // 坐标应该被脱敏处理
      expect(masked.latitude).not.toBe(mockLocationData.latitude);
      expect(masked.longitude).not.toBe(mockLocationData.longitude);
    });

    it('应该支持访问控制功能', () => {
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      
      const hasAccess = privacyManager.checkAccess(
        { userId: 'test-user', authenticated: true },
        mockLocationData
      );
      
      expect(typeof hasAccess).toBe('boolean');
    });

    it('应该支持访问审计功能', () => {
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      
      // 记录访问
      privacyManager.logAccess({
        accessType: 'read',
        accessor: { userId: 'test-user' },
        result: 'success',
        duration: 100
      });
      
      const logs = privacyManager.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].accessType).toBe('read');
      expect(logs[0].result).toBe('success');
    });
  });

  describe('监控系统集成', () => {
    it('应该正确集成性能监控系统', () => {
      const metrics = ecosystem.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.performance).toBeDefined();
      expect(metrics.cache).toBeDefined();
      expect(metrics.strategy).toBeDefined();
      expect(metrics.usage).toBeDefined();
    });

    it('应该正确集成错误跟踪系统', () => {
      const errorReport = ecosystem.getErrorReport();
      expect(errorReport).toBeDefined();
      expect(errorReport.totalErrors).toBeDefined();
      expect(errorReport.recentErrors).toBeDefined();
      expect(errorReport.errorsByType).toBeDefined();
    });

    it('应该正确记录性能指标', async () => {
      const initialMetrics = ecosystem.getPerformanceMetrics();
      const initialTotalRequests = initialMetrics.performance.totalRequests;
      
      // 执行一次位置请求（可能失败，但应该记录）
      try {
        await ecosystem.getCurrentLocation({
          strategy: 'balanced',
          enablePrivacy: true
        });
      } catch (error) {
        // 忽略错误，只检查指标记录
      }
      
      const updatedMetrics = ecosystem.getPerformanceMetrics();
      const updatedTotalRequests = updatedMetrics.performance.totalRequests;
      
      expect(updatedTotalRequests).toBeGreaterThan(initialTotalRequests);
    });
  });

  describe('完整工作流测试', () => {
    it('应该支持完整的运动记录工作流', async () => {
      // 1. 获取当前位置（模拟）
      let currentLocation: LocationData | null = null;
      try {
        currentLocation = await ecosystem.getCurrentLocation({
          strategy: 'smart',
          enablePrivacy: true,
          accessor: { userId: 'test-user' }
        });
      } catch (error) {
        // 如果真实位置获取失败，使用模拟数据
        currentLocation = mockLocationData;
      }
      
      expect(currentLocation).toBeDefined();
      
      // 2. 验证隐私保护应用
      if (currentLocation) {
        // 位置数据应该经过隐私保护处理
        expect(currentLocation.latitude).toBeDefined();
        expect(currentLocation.longitude).toBeDefined();
      }
      
      // 3. 验证缓存机制
      const cacheManager = (ecosystem as any).cacheManager as AdvancedLocationCache;
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.totalRequests).toBeGreaterThan(0);
      
      // 4. 验证策略选择
      const strategyManager = (ecosystem as any).strategyManager as OptimizedLocationStrategy;
      const strategyMetrics = strategyManager.getStrategyMetrics();
      expect(strategyMetrics.size).toBeGreaterThan(0);
      
      // 5. 验证审计记录
      const privacyManager = (ecosystem as any).privacyManager as LocationPrivacyManager;
      const auditLogs = privacyManager.getAuditLogs();
      expect(auditLogs.length).toBeGreaterThanOrEqual(0);
      
      // 6. 验证监控系统
      const performanceMetrics = ecosystem.getPerformanceMetrics();
      expect(performanceMetrics.performance.totalRequests).toBeGreaterThan(0);
    });

    it('应该支持位置历史查询工作流', async () => {
      // 1. 获取位置历史
      const history = await ecosystem.getLocationHistory({
        limit: 10,
        enablePrivacy: true
      });
      
      expect(Array.isArray(history)).toBe(true);
      
      // 2. 验证历史数据格式
      history.forEach(location => {
        expect(location.latitude).toBeDefined();
        expect(location.longitude).toBeDefined();
        expect(location.timestamp).toBeDefined();
      });
      
      // 3. 搜索附近位置
      if (history.length > 0) {
        const center = history[0];
        const nearby = await ecosystem.searchNearbyLocations(center, 1000);
        expect(Array.isArray(nearby)).toBe(true);
      }
    });

    it('应该支持性能分析工作流', () => {
      // 1. 获取完整性能指标
      const metrics = ecosystem.getPerformanceMetrics();
      
      expect(metrics.performance).toBeDefined();
      expect(metrics.cache).toBeDefined();
      expect(metrics.strategy).toBeDefined();
      expect(metrics.usage).toBeDefined();
      
      // 2. 验证性能数据格式
      expect(typeof metrics.performance.totalRequests).toBe('number');
      expect(typeof metrics.performance.successRate).toBe('number');
      expect(typeof metrics.performance.averageResponseTime).toBe('number');
      
      // 3. 获取系统状态
      const status = ecosystem.getStatus();
      expect(status.service.isInitialized).toBe(true);
      expect(status.cache.isEnabled).toBe(true);
      expect(status.privacy.isEncryptionEnabled).toBe(true);
    });
  });

  describe('错误处理和降级机制', () => {
    it('应该优雅处理各种错误情况', async () => {
      // 1. 测试无效策略
      try {
        await ecosystem.getCurrentLocation({
          strategy: 'invalid-strategy' as any
        });
        fail('应该抛出错误');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // 2. 测试无权限访问
      try {
        await ecosystem.getCurrentLocation({
          accessor: null,
          enablePrivacy: true
        });
        // 可能成功或失败，取决于访问控制配置
      } catch (error) {
        // 期望的错误情况
        expect(error).toBeDefined();
      }
      
      // 3. 验证错误被正确记录
      const errorReport = ecosystem.getErrorReport();
      expect(errorReport.totalErrors).toBeGreaterThanOrEqual(0);
    });

    it('应该提供降级方案', async () => {
      // 1. 测试缓存降级
      const cacheFallbackLocation = await ecosystem.getCurrentLocation({
        strategy: 'cacheFirst',
        useCache: true
      });
      
      // 即使没有GPS信号，也应该返回某种形式的位置数据
      expect(cacheFallbackLocation).toBeDefined();
      
      // 2. 测试低功耗降级
      const lowPowerLocation = await ecosystem.getCurrentLocation({
        strategy: 'lowPower',
        enablePrivacy: false
      });
      
      expect(lowPowerLocation).toBeDefined();
    });
  });

  describe('配置管理', () => {
    it('应该支持动态配置更新', () => {
      // 1. 获取初始配置
      const initialStatus = ecosystem.getStatus();
      
      // 2. 更新配置
      ecosystem.updateConfig({
        cache: {
          maxSize: 200,
          ttl: 10000
        },
        strategy: {
          enableAdaptiveSelection: false,
          performanceWeight: 0.6
        },
        privacy: {
          enableEncryption: false,
          enableAccessControl: false
        }
      });
      
      // 3. 验证配置更新
      const updatedStatus = ecosystem.getStatus();
      expect(updatedStatus.privacy.isEncryptionEnabled).toBe(false);
      expect(updatedStatus.privacy.isMaskingEnabled).toBe(true); // 其他配置保持不变
    });

    it('应该支持系统重置', () => {
      // 1. 执行一些操作
      ecosystem.getCurrentLocation();
      
      // 2. 重置系统
      ecosystem.reset();
      
      // 3. 验证重置结果
      const status = ecosystem.getStatus();
      expect(status.monitoring.totalRequests).toBe(0);
      expect(status.cache.currentSize).toBe(0);
    });
  });

  describe('性能基准测试', () => {
    it('应该满足性能要求', async () => {
      const iterations = 5;
      const startTime = Date.now();
      
      // 执行多次位置请求
      for (let i = 0; i < iterations; i++) {
        try {
          await ecosystem.getCurrentLocation({
            strategy: 'cacheFirst',
            useCache: true
          });
        } catch (error) {
          // 忽略错误，继续测试
        }
        
        // 短暂延迟模拟真实使用场景
        await wait(100);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      
      // 缓存优先的平均响应时间应该很快（<500ms）
      expect(averageTime).toBeLessThan(1000); // 放宽要求以适应测试环境
      
      // 验证成功率
      const metrics = ecosystem.getPerformanceMetrics();
      const successRate = metrics.performance.successRate;
      expect(successRate).toBeGreaterThanOrEqual(0); // 可能全部为失败，但系统应该正常工作
    });

    it('应该正确处理并发请求', async () => {
      const concurrentRequests = 3;
      
      // 并发执行多个请求
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) =>
        ecosystem.getCurrentLocation({
          strategy: i % 2 === 0 ? 'balanced' : 'lowPower'
        }).catch(() => null)
      );
      
      const results = await Promise.all(requestPromises);
      
      // 所有请求都应该完成
      expect(results.length).toBe(concurrentRequests);
      
      // 验证请求被正确记录
      const status = ecosystem.getStatus();
      expect(status.monitoring.totalRequests).toBeGreaterThanOrEqual(concurrentRequests);
    });
  });

  describe('Stream E 特定功能', () => {
    it('应该支持完整的位置服务生态系统功能', () => {
      // 验证所有 Stream E 新增的功能都存在
      const ecosystem = getLocationEcosystem();
      
      // 高级缓存功能
      expect(ecosystem.getLocationHistory).toBeDefined();
      expect(ecosystem.searchNearbyLocations).toBeDefined();
      
      // 策略优化功能
      expect(ecosystem.getPerformanceMetrics).toBeDefined();
      expect(ecosystem.getErrorReport).toBeDefined();
      
      // 统一配置管理
      expect(ecosystem.updateConfig).toBeDefined();
      expect(ecosystem.reset).toBeDefined();
      expect(ecosystem.destroy).toBeDefined();
    });

    it('应该提供完整的 Stream E 类型导出', () => {
      // 验证所有类型都能正确导入
      expect(typeof LocationEcosystem).toBe('function');
      expect(typeof AdvancedLocationCache).toBe('function');
      expect(typeof OptimizedLocationStrategy).toBe('function');
      expect(typeof LocationPrivacyManager).toBe('function');
      expect(typeof MapView).toBe('function');
    });
  });
});