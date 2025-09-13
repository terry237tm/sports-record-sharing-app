/**
 * 位置服务生态系统
 * 集成所有位置服务组件，提供统一的位置服务接口
 */

import { 
  LocationData, 
  LocationPermissionStatus, 
  LocationError,
  LocationServiceOptions,
  LocationStrategy 
} from './types';
import { CacheEventType } from './locationCache';
import { PrivacyEventType } from './privacyProtection';
import { LocationService } from './LocationService';
import { AdvancedLocationCache } from './locationCache';
import { OptimizedLocationStrategy } from './locationStrategy';
import { LocationPrivacyManager } from './privacyProtection';

/**
 * 生态系统配置接口
 */
export interface EcosystemConfig {
  /** 服务配置 */
  service?: LocationServiceOptions;
  /** 缓存配置 */
  cache?: {
    maxSize?: number;
    ttl?: number;
    enablePersistence?: boolean;
  };
  /** 策略配置 */
  strategy?: {
    enableAdaptiveSelection?: boolean;
    performanceWeight?: number;
    accuracyWeight?: number;
    powerWeight?: number;
  };
  /** 隐私配置 */
  privacy?: {
    enableEncryption?: boolean;
    enableMasking?: boolean;
    maskingAccuracy?: number;
    enableAccessControl?: boolean;
  };
  /** 监控配置 */
  monitoring?: {
    enablePerformanceMonitoring?: boolean;
    enableErrorTracking?: boolean;
    enableUsageAnalytics?: boolean;
  };
}

/**
 * 生态系统状态接口
 */
export interface EcosystemStatus {
  /** 服务状态 */
  service: {
    isInitialized: boolean;
    hasLocationPermission: boolean;
    currentLocation: LocationData | null;
  };
  /** 缓存状态 */
  cache: {
    isEnabled: boolean;
    currentSize: number;
    hitRate: number;
    storageSize: number;
  };
  /** 策略状态 */
  strategy: {
    currentStrategy: string;
    metrics: any;
    performance: any;
  };
  /** 隐私状态 */
  privacy: {
    isEncryptionEnabled: boolean;
    isMaskingEnabled: boolean;
    auditLogCount: number;
  };
  /** 监控状态 */
  monitoring: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
  };
}

/**
 * 位置服务生态系统
 * 提供统一的位置服务管理接口
 */
export class LocationEcosystem {
  private locationService: LocationService;
  private cacheManager: AdvancedLocationCache;
  private strategyManager: OptimizedLocationStrategy;
  private privacyManager: LocationPrivacyManager;
  private config: EcosystemConfig;
  private isInitialized: boolean;
  private performanceMonitor: PerformanceMonitor;
  private errorTracker: ErrorTracker;
  private usageAnalytics: UsageAnalytics;

  constructor(config: EcosystemConfig = {}) {
    this.config = config;
    this.isInitialized = false;

    // 初始化各个组件
    this.initializeComponents();
    
    // 初始化监控组件
    this.initializeMonitoring();
  }

