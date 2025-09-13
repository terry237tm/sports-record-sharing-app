/**
 * 高级位置缓存系统
 * 提供TTL、大小限制、持久化存储等高级缓存功能
 */

import { LocationData, LocationCacheItem } from './types';
import { CACHE_CONFIG, STORAGE_KEYS, ADVANCED_CACHE_CONFIG } from './constants';
import Taro from '@tarojs/taro';

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 缓存最大容量 */
  maxSize: number;
  /** 缓存超时时间（毫秒） */
  ttl: number;
  /** 是否启用持久化存储 */
  enablePersistence: boolean;
  /** 持久化存储键前缀 */
  storageKey: string;
  /** 清理间隔（毫秒） */
  cleanupInterval: number;
  /** 是否启用LRU策略 */
  enableLRU: boolean;
  /** 缓存预热策略 */
  preheatStrategy?: 'location' | 'time' | 'usage';
  /** 压缩阈值 */
  compressionThreshold: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存命中率 */
  hitRate: number;
  /** 缓存未命中率 */
  missRate: number;
  /** 总请求数 */
  totalRequests: number;
  /** 命中次数 */
  hitCount: number;
  /** 未命中次数 */
  missCount: number;
  /** 当前缓存大小 */
  currentSize: number;
  /** 最大缓存大小 */
  maxSize: number;
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 缓存清理次数 */
  cleanupCount: number;
  /** 持久化存储大小 */
  storageSize: number;
}

/**
 * 缓存事件类型
 */
export enum CacheEventType {
  HIT = 'hit',
  MISS = 'miss',
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear',
  CLEANUP = 'cleanup',
  PERSIST = 'persist',
  LOAD = 'load'
}

/**
 * 缓存事件
 */
export interface CacheEvent {
  type: CacheEventType;
  key?: string;
  data?: any;
  timestamp: number;
  duration?: number;
}

/**
 * 缓存事件监听器
 */
export type CacheEventListener = (event: CacheEvent) => void;

/**
 * 高级位置缓存管理器
 */
