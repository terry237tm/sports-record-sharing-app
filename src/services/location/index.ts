/**
 * 位置服务统一导出文件
 * 所有位置相关服务的入口文件
 */

// 核心服务
export { LocationService, getLocationService, resetLocationService } from './LocationService';
export type { LocationService as LocationServiceClass } from './LocationService';

// 类型定义
export * from './types';

// 常量配置
export * from './constants';

// 高级缓存系统
export { AdvancedLocationCache, getCacheManager, resetCacheManager } from './locationCache';
export type { CacheConfig, CacheStats, CacheEvent, CacheEventListener } from './locationCache';

// 策略优化系统
export { OptimizedLocationStrategy, getOptimizedLocationStrategy, resetOptimizedLocationStrategy } from './locationStrategy';
export type { StrategyMetrics, PerformanceMetrics, StrategySelectionConfig, ErrorRecoveryConfig } from './locationStrategy';

// 隐私保护系统
export { LocationPrivacyManager, getPrivacyManager, resetPrivacyManager } from './privacyProtection';
export type { PrivacyConfig, AccessAuditLog, MaskingRule, EncryptedLocationData } from './privacyProtection';

// 生态系统集成
export { LocationEcosystem, getLocationEcosystem, resetLocationEcosystem } from './LocationEcosystem';
export type { EcosystemConfig, EcosystemStatus } from './LocationEcosystem';