  /**
   * 初始化各个组件
   */
  private initializeComponents(): void {
    try {
      // 初始化位置服务
      this.locationService = new LocationService(this.config.service || {});

      // 初始化缓存管理器
      this.cacheManager = new AdvancedLocationCache({
        maxSize: this.config.cache?.maxSize || 100,
        ttl: this.config.cache?.ttl || 5 * 60 * 1000,
        enablePersistence: this.config.cache?.enablePersistence !== false
      });

      // 初始化策略管理器
      this.strategyManager = new OptimizedLocationStrategy(this.config.service || {});

      // 初始化隐私管理器
      this.privacyManager = new LocationPrivacyManager({
        enableEncryption: this.config.privacy?.enableEncryption !== false,
        enableMasking: this.config.privacy?.enableMasking !== false,
        maskingAccuracy: this.config.privacy?.maskingAccuracy || 100,
        enableAccessControl: this.config.privacy?.enableAccessControl !== false
      });

      this.isInitialized = true;
      
      console.log('位置服务生态系统初始化完成');
    } catch (error) {
      console.error('位置服务生态系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化监控组件
   */
  private initializeMonitoring(): void {
    this.performanceMonitor = new PerformanceMonitor(
      this.config.monitoring?.enablePerformanceMonitoring !== false
    );
    
    this.errorTracker = new ErrorTracker(
      this.config.monitoring?.enableErrorTracking !== false
    );
    
    this.usageAnalytics = new UsageAnalytics(
      this.config.monitoring?.enableUsageAnalytics !== false
    );

    // 设置事件监听
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 缓存事件监听
    this.cacheManager.addEventListener(CacheEventType.HIT, (event) => {
      this.performanceMonitor.recordCacheHit();
      this.usageAnalytics.recordCacheUsage('hit');
    });

    this.cacheManager.addEventListener(CacheEventType.MISS, (event) => {
      this.performanceMonitor.recordCacheMiss();
      this.usageAnalytics.recordCacheUsage('miss');
    });

    // 隐私事件监听
    this.privacyManager.addEventListener(PrivacyEventType.ENCRYPTION, (event) => {
      if (event.result === 'failure') {
        this.errorTracker.trackPrivacyError('encryption_failed', event.error);
      }
    });
  }

  /**
   * 获取当前位置（智能模式）
   */
  public async getCurrentLocation(options: {
    useCache?: boolean;
    strategy?: 'smart' | 'highAccuracy' | 'balanced' | 'lowPower' | 'cacheFirst';
    enablePrivacy?: boolean;
    accessor?: any;
  } = {}): Promise<LocationData> {
    const startTime = Date.now();
    
    // 策略选择（移到 try 块外以便在 catch 中使用）
    const strategy = options.strategy || 'smart';
    
    try {
      // 权限检查
      await this.checkPermissions();

      // 访问控制检查
      if (options.enablePrivacy !== false && options.accessor) {
        const hasAccess = this.privacyManager.checkAccess(options.accessor);
        if (!hasAccess) {
          throw new Error('访问被拒绝：权限不足');
        }
      }

      let location: LocationData;

      // 策略选择
      
      switch (strategy) {
        case 'smart':
          location = await this.strategyManager.smartLocation();
          break;
        case 'highAccuracy':
          location = await this.strategyManager.highAccuracy();
          break;
        case 'balanced':
          location = await this.strategyManager.balanced();
          break;
        case 'lowPower':
          location = await this.strategyManager.lowPower();
          break;
        case 'cacheFirst':
          location = await this.strategyManager.cacheFirst();
          break;
        default:
          location = await this.strategyManager.smartLocation();
      }

      // 隐私保护处理
      if (options.enablePrivacy !== false) {
        location = this.privacyManager.maskLocation(location);
      }

      // 性能监控
      const responseTime = Date.now() - startTime;
      this.performanceMonitor.recordRequest(responseTime, true);
      
      // 使用分析
      this.usageAnalytics.recordLocationRequest(strategy, responseTime, true);

      return location;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // 错误跟踪
      this.errorTracker.trackLocationError(error as Error);
      
      // 性能监控
      this.performanceMonitor.recordRequest(responseTime, false);
      
      // 使用分析
      this.usageAnalytics.recordLocationRequest(strategy || 'smart', responseTime, false);

      throw error;
    }
  }

  /**
   * 获取位置历史
   */
  public async getLocationHistory(options: {
    startTime?: number;
    endTime?: number;
    limit?: number;
    enablePrivacy?: boolean;
  } = {}): Promise<LocationData[]> {
    try {
      // 从缓存中获取历史位置
      const allCacheKeys = this.cacheManager.getAllKeys();
      const allCachedItems = this.cacheManager.getMultiple(allCacheKeys);
      
      let locations = allCachedItems
        .filter(item => item !== null)
        .map(item => item!.location)
        .filter(location => {
          if (options.startTime && location.timestamp < options.startTime) {
            return false;
          }
          if (options.endTime && location.timestamp > options.endTime) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      // 限制数量
      if (options.limit) {
        locations = locations.slice(0, options.limit);
      }

      // 隐私保护处理
      if (options.enablePrivacy !== false) {
        locations = locations.map(location => 
          this.privacyManager.maskLocation(location)
        );
      }

      return locations;
    } catch (error) {
      this.errorTracker.trackLocationError(error as Error);
      throw error;
    }
  }

  /**
   * 搜索附近位置
   */
  public async searchNearbyLocations(center: LocationData, radius: number): Promise<LocationData[]> {
    try {
      const allLocations = await this.getLocationHistory();
      
      // 计算距离并过滤
      const nearbyLocations = allLocations.filter(location => {
        const distance = this.calculateDistance(center, location);
        return distance <= radius;
      });

      return nearbyLocations;
    } catch (error) {
      this.errorTracker.trackLocationError(error as Error);
      throw error;
    }
  }

  /**
   * 计算两个位置之间的距离
   */
  private calculateDistance(location1: LocationData, location2: LocationData): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = location1.latitude * Math.PI / 180;
    const lat2 = location2.latitude * Math.PI / 180;
    const deltaLat = (location2.latitude - location1.latitude) * Math.PI / 180;
    const deltaLng = (location2.longitude - location1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * 检查权限
   */
  private async checkPermissions(): Promise<void> {
    // 这里应该集成权限管理系统的检查
    // 暂时假设权限已授予
    return Promise.resolve();
  }

  /**
   * 获取生态系统状态
   */
  public getStatus(): EcosystemStatus {
    const cacheStats = this.cacheManager.getStats();
    const strategyMetrics = this.strategyManager.getStrategyMetrics();
    const performanceMetrics = this.performanceMonitor.getMetrics();
    const auditLogs = this.privacyManager.getAuditLogs();

    return {
      service: {
        isInitialized: this.isInitialized,
        hasLocationPermission: true, // 应该从权限系统获取
        currentLocation: null // 应该获取当前缓存的位置
      },
      cache: {
        isEnabled: true,
        currentSize: cacheStats.currentSize,
        hitRate: cacheStats.hitRate,
        storageSize: cacheStats.storageSize
      },
      strategy: {
        currentStrategy: 'smart',
        metrics: Object.fromEntries(strategyMetrics),
        performance: this.strategyManager.getPerformanceMetrics()
      },
      privacy: {
        isEncryptionEnabled: this.config.privacy?.enableEncryption !== false,
        isMaskingEnabled: this.config.privacy?.enableMasking !== false,
        auditLogCount: auditLogs.length
      },
      monitoring: {
        totalRequests: performanceMetrics.totalRequests,
        successRate: performanceMetrics.successfulRequests / Math.max(1, performanceMetrics.totalRequests),
        averageResponseTime: performanceMetrics.averageResponseTime
      }
    };
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics() {
    return {
      performance: this.performanceMonitor.getMetrics(),
      strategy: this.strategyManager.getPerformanceMetrics(),
      cache: this.cacheManager.getStats(),
      usage: this.usageAnalytics.getAnalytics()
    };
  }

  /**
   * 获取错误报告
   */
  public getErrorReport() {
    return this.errorTracker.getErrorReport();
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<EcosystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新各个组件的配置
    if (newConfig.cache) {
      this.cacheManager.updateConfig(newConfig.cache);
    }
    
    if (newConfig.strategy) {
      this.strategyManager.updateSelectionConfig({
        enableAdaptiveSelection: newConfig.strategy.enableAdaptiveSelection,
        performanceWeight: newConfig.strategy.performanceWeight,
        accuracyWeight: newConfig.strategy.accuracyWeight,
        powerWeight: newConfig.strategy.powerWeight
      });
    }
    
    if (newConfig.privacy) {
      this.privacyManager.updateConfig(newConfig.privacy);
    }
  }

  /**
   * 重置生态系统
   */
  public reset(): void {
    this.cacheManager.clear();
    this.strategyManager.resetMetrics();
    this.privacyManager.destroy();
    this.performanceMonitor.reset();
    this.errorTracker.reset();
    this.usageAnalytics.reset();
    
    // 重新初始化
    this.initializeComponents();
  }

  /**
   * 销毁生态系统
   */
  public destroy(): void {
    this.cacheManager.destroy();
    this.privacyManager.destroy();
    this.performanceMonitor.destroy();
    this.errorTracker.destroy();
    this.usageAnalytics.destroy();
    
    this.isInitialized = false;
  }
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private enabled: boolean;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
    cacheHits: number;
    cacheMisses: number;
  };

  constructor(enabled: boolean) {
    this.enabled = enabled;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  recordRequest(responseTime: number, success: boolean): void {
    if (!this.enabled) return;
    
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
  }

  recordCacheHit(): void {
    if (!this.enabled) return;
    this.metrics.cacheHits++;
  }

  recordCacheMiss(): void {
    if (!this.enabled) return;
    this.metrics.cacheMisses++;
  }

  getMetrics() {
    const avgResponseTime = this.metrics.totalRequests > 0 
      ? this.metrics.totalResponseTime / this.metrics.totalRequests 
      : 0;
    
    return {
      ...this.metrics,
      averageResponseTime: avgResponseTime,
      successRate: this.metrics.totalRequests > 0 
        ? this.metrics.successfulRequests / this.metrics.totalRequests 
        : 0,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 
        ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) 
        : 0
    };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  destroy(): void {
    // 清理资源
  }
}

/**
 * 错误跟踪器
 */
class ErrorTracker {
  private enabled: boolean;
  private errors: Array<{
    timestamp: number;
    error: Error;
    context?: string;
  }>;

  constructor(enabled: boolean) {
    this.enabled = enabled;
    this.errors = [];
  }

  trackLocationError(error: Error, context?: string): void {
    if (!this.enabled) return;
    
    this.errors.push({
      timestamp: Date.now(),
      error,
      context
    });
    
    // 限制错误记录数量
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500);
    }
  }

  trackPrivacyError(type: string, error?: string): void {
    if (!this.enabled) return;
    
    this.errors.push({
      timestamp: Date.now(),
      error: new Error(`Privacy Error: ${type} - ${error || 'Unknown error'}`),
      context: 'privacy'
    });
  }

  getErrorReport() {
    const recentErrors = this.errors.filter(e => 
      Date.now() - e.timestamp < 24 * 60 * 60 * 1000 // 最近24小时
    );
    
    return {
      totalErrors: this.errors.length,
      recentErrorsCount: recentErrors.length,
      errorsByType: this.groupErrorsByType(),
      recentErrors: recentErrors.map(e => ({
        timestamp: e.timestamp,
        message: e.error.message,
        stack: e.error.stack,
        context: e.context
      }))
    };
  }

  private groupErrorsByType() {
    const groups: Record<string, number> = {};
    
    this.errors.forEach(e => {
      const type = e.error.name || 'Unknown';
      groups[type] = (groups[type] || 0) + 1;
    });
    
    return groups;
  }

  reset(): void {
    this.errors = [];
  }

  destroy(): void {
    this.errors = [];
  }
}

/**
 * 使用分析器
 */
class UsageAnalytics {
  private enabled: boolean;
  private analytics: {
    locationRequests: Array<{
      timestamp: number;
      strategy: string;
      responseTime: number;
      success: boolean;
    }>;
    cacheUsage: Array<{
      timestamp: number;
      type: 'hit' | 'miss';
    }>;
  };

  constructor(enabled: boolean) {
    this.enabled = enabled;
    this.analytics = {
      locationRequests: [],
      cacheUsage: []
    };
  }

  recordLocationRequest(strategy: string, responseTime: number, success: boolean): void {
    if (!this.enabled) return;
    
    this.analytics.locationRequests.push({
      timestamp: Date.now(),
      strategy,
      responseTime,
      success
    });
    
    // 限制记录数量
    if (this.analytics.locationRequests.length > 10000) {
      this.analytics.locationRequests = this.analytics.locationRequests.slice(-5000);
    }
  }

  recordCacheUsage(type: 'hit' | 'miss'): void {
    if (!this.enabled) return;
    
    this.analytics.cacheUsage.push({
      timestamp: Date.now(),
      type
    });
    
    // 限制记录数量
    if (this.analytics.cacheUsage.length > 5000) {
      this.analytics.cacheUsage = this.analytics.cacheUsage.slice(-2500);
    }
  }

  getAnalytics() {
    const recentRequests = this.analytics.locationRequests.filter(r => 
      Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000 // 最近7天
    );
    
    const recentCacheUsage = this.analytics.cacheUsage.filter(c => 
      Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    
    return {
      locationRequests: {
        total: recentRequests.length,
        byStrategy: this.groupByStrategy(recentRequests),
        successRate: recentRequests.filter(r => r.success).length / Math.max(1, recentRequests.length),
        averageResponseTime: this.calculateAverageResponseTime(recentRequests)
      },
      cacheUsage: {
        total: recentCacheUsage.length,
        hitRate: recentCacheUsage.filter(c => c.type === 'hit').length / Math.max(1, recentCacheUsage.length)
      }
    };
  }

  private groupByStrategy(requests: Array<{
    timestamp: number;
    strategy: string;
    responseTime: number;
    success: boolean;
  }>) {
    const groups: Record<string, { count: number; successRate: number; avgResponseTime: number }> = {};
    
    requests.forEach(r => {
      if (!groups[r.strategy]) {
        groups[r.strategy] = { count: 0, successRate: 0, avgResponseTime: 0 };
      }
      
      const group = groups[r.strategy];
      group.count++;
      
      // 简化的成功率和平均响应时间计算
      const requests = this.analytics.locationRequests.filter(req => req.strategy === r.strategy);
      group.successRate = requests.filter(req => req.success).length / requests.length;
      group.avgResponseTime = requests.reduce((sum, req) => sum + req.responseTime, 0) / requests.length;
    });
    
    return groups;
  }

  private calculateAverageResponseTime(requests: Array<{
    timestamp: number;
    strategy: string;
    responseTime: number;
    success: boolean;
  }>): number {
    if (requests.length === 0) return 0;
    return requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length;
  }

  reset(): void {
    this.analytics = {
      locationRequests: [],
      cacheUsage: []
    };
  }

  destroy(): void {
    this.analytics = {
      locationRequests: [],
      cacheUsage: []
    };
  }
}

/**
 * 生态系统单例
 */
let ecosystemInstance: LocationEcosystem | null = null;

/**
 * 获取位置服务生态系统实例
 */
export const getLocationEcosystem = (config?: EcosystemConfig): LocationEcosystem => {
  if (!ecosystemInstance) {
    ecosystemInstance = new LocationEcosystem(config);
  }
  return ecosystemInstance;
};

/**
 * 重置位置服务生态系统实例
 */
export const resetLocationEcosystem = (): void => {
  if (ecosystemInstance) {
    ecosystemInstance.destroy();
    ecosystemInstance = null;
  }
};

export default LocationEcosystem;