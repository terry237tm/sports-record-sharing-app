/**
 * 位置策略优化系统
 * 提供性能监控、自适应策略选择、错误恢复等高级策略功能
 */

import { 
  LocationData, 
  LocationStrategy, 
  LocationError,
  LocationErrorType,
  LocationServiceOptions 
} from './types';
import { LocationService } from './LocationService';
import { getCacheManager, AdvancedLocationCache } from './locationCache';
import { PERFORMANCE_THRESHOLDS, STRATEGY_CONFIG } from './constants';

/**
 * 策略性能指标
 */
export interface StrategyMetrics {
  /** 策略名称 */
  strategyName: string;
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 成功率 */
  successRate: number;
  /** 使用次数 */
  usageCount: number;
  /** 错误次数 */
  errorCount: number;
  /** 最后使用时间 */
  lastUsed: number;
  /** 平均精度 */
  averageAccuracy: number;
  /** 能耗评分 */
  powerEfficiency: number;
}

/**
 * 性能监控数据
 */
export interface PerformanceMetrics {
  /** 总请求数 */
  totalRequests: number;
  /** 成功请求数 */
  successfulRequests: number;
  /** 失败请求数 */
  failedRequests: number;
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 最小响应时间 */
  minResponseTime: number;
  /** 最大响应时间 */
  maxResponseTime: number;
  /** 响应时间分布 */
  responseTimeDistribution: {
    [key: string]: number;
  };
  /** 成功率趋势 */
  successRateTrend: Array<{
    timestamp: number;
    successRate: number;
  }>;
  /** 错误类型统计 */
  errorTypeStats: {
    [key in LocationErrorType]?: number;
  };
}

/**
 * 策略选择配置
 */
export interface StrategySelectionConfig {
  /** 是否启用自适应选择 */
  enableAdaptiveSelection: boolean;
  /** 性能权重 */
  performanceWeight: number;
  /** 精度权重 */
  accuracyWeight: number;
  /** 能耗权重 */
  powerWeight: number;
  /** 成功率阈值 */
  successRateThreshold: number;
  /** 响应时间阈值 */
  responseTimeThreshold: number;
}

/**
 * 错误恢复配置
 */
export interface ErrorRecoveryConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟 */
  retryDelay: number;
  /** 退避策略 */
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  /** 降级策略 */
  fallbackStrategy: 'cache' | 'low_power' | 'mock';
  /** 错误阈值 */
  errorThreshold: number;
}

/**
 * 优化位置策略
 */
export class OptimizedLocationStrategy implements LocationStrategy {
  private locationService: LocationService;
  private cacheManager: AdvancedLocationCache;
  private strategyMetrics: Map<string, StrategyMetrics>;
  private performanceMetrics: PerformanceMetrics;
  private selectionConfig: StrategySelectionConfig;
  private recoveryConfig: ErrorRecoveryConfig;
  private retryAttempts: Map<string, number>;
  private performanceHistory: Array<{
    timestamp: number;
    strategy: string;
    responseTime: number;
    success: boolean;
    accuracy?: number;
  }>;

  constructor(options: LocationServiceOptions = {}) {
    this.locationService = new LocationService(options);
    this.cacheManager = getCacheManager();
    this.strategyMetrics = new Map();
    this.retryAttempts = new Map();
    this.performanceHistory = [];

    // 初始化配置
    this.selectionConfig = {
      enableAdaptiveSelection: true,
      performanceWeight: 0.4,
      accuracyWeight: 0.3,
      powerWeight: 0.3,
      successRateThreshold: 0.8,
      responseTimeThreshold: 3000
    };

    this.recoveryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffStrategy: 'exponential',
      fallbackStrategy: 'cache',
      errorThreshold: 5
    };

