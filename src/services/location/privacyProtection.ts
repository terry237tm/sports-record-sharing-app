/**
 * 位置隐私保护系统
 * 提供位置数据加密、脱敏、访问控制等隐私保护功能
 */

import { LocationData } from './types';
import * as CryptoJS from 'crypto-js';

/**
 * 隐私配置接口
 */
export interface PrivacyConfig {
  /** 是否启用数据加密 */
  enableEncryption: boolean;
  /** 加密密钥 */
  encryptionKey: string;
  /** 是否启用数据脱敏 */
  enableMasking: boolean;
  /** 脱敏精度（米） */
  maskingAccuracy: number;
  /** 是否启用访问审计 */
  enableAudit: boolean;
  /** 数据保留时间（毫秒） */
  dataRetentionTime: number;
  /** 是否启用匿名化 */
  enableAnonymization: boolean;
  /** 是否启用位置模糊化 */
  enableLocationFuzzing: boolean;
  /** 模糊化半径（米） */
  fuzzingRadius: number;
  /** 是否启用访问控制 */
  enableAccessControl: boolean;
  /** 访问权限级别 */
  accessLevel: 'strict' | 'moderate' | 'relaxed';
}

/**
 * 访问审计日志
 */
export interface AccessAuditLog {
  /** 访问ID */
  id: string;
  /** 访问时间 */
  timestamp: number;
  /** 访问类型 */
  accessType: 'read' | 'write' | 'delete' | 'share';
  /** 访问者信息 */
  accessor: {
    userId?: string;
    deviceId?: string;
    appVersion?: string;
    ip?: string;
  };
  /** 位置数据ID */
  locationId?: string;
  /** 操作结果 */
  result: 'success' | 'failure';
  /** 错误信息 */
  error?: string;
  /** 访问时长 */
  duration?: number;
  /** 额外信息 */
  metadata?: any;
}

/**
 * 数据脱敏规则
 */
export interface MaskingRule {
  /** 规则名称 */
  name: string;
  /** 脱敏类型 */
  type: 'coordinate' | 'address' | 'poi' | 'all';
  /** 精度级别 */
  precision: 'city' | 'district' | 'street' | 'precise';
  /** 是否启用 */
  enabled: boolean;
  /** 应用条件 */
  conditions?: {
    accuracyThreshold?: number;
    timeThreshold?: number;
    userConsent?: boolean;
  };
}

/**
 * 加密后的位置数据
 */
export interface EncryptedLocationData {
  /** 加密数据 */
  encryptedData: string;
  /** 初始化向量 */
  iv: string;
  /** 加密算法 */
  algorithm: string;
  /** 时间戳 */
  timestamp: number;
  /** 数据哈希 */
  hash: string;
}

/**
 * 隐私保护事件类型
 */
export enum PrivacyEventType {
  ENCRYPTION = 'encryption',
  DECRYPTION = 'decryption',
  MASKING = 'masking',
  ACCESS_CONTROL = 'access_control',
  AUDIT_LOG = 'audit_log',
  DATA_EXPIRATION = 'data_expiration',
  CONSENT_UPDATE = 'consent_update'
}

/**
 * 隐私保护事件
 */
export interface PrivacyEvent {
  type: PrivacyEventType;
  timestamp: number;
  data?: any;
  result?: 'success' | 'failure';
  error?: string;
}

/**
 * 隐私事件监听器
 */
export type PrivacyEventListener = (event: PrivacyEvent) => void;

/**
 * 位置隐私保护管理器
 */