export class AdvancedLocationCache {
  private cache: Map<string, LocationCacheItem>;
  private accessOrder: string[];
  private config: CacheConfig;
  private stats: CacheStats;
  private eventListeners: Map<string, CacheEventListener[]>;
  private cleanupTimer: NodeJS.Timeout | null;
  private persistenceTimer: NodeJS.Timeout | null;
  private startTime: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: ADVANCED_CACHE_CONFIG.MAX_CACHE_SIZE,
      ttl: ADVANCED_CACHE_CONFIG.DEFAULT_TTL,
      enablePersistence: true,
      storageKey: STORAGE_KEYS.LOCATION_CACHE,
      cleanupInterval: ADVANCED_CACHE_CONFIG.CLEANUP_INTERVAL,
      enableLRU: ADVANCED_CACHE_CONFIG.ENABLE_LRU,
      compressionThreshold: ADVANCED_CACHE_CONFIG.COMPRESSION_THRESHOLD,
      ...config
    };

    this.cache = new Map();
    this.accessOrder = [];
    this.eventListeners = new Map();
    this.cleanupTimer = null;
    this.persistenceTimer = null;
    this.startTime = Date.now();

    // 初始化统计信息
    this.stats = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      hitCount: 0,
      missCount: 0,
      currentSize: 0,
      maxSize: this.config.maxSize,
      averageResponseTime: 0,
      cleanupCount: 0,
      storageSize: 0
    };

    this.initialize();
  }

  /**
   * 初始化缓存系统
   */
  private async initialize(): Promise<void> {
    try {
      // 从持久化存储加载缓存
      if (this.config.enablePersistence) {
        await this.loadFromStorage();
      }

      // 启动定时清理
      this.startCleanupTimer();

      // 启动持久化定时器
      if (this.config.enablePersistence) {
        this.startPersistenceTimer();
      }

      this.emitEvent({ type: CacheEventType.LOAD, timestamp: Date.now() });
    } catch (error) {
      console.error('缓存初始化失败:', error);
    }
  }

  /**
   * 获取缓存项
   */
  public get(key: string): LocationCacheItem | null {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.missCount++;
        this.updateStats();
        this.emitEvent({ 
          type: CacheEventType.MISS, 
          key, 
          timestamp: Date.now(),
          duration: Date.now() - startTime
        });
        return null;
      }

      // 检查是否过期
      if (this.isExpired(item)) {
        this.delete(key);
        this.stats.missCount++;
        this.updateStats();
        this.emitEvent({ 
          type: CacheEventType.MISS, 
          key, 
          timestamp: Date.now(),
          duration: Date.now() - startTime
        });
        return null;
      }

      // 更新访问顺序（LRU）
      if (this.config.enableLRU) {
        this.updateAccessOrder(key);
      }

      this.stats.hitCount++;
      this.updateStats();
      this.emitEvent({ 
        type: CacheEventType.HIT, 
        key, 
        data: item, 
        timestamp: Date.now(),
        duration: Date.now() - startTime
      });

      return item;
    } catch (error) {
      console.error('缓存获取失败:', error);
      this.stats.missCount++;
      this.updateStats();
      return null;
    }
  }

  /**
   * 设置缓存项
   */
  public set(key: string, location: LocationData): void {
    try {
      const cacheItem: LocationCacheItem = {
        location,
        timestamp: Date.now(),
        accuracy: location.accuracy || 0
      };

      // 检查缓存大小限制
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }

      this.cache.set(key, cacheItem);
      
      // 更新访问顺序
      if (this.config.enableLRU) {
        this.updateAccessOrder(key);
      }

      this.stats.currentSize = this.cache.size;
      this.emitEvent({ 
        type: CacheEventType.SET, 
        key, 
        data: cacheItem, 
        timestamp: Date.now() 
      });

      // 立即持久化（可选）
      if (this.config.enablePersistence) {
        this.persistToStorage();
      }
    } catch (error) {
      console.error('缓存设置失败:', error);
    }
  }

  /**
   * 删除缓存项
   */
  public delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      
      if (deleted) {
        // 从访问顺序中移除
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
        
        this.stats.currentSize = this.cache.size;
        this.emitEvent({ 
          type: CacheEventType.DELETE, 
          key, 
          timestamp: Date.now() 
        });
      }

      return deleted;
    } catch (error) {
      console.error('缓存删除失败:', error);
      return false;
    }
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    try {
      this.cache.clear();
      this.accessOrder = [];
      this.stats.currentSize = 0;
      this.emitEvent({ 
        type: CacheEventType.CLEAR, 
        timestamp: Date.now() 
      });

      // 清空持久化存储
      if (this.config.enablePersistence) {
        this.clearStorage();
      }
    } catch (error) {
      console.error('缓存清空失败:', error);
    }
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: LocationCacheItem): boolean {
    const now = Date.now();
    return (now - item.timestamp) > this.config.ttl;
  }

  /**
   * 清理过期缓存
   */
  public cleanup(): number {
    try {
      let cleanedCount = 0;
      const now = Date.now();

      // 创建数组副本以避免在迭代时修改 Map
      const entries = Array.from(this.cache.entries());
      for (const [key, item] of entries) {
        if (this.isExpired(item)) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      // 更新访问顺序
      this.accessOrder = this.accessOrder.filter(key => this.cache.has(key));
      this.stats.currentSize = this.cache.size;
      this.stats.cleanupCount++;

      this.emitEvent({ 
        type: CacheEventType.CLEANUP, 
        timestamp: now, 
        data: { cleanedCount } 
      });

      return cleanedCount;
    } catch (error) {
      console.error('缓存清理失败:', error);
      return 0;
    }
  }

  /**
   * 驱逐最旧的缓存项（LRU）
   */
  private evictOldest(): void {
    if (this.accessOrder.length === 0) return;

    const oldestKey = this.accessOrder[0];
    this.delete(oldestKey);
  }

  /**
   * 更新访问顺序（LRU）
   */
  private updateAccessOrder(key: string): void {
    // 从当前位置移除
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    
    // 添加到末尾（最新）
    this.accessOrder.push(key);
  }

  /**
   * 获取缓存统计信息
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    
    if (total > 0) {
      this.stats.hitRate = (this.stats.hitCount / total) * 100;
      this.stats.missRate = (this.stats.missCount / total) * 100;
    }

    // 计算平均响应时间
    if (this.stats.totalRequests > 0) {
      const totalTime = Date.now() - this.startTime;
      this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
    }
  }

  /**
   * 持久化到存储
   */
  private async persistToStorage(): Promise<void> {
    try {
      if (!this.config.enablePersistence) return;

      const data = {
        cache: Array.from(this.cache.entries()),
        accessOrder: this.accessOrder,
        stats: this.stats,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(data);
      
      // 压缩大数据
      let finalData = serialized;
      if (serialized.length > this.config.compressionThreshold) {
        finalData = await this.compressData(serialized);
      }

      // 存储到本地存储
      Taro.setStorageSync(this.config.storageKey, finalData);
      this.stats.storageSize = finalData.length;

      this.emitEvent({ 
        type: CacheEventType.PERSIST, 
        timestamp: Date.now(), 
        data: { size: finalData.length } 
      });
    } catch (error) {
      console.error('缓存持久化失败:', error);
    }
  }

  /**
   * 从存储加载
   */
  private async loadFromStorage(): Promise<void> {
    try {
      if (!this.config.enablePersistence) return;

      const stored = Taro.getStorageSync(this.config.storageKey);
      if (!stored) return;

      let data: any;
      
      // 解压缩数据
      if (typeof stored === 'string' && stored.startsWith('compressed:')) {
        data = JSON.parse(await this.decompressData(stored));
      } else {
        data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      }

      if (data && data.cache && Array.isArray(data.cache)) {
        // 恢复缓存
        this.cache = new Map(data.cache);
        this.accessOrder = data.accessOrder || [];
        
        // 恢复统计信息
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }

        // 清理过期项
        this.cleanup();

        this.stats.storageSize = stored.length;
      }
    } catch (error) {
      console.error('缓存加载失败:', error);
    }
  }

  /**
   * 清空存储
   */
  private clearStorage(): void {
    try {
      if (!this.config.enablePersistence) return;
      Taro.removeStorageSync(this.config.storageKey);
      this.stats.storageSize = 0;
    } catch (error) {
      console.error('存储清空失败:', error);
    }
  }

  /**
   * 压缩数据
   */
  private async compressData(data: string): Promise<string> {
    // 简单的压缩实现，实际项目中可以使用更高效的压缩算法
    return 'compressed:' + data; // 这里应该使用实际的压缩算法
  }

  /**
   * 解压缩数据
   */
  private async decompressData(data: string): Promise<string> {
    // 简单的解压缩实现
    return data.replace('compressed:', ''); // 这里应该使用实际的解压缩算法
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 启动持久化定时器
   */
  private startPersistenceTimer(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }

    this.persistenceTimer = setInterval(() => {
      this.persistToStorage();
    }, this.config.cleanupInterval * 2); // 持久化频率是清理的一半
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(eventType: CacheEventType, listener: CacheEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(eventType: CacheEventType, listener: CacheEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: CacheEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('事件监听器错误:', error);
      }
    });
  }

  /**
   * 缓存预热
   */
  public async preheat(locations: LocationData[]): Promise<void> {
    try {
      for (const location of locations) {
        const key = this.generateCacheKey(location);
        this.set(key, location);
      }
    } catch (error) {
      console.error('缓存预热失败:', error);
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(location: LocationData): string {
    const precision = 4; // 小数点后4位精度
    const lat = location.latitude.toFixed(precision);
    const lng = location.longitude.toFixed(precision);
    return `${lat},${lng}`;
  }

  /**
   * 批量获取缓存项
   */
  public getMultiple(keys: string[]): Array<LocationCacheItem | null> {
    return keys.map(key => this.get(key));
  }

  /**
   * 批量设置缓存项
   */
  public setMultiple(items: Array<{ key: string; location: LocationData }>): void {
    for (const item of items) {
      this.set(item.key, item.location);
    }
  }

  /**
   * 获取所有缓存键
   */
  public getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有缓存值
   */
  public getAllValues(): LocationCacheItem[] {
    return Array.from(this.cache.values());
  }

  /**
   * 销毁缓存
   */
  public destroy(): void {
    try {
      // 停止定时器
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }

      if (this.persistenceTimer) {
        clearInterval(this.persistenceTimer);
        this.persistenceTimer = null;
      }

      // 清空缓存
      this.clear();

      // 清空事件监听器
      this.eventListeners.clear();
    } catch (error) {
      console.error('缓存销毁失败:', error);
    }
  }

  /**
   * 获取缓存配置
   */
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 更新缓存配置
   */
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 重启定时器
    this.startCleanupTimer();
    if (this.config.enablePersistence) {
      this.startPersistenceTimer();
    }
  }
}

/**
 * 缓存管理器单例
 */
let cacheManagerInstance: AdvancedLocationCache | null = null;

/**
 * 获取缓存管理器实例
 */
export const getCacheManager = (config?: Partial<CacheConfig>): AdvancedLocationCache => {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new AdvancedLocationCache(config);
  }
  return cacheManagerInstance;
};

/**
 * 重置缓存管理器实例
 */
export const resetCacheManager = (): void => {
  if (cacheManagerInstance) {
    cacheManagerInstance.destroy();
    cacheManagerInstance = null;
  }
};

export default AdvancedLocationCache;