    // 初始化性能指标
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimeDistribution: {},
      successRateTrend: [],
      errorTypeStats: {}
    };

    this.initializeMetrics();
  }

  /**
   * 初始化策略指标
   */
  private initializeMetrics(): void {
    const strategies = ['highAccuracy', 'balanced', 'lowPower', 'cacheFirst'];
    
    strategies.forEach(strategy => {
      this.strategyMetrics.set(strategy, {
        strategyName: strategy,
        averageResponseTime: 0,
        successRate: 1,
        usageCount: 0,
        errorCount: 0,
        lastUsed: 0,
        averageAccuracy: 0,
        powerEfficiency: this.getPowerEfficiency(strategy)
      });
    });
  }

  /**
   * 获取功耗效率评分
   */
  private getPowerEfficiency(strategy: string): number {
    switch (strategy) {
      case 'highAccuracy': return 0.3;
      case 'balanced': return 0.6;
      case 'lowPower': return 0.9;
      case 'cacheFirst': return 1.0;
      default: return 0.5;
    }
  }

  /**
   * 高精度定位（GPS + WiFi + 基站）
   */
  async highAccuracy(): Promise<LocationData> {
    return this.executeStrategy('highAccuracy', async () => {
      return this.locationService.highAccuracy();
    });
  }

  /**
   * 平衡模式（WiFi + 基站）
   */
  async balanced(): Promise<LocationData> {
    return this.executeStrategy('balanced', async () => {
      return this.locationService.balanced();
    });
  }

  /**
   * 低功耗模式（仅基站）
   */
  async lowPower(): Promise<LocationData> {
    return this.executeStrategy('lowPower', async () => {
      return this.locationService.lowPower();
    });
  }

  /**
   * 缓存优先模式
   */
  async cacheFirst(): Promise<LocationData> {
    return this.executeStrategy('cacheFirst', async () => {
      return this.locationService.cacheFirst();
    });
  }

  /**
   * 智能策略选择
   */
  async smartLocation(): Promise<LocationData> {
    const selectedStrategy = this.selectOptimalStrategy();
    
    switch (selectedStrategy) {
      case 'highAccuracy':
        return this.highAccuracy();
      case 'balanced':
        return this.balanced();
      case 'lowPower':
        return this.lowPower();
      case 'cacheFirst':
      default:
        return this.cacheFirst();
    }
  }

  /**
   * 执行策略并监控性能
   */
  private async executeStrategy(
    strategyName: string, 
    strategyFn: () => Promise<LocationData>
  ): Promise<LocationData> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.performanceMetrics.totalRequests++;

    try {
      // 记录重试次数
      const retryCount = this.retryAttempts.get(requestId) || 0;
      
      // 执行策略
      const result = await this.executeWithRetry(strategyFn, retryCount);
      
      const responseTime = Date.now() - startTime;
      
      // 更新成功指标
      this.updateStrategyMetrics(strategyName, {
        success: true,
        responseTime,
        accuracy: result.accuracy
      });

      // 更新性能指标
      this.updatePerformanceMetrics(responseTime, true);

      // 缓存结果
      const cacheKey = this.generateCacheKey(result);
      this.cacheManager.set(cacheKey, result);

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // 更新失败指标
      this.updateStrategyMetrics(strategyName, {
        success: false,
        responseTime,
        error: error as LocationError
      });

      // 更新性能指标
      this.updatePerformanceMetrics(responseTime, false, error as LocationError);

      // 尝试错误恢复
      return this.handleError(error as LocationError, strategyName, requestId);
    } finally {
      // 清理重试记录
      this.retryAttempts.delete(requestId);
    }
  }

  /**
   * 带重试的执行
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>, 
    currentRetry: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (currentRetry < this.recoveryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(currentRetry);
        await this.delay(delay);
        
        return this.executeWithRetry(fn, currentRetry + 1);
      }
      throw error;
    }
  }

  /**
   * 计算重试延迟
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = this.recoveryConfig.retryDelay;
    
    switch (this.recoveryConfig.backoffStrategy) {
      case 'exponential':
        return baseDelay * Math.pow(2, retryCount);
      case 'linear':
        return baseDelay * (retryCount + 1);
      case 'fixed':
      default:
        return baseDelay;
    }
  }

  /**
   * 错误处理
   */
  private async handleError(
    error: LocationError, 
    strategyName: string, 
    requestId: string
  ): Promise<LocationData> {
    const retryCount = this.retryAttempts.get(requestId) || 0;

    // 尝试降级策略
    switch (this.recoveryConfig.fallbackStrategy) {
      case 'cache':
        const cachedLocation = this.tryCacheFallback();
        if (cachedLocation) {
          return cachedLocation;
        }
        break;
        
      case 'low_power':
        if (strategyName !== 'lowPower' && retryCount < this.recoveryConfig.maxRetries) {
          this.retryAttempts.set(requestId, retryCount + 1);
          return this.lowPower();
        }
        break;
        
      case 'mock':
        return this.getMockLocation();
    }

    // 如果所有恢复策略都失败，抛出原始错误
    throw error;
  }

  /**
   * 缓存降级
   */
  private tryCacheFallback(): LocationData | null {
    try {
      // 获取最新的缓存位置
      const cacheKeys = this.cacheManager.getAllKeys();
      if (cacheKeys.length > 0) {
        const latestKey = cacheKeys[cacheKeys.length - 1];
        const cachedItem = this.cacheManager.get(latestKey);
        
        if (cachedItem && !this.isStaleData(cachedItem)) {
          return cachedItem.location;
        }
      }
    } catch (error) {
      console.warn('缓存降级失败:', error);
    }
    
    return null;
  }

  /**
   * 检查数据是否过期
   */
  private isStaleData(cachedItem: any): boolean {
    const maxAge = 5 * 60 * 1000; // 5分钟
    return (Date.now() - cachedItem.timestamp) > maxAge;
  }

  /**
   * 获取模拟位置
   */
  private getMockLocation(): LocationData {
    return {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区建国门外大街1号',
      city: '北京市',
      district: '朝阳区',
      province: '北京市',
      accuracy: 100,
      timestamp: Date.now()
    };
  }

  /**
   * 选择最优策略
   */
  private selectOptimalStrategy(): string {
    if (!this.selectionConfig.enableAdaptiveSelection) {
      return 'cacheFirst';
    }

    const strategies = Array.from(this.strategyMetrics.entries());
    let bestStrategy = 'cacheFirst';
    let bestScore = 0;

    for (const [strategyName, metrics] of strategies) {
      const score = this.calculateStrategyScore(metrics);
      
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategyName;
      }
    }

    return bestStrategy;
  }

  /**
   * 计算策略评分
   */
  private calculateStrategyScore(metrics: StrategyMetrics): number {
    const { performanceWeight, accuracyWeight, powerWeight } = this.selectionConfig;
    
    // 性能评分（基于响应时间和成功率）
    const performanceScore = this.calculatePerformanceScore(metrics);
    
    // 精度评分
    const accuracyScore = this.calculateAccuracyScore(metrics);
    
    // 能耗评分
    const powerScore = metrics.powerEfficiency;

    return (performanceScore * performanceWeight) +
           (accuracyScore * accuracyWeight) +
           (powerScore * powerWeight);
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(metrics: StrategyMetrics): number {
    const responseTimeScore = Math.max(0, 1 - (metrics.averageResponseTime / this.selectionConfig.responseTimeThreshold));
    const successRateScore = metrics.successRate;
    
    return (responseTimeScore * 0.6) + (successRateScore * 0.4);
  }

  /**
   * 计算精度评分
   */
  private calculateAccuracyScore(metrics: StrategyMetrics): number {
    if (metrics.averageAccuracy <= 0) return 1;
    
    // 精度越高，评分越高（精度越低越好）
    return Math.max(0, 1 - (metrics.averageAccuracy / 1000));
  }

  /**
   * 更新策略指标
   */
  private updateStrategyMetrics(
    strategyName: string, 
    result: {
      success: boolean;
      responseTime: number;
      accuracy?: number;
      error?: LocationError;
    }
  ): void {
    const metrics = this.strategyMetrics.get(strategyName);
    if (!metrics) return;

    metrics.usageCount++;
    metrics.lastUsed = Date.now();

    if (result.success) {
      // 更新响应时间
      if (metrics.averageResponseTime === 0) {
        metrics.averageResponseTime = result.responseTime;
      } else {
        metrics.averageResponseTime = (metrics.averageResponseTime + result.responseTime) / 2;
      }

      // 更新精度
      if (result.accuracy !== undefined) {
        if (metrics.averageAccuracy === 0) {
          metrics.averageAccuracy = result.accuracy;
        } else {
          metrics.averageAccuracy = (metrics.averageAccuracy + result.accuracy) / 2;
        }
      }
    } else {
      metrics.errorCount++;
    }

    // 更新成功率
    metrics.successRate = (metrics.usageCount - metrics.errorCount) / metrics.usageCount;

    // 记录性能历史
    this.performanceHistory.push({
      timestamp: Date.now(),
      strategy: strategyName,
      responseTime: result.responseTime,
      success: result.success,
      accuracy: result.accuracy
    });

    // 限制历史记录大小
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-500);
    }
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(
    responseTime: number, 
    success: boolean, 
    error?: LocationError
  ): void {
    if (success) {
      this.performanceMetrics.successfulRequests++;
      
      // 更新响应时间统计
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime + responseTime) / 2;
      
      this.performanceMetrics.minResponseTime = Math.min(
        this.performanceMetrics.minResponseTime, 
        responseTime
      );
      
      this.performanceMetrics.maxResponseTime = Math.max(
        this.performanceMetrics.maxResponseTime, 
        responseTime
      );

      // 更新响应时间分布
      const bucket = this.getResponseTimeBucket(responseTime);
      this.performanceMetrics.responseTimeDistribution[bucket] = 
        (this.performanceMetrics.responseTimeDistribution[bucket] || 0) + 1;
    } else {
      this.performanceMetrics.failedRequests++;
      
      // 更新错误类型统计
      if (error) {
        this.performanceMetrics.errorTypeStats[error.type] = 
          (this.performanceMetrics.errorTypeStats[error.type] || 0) + 1;
      }
    }

    // 更新成功率趋势
    const currentSuccessRate = this.getCurrentSuccessRate();
    this.performanceMetrics.successRateTrend.push({
      timestamp: Date.now(),
      successRate: currentSuccessRate
    });

    // 限制趋势数据大小
    if (this.performanceMetrics.successRateTrend.length > 100) {
      this.performanceMetrics.successRateTrend = 
        this.performanceMetrics.successRateTrend.slice(-50);
    }
  }

  /**
   * 获取响应时间分组
   */
  private getResponseTimeBucket(responseTime: number): string {
    if (responseTime < 500) return '<500ms';
    if (responseTime < 1000) return '500ms-1s';
    if (responseTime < 2000) return '1s-2s';
    if (responseTime < 5000) return '2s-5s';
    return '>5s';
  }

  /**
   * 获取当前成功率
   */
  private getCurrentSuccessRate(): number {
    const total = this.performanceMetrics.totalRequests;
    if (total === 0) return 1;
    return this.performanceMetrics.successfulRequests / total;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(location: LocationData): string {
    return `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取策略指标
   */
  public getStrategyMetrics(): Map<string, StrategyMetrics> {
    return new Map(this.strategyMetrics);
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 获取策略选择配置
   */
  public getSelectionConfig(): StrategySelectionConfig {
    return { ...this.selectionConfig };
  }

  /**
   * 更新策略选择配置
   */
  public updateSelectionConfig(config: Partial<StrategySelectionConfig>): void {
    this.selectionConfig = { ...this.selectionConfig, ...config };
  }

  /**
   * 获取错误恢复配置
   */
  public getRecoveryConfig(): ErrorRecoveryConfig {
    return { ...this.recoveryConfig };
  }

  /**
   * 更新错误恢复配置
   */
  public updateRecoveryConfig(config: Partial<ErrorRecoveryConfig>): void {
    this.recoveryConfig = { ...this.recoveryConfig, ...config };
  }

  /**
   * 获取性能历史
   */
  public getPerformanceHistory(): Array<{
    timestamp: number;
    strategy: string;
    responseTime: number;
    success: boolean;
    accuracy?: number;
  }> {
    return [...this.performanceHistory];
  }

  /**
   * 重置统计信息
   */
  public resetMetrics(): void {
    this.initializeMetrics();
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimeDistribution: {},
      successRateTrend: [],
      errorTypeStats: {}
    };
    this.performanceHistory = [];
  }
}

/**
 * 优化策略单例
 */
let optimizedStrategyInstance: OptimizedLocationStrategy | null = null;

/**
 * 获取优化策略实例
 */
export const getOptimizedLocationStrategy = (options?: LocationServiceOptions): OptimizedLocationStrategy => {
  if (!optimizedStrategyInstance) {
    optimizedStrategyInstance = new OptimizedLocationStrategy(options);
  }
  return optimizedStrategyInstance;
};

/**
 * 重置优化策略实例
 */
export const resetOptimizedLocationStrategy = (): void => {
  optimizedStrategyInstance = null;
};

export default OptimizedLocationStrategy;