export class LocationPrivacyManager {
  private config: PrivacyConfig;
  private auditLogs: AccessAuditLog[];
  private maskingRules: MaskingRule[];
  private eventListeners: Map<string, PrivacyEventListener[]>;
  private consentManager: ConsentManager;
  private dataRetentionTimer: NodeJS.Timeout | null;
  private accessControlManager: AccessControlManager;

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = {
      enableEncryption: true,
      encryptionKey: this.generateEncryptionKey(),
      enableMasking: true,
      maskingAccuracy: 100,
      enableAudit: true,
      dataRetentionTime: 7 * 24 * 60 * 60 * 1000, // 7天
      enableAnonymization: true,
      enableLocationFuzzing: true,
      fuzzingRadius: 50,
      enableAccessControl: true,
      accessLevel: 'moderate',
      ...config
    };

    this.auditLogs = [];
    this.maskingRules = [];
    this.eventListeners = new Map();
    this.dataRetentionTimer = null;

    this.consentManager = new ConsentManager();
    this.accessControlManager = new AccessControlManager(this.config.accessLevel);

    this.initializeMaskingRules();
    this.startDataRetentionTimer();
  }

  /**
   * 初始化脱敏规则
   */
  private initializeMaskingRules(): void {
    this.maskingRules = [
      {
        name: 'coordinate_masking',
        type: 'coordinate',
        precision: 'district',
        enabled: true,
        conditions: {
          accuracyThreshold: 1000,
          userConsent: false
        }
      },
      {
        name: 'address_masking',
        type: 'address',
        precision: 'city',
        enabled: true,
        conditions: {
          userConsent: false
        }
      },
      {
        name: 'poi_masking',
        type: 'poi',
        precision: 'district',
        enabled: true,
        conditions: {
          userConsent: false
        }
      }
    ];
  }

  /**
   * 生成加密密钥
   */
  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * 加密位置数据
   */
  public encryptLocation(location: LocationData): EncryptedLocationData {
    try {
      if (!this.config.enableEncryption) {
        throw new Error('加密功能已禁用');
      }

      const dataString = JSON.stringify(location);
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      const encrypted = CryptoJS.AES.encrypt(dataString, this.config.encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const hash = CryptoJS.SHA256(dataString).toString();

      const result: EncryptedLocationData = {
        encryptedData: encrypted.toString(),
        iv: iv.toString(),
        algorithm: 'AES-256-CBC',
        timestamp: Date.now(),
        hash: hash
      };

      this.emitEvent({
        type: PrivacyEventType.ENCRYPTION,
        timestamp: Date.now(),
        result: 'success'
      });

      return result;
    } catch (error) {
      this.emitEvent({
        type: PrivacyEventType.ENCRYPTION,
        timestamp: Date.now(),
        result: 'failure',
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  /**
   * 解密位置数据
   */
  public decryptLocation(encryptedData: EncryptedLocationData): LocationData {
    try {
      if (!this.config.enableEncryption) {
        throw new Error('加密功能已禁用');
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, this.config.encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const dataString = decrypted.toString(CryptoJS.enc.Utf8);
      const location: LocationData = JSON.parse(dataString);

      // 验证数据完整性
      const currentHash = CryptoJS.SHA256(dataString).toString();
      if (currentHash !== encryptedData.hash) {
        throw new Error('数据完整性验证失败');
      }

      this.emitEvent({
        type: PrivacyEventType.DECRYPTION,
        timestamp: Date.now(),
        result: 'success'
      });

      return location;
    } catch (error) {
      this.emitEvent({
        type: PrivacyEventType.DECRYPTION,
        timestamp: Date.now(),
        result: 'failure',
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  /**
   * 脱敏位置数据
   */
  public maskLocation(location: LocationData, ruleName?: string): LocationData {
    try {
      if (!this.config.enableMasking) {
        return location;
      }

      let maskedLocation = { ...location };
      const applicableRules = this.getApplicableRules(location, ruleName);

      for (const rule of applicableRules) {
        maskedLocation = this.applyMaskingRule(maskedLocation, rule);
      }

      // 应用位置模糊化
      if (this.config.enableLocationFuzzing) {
        maskedLocation = this.applyLocationFuzzing(maskedLocation);
      }

      this.emitEvent({
        type: PrivacyEventType.MASKING,
        timestamp: Date.now(),
        result: 'success',
        data: { ruleName, originalLocation: location, maskedLocation }
      });

      return maskedLocation;
    } catch (error) {
      this.emitEvent({
        type: PrivacyEventType.MASKING,
        timestamp: Date.now(),
        result: 'failure',
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  /**
   * 获取适用的脱敏规则
   */
  private getApplicableRules(location: LocationData, ruleName?: string): MaskingRule[] {
    const rules = this.maskingRules.filter(rule => rule.enabled);
    
    if (ruleName) {
      return rules.filter(rule => rule.name === ruleName);
    }

    return rules.filter(rule => {
      if (!rule.conditions) return true;

      // 检查精度阈值
      if (rule.conditions.accuracyThreshold && location.accuracy) {
        if (location.accuracy > rule.conditions.accuracyThreshold) {
          return false;
        }
      }

      // 检查用户同意
      if (rule.conditions.userConsent !== undefined) {
        const hasConsent = this.consentManager.hasConsent('location_sharing');
        if (rule.conditions.userConsent !== hasConsent) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 应用脱敏规则
   */
  private applyMaskingRule(location: LocationData, rule: MaskingRule): LocationData {
    const maskedLocation = { ...location };

    switch (rule.type) {
      case 'coordinate':
        return this.maskCoordinates(maskedLocation, rule.precision);
      
      case 'address':
        return this.maskAddress(maskedLocation, rule.precision);
      
      case 'poi':
        return this.maskPOI(maskedLocation, rule.precision);
      
      case 'all':
        let result = this.maskCoordinates(maskedLocation, rule.precision);
        result = this.maskAddress(result, rule.precision);
        result = this.maskPOI(result, rule.precision);
        return result;
      
      default:
        return maskedLocation;
    }
  }

  /**
   * 坐标脱敏
   */
  private maskCoordinates(location: LocationData, precision: string): LocationData {
    const maskedLocation = { ...location };

    switch (precision) {
      case 'city':
        // 保留城市级别精度（约10km）
        maskedLocation.latitude = Math.round(location.latitude * 10) / 10;
        maskedLocation.longitude = Math.round(location.longitude * 10) / 10;
        break;
      
      case 'district':
        // 保留区县级别精度（约1km）
        maskedLocation.latitude = Math.round(location.latitude * 100) / 100;
        maskedLocation.longitude = Math.round(location.longitude * 100) / 100;
        break;
      
      case 'street':
        // 保留街道级别精度（约100m）
        maskedLocation.latitude = Math.round(location.latitude * 1000) / 1000;
        maskedLocation.longitude = Math.round(location.longitude * 1000) / 1000;
        break;
      
      case 'precise':
      default:
        // 保持原始精度
        break;
    }

    return maskedLocation;
  }

  /**
   * 地址脱敏
   */
  private maskAddress(location: LocationData, precision: string): LocationData {
    const maskedLocation = { ...location };

    switch (precision) {
      case 'city':
        // 只保留城市信息
        maskedLocation.address = maskedLocation.city || maskedLocation.address;
        maskedLocation.district = undefined;
        break;
      
      case 'district':
        // 保留到区县级别
        if (maskedLocation.district) {
          maskedLocation.address = `${maskedLocation.city}${maskedLocation.district}`;
        }
        break;
      
      case 'street':
      case 'precise':
      default:
        // 保持原始地址
        break;
    }

    return maskedLocation;
  }

  /**
   * POI脱敏
   */
  private maskPOI(location: LocationData, precision: string): LocationData {
    const maskedLocation = { ...location };

    switch (precision) {
      case 'city':
      case 'district':
        // 移除POI信息
        maskedLocation.poi = undefined;
        break;
      
      case 'street':
      case 'precise':
      default:
        // 保持原始POI
        break;
    }

    return maskedLocation;
  }

  /**
   * 位置模糊化
   */
  private applyLocationFuzzing(location: LocationData): LocationData {
    if (!this.config.enableLocationFuzzing) {
      return location;
    }

    const maskedLocation = { ...location };
    const radius = this.config.fuzzingRadius;
    
    // 在指定半径内随机偏移
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    // 计算偏移量（简化计算，实际应考虑地球曲率）
    const latOffset = (distance * Math.cos(angle)) / 111000; // 1度纬度约111km
    const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(location.latitude * Math.PI / 180));
    
    maskedLocation.latitude += latOffset;
    maskedLocation.longitude += lngOffset;
    
    return maskedLocation;
  }

  /**
   * 匿名化位置数据
   */
  public anonymizeLocation(location: LocationData): LocationData {
    if (!this.config.enableAnonymization) {
      return location;
    }

    const anonymizedLocation = { ...location };
    
    // 移除个人识别信息
    delete anonymizedLocation.timestamp;
    
    // 应用脱敏
    return this.maskLocation(anonymizedLocation);
  }

  /**
   * 检查访问权限
   */
  public checkAccess(accessor: any, locationData?: LocationData): boolean {
    if (!this.config.enableAccessControl) {
      return true;
    }

    try {
      const hasAccess = this.accessControlManager.checkAccess(accessor, locationData);
      
      this.emitEvent({
        type: PrivacyEventType.ACCESS_CONTROL,
        timestamp: Date.now(),
        result: hasAccess ? 'success' : 'failure',
        data: { accessor, locationData }
      });

      return hasAccess;
    } catch (error) {
      this.emitEvent({
        type: PrivacyEventType.ACCESS_CONTROL,
        timestamp: Date.now(),
        result: 'failure',
        error: error instanceof Error ? error.message : '未知错误'
      });
      return false;
    }
  }

  /**
   * 记录访问审计
   */
  public logAccess(accessLog: Omit<AccessAuditLog, 'id' | 'timestamp'>): void {
    if (!this.config.enableAudit) {
      return;
    }

    try {
      const log: AccessAuditLog = {
        ...accessLog,
        id: this.generateAuditId(),
        timestamp: Date.now()
      };

      this.auditLogs.push(log);

      // 限制审计日志大小
      if (this.auditLogs.length > 10000) {
        this.auditLogs = this.auditLogs.slice(-5000);
      }

      this.emitEvent({
        type: PrivacyEventType.AUDIT_LOG,
        timestamp: Date.now(),
        result: 'success',
        data: log
      });
    } catch (error) {
      this.emitEvent({
        type: PrivacyEventType.AUDIT_LOG,
        timestamp: Date.now(),
        result: 'failure',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 生成审计ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理过期数据
   */
  private cleanupExpiredData(): void {
    const now = Date.now();
    const expirationTime = this.config.dataRetentionTime;

    // 清理过期的审计日志
    this.auditLogs = this.auditLogs.filter(log => 
      (now - log.timestamp) <= expirationTime
    );

    this.emitEvent({
      type: PrivacyEventType.DATA_EXPIRATION,
      timestamp: now,
      result: 'success',
      data: { cleanedLogs: this.auditLogs.length }
    });
  }

  /**
   * 启动数据保留定时器
   */
  private startDataRetentionTimer(): void {
    if (this.dataRetentionTimer) {
      clearInterval(this.dataRetentionTimer);
    }

    // 每天清理一次过期数据
    this.dataRetentionTimer = setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(eventType: PrivacyEventType, listener: PrivacyEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(eventType: PrivacyEventType, listener: PrivacyEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: PrivacyEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('隐私事件监听器错误:', error);
      }
    });
  }

  /**
   * 获取审计日志
   */
  public getAuditLogs(filter?: {
    startTime?: number;
    endTime?: number;
    accessType?: string;
    result?: 'success' | 'failure';
    userId?: string;
  }): AccessAuditLog[] {
    let logs = [...this.auditLogs];

    if (filter) {
      if (filter.startTime) {
        logs = logs.filter(log => log.timestamp >= filter.startTime!);
      }
      
      if (filter.endTime) {
        logs = logs.filter(log => log.timestamp <= filter.endTime!);
      }
      
      if (filter.accessType) {
        logs = logs.filter(log => log.accessType === filter.accessType);
      }
      
      if (filter.result) {
        logs = logs.filter(log => log.result === filter.result);
      }
      
      if (filter.userId) {
        logs = logs.filter(log => log.accessor.userId === filter.userId);
      }
    }

    return logs;
  }

  /**
   * 获取隐私配置
   */
  public getConfig(): PrivacyConfig {
    return { ...this.config };
  }

  /**
   * 更新隐私配置
   */
  public updateConfig(newConfig: Partial<PrivacyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新访问控制管理器
    this.accessControlManager.updateAccessLevel(this.config.accessLevel);
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    if (this.dataRetentionTimer) {
      clearInterval(this.dataRetentionTimer);
      this.dataRetentionTimer = null;
    }
    
    this.eventListeners.clear();
    this.auditLogs = [];
  }
}

/**
 * 用户同意管理器
 */
class ConsentManager {
  private consents: Map<string, boolean>;

  constructor() {
    this.consents = new Map();
  }

  /**
   * 设置用户同意
   */
  public setConsent(type: string, granted: boolean): void {
    this.consents.set(type, granted);
  }

  /**
   * 检查用户同意
   */
  public hasConsent(type: string): boolean {
    return this.consents.get(type) || false;
  }

  /**
   * 获取所有同意状态
   */
  public getAllConsents(): Record<string, boolean> {
    return Object.fromEntries(this.consents);
  }
}

/**
 * 访问控制管理器
 */
class AccessControlManager {
  private accessLevel: string;

  constructor(accessLevel: string) {
    this.accessLevel = accessLevel;
  }

  /**
   * 检查访问权限
   */
  public checkAccess(accessor: any, locationData?: LocationData): boolean {
    switch (this.accessLevel) {
      case 'strict':
        return this.checkStrictAccess(accessor, locationData);
      
      case 'moderate':
        return this.checkModerateAccess(accessor, locationData);
      
      case 'relaxed':
        return this.checkRelaxedAccess(accessor, locationData);
      
      default:
        return false;
    }
  }

  /**
   * 严格访问控制
   */
  private checkStrictAccess(accessor: any, locationData?: LocationData): boolean {
    // 需要完整的用户认证和授权
    return accessor.userId && accessor.authenticated === true;
  }

  /**
   * 中等访问控制
   */
  private checkModerateAccess(accessor: any, locationData?: LocationData): boolean {
    // 需要基本的用户标识
    return accessor.userId || accessor.deviceId;
  }

  /**
   * 宽松访问控制
   */
  private checkRelaxedAccess(accessor: any, locationData?: LocationData): boolean {
    // 基本检查，允许匿名访问
    return true;
  }

  /**
   * 更新访问级别
   */
  public updateAccessLevel(accessLevel: string): void {
    this.accessLevel = accessLevel;
  }
}

/**
 * 隐私管理器单例
 */
let privacyManagerInstance: LocationPrivacyManager | null = null;

/**
 * 获取隐私管理器实例
 */
export const getPrivacyManager = (config?: Partial<PrivacyConfig>): LocationPrivacyManager => {
  if (!privacyManagerInstance) {
    privacyManagerInstance = new LocationPrivacyManager(config);
  }
  return privacyManagerInstance;
};

/**
 * 重置隐私管理器实例
 */
export const resetPrivacyManager = (): void => {
  if (privacyManagerInstance) {
    privacyManagerInstance.destroy();
    privacyManagerInstance = null;
  }
};

export default LocationPrivacyManager;