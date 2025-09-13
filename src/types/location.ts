/**
 * 位置相关类型定义
 * 定义位置组件使用的类型和接口
 */

import { LocationData, LocationPermissionStatus } from '../services/location/types';

/**
 * 位置显示组件属性
 */
export interface LocationDisplayProps {
  /** 位置数据 */
  location: LocationData | null;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 错误信息 */
  error?: string | null;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示精度信息 */
  showAccuracy?: boolean;
  /** 是否显示时间戳 */
  showTimestamp?: boolean;
  /** 地址格式化选项 */
  addressFormat?: 'full' | 'short' | 'city';
  /** 点击事件处理函数 */
  onClick?: () => void;
  /** 刷新按钮点击事件 */
  onRefresh?: () => void;
}

/**
 * 位置权限组件属性
 */
export interface LocationPermissionProps {
  /** 当前权限状态 */
  status?: LocationPermissionStatus;
  /** 是否正在检查权限 */
  isChecking?: boolean;
  /** 是否正在请求权限 */
  isRequesting?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 权限请求按钮文本 */
  requestButtonText?: string;
  /** 权限引导标题 */
  guideTitle?: string;
  /** 权限引导内容 */
  guideContent?: string;
  /** 是否显示系统设置引导 */
  showSettingsGuide?: boolean;
  /** 权限请求处理函数 */
  onRequestPermission?: () => void;
  /** 权限状态变化回调 */
  onStatusChange?: (status: LocationPermissionStatus) => void;
  /** 打开设置页面处理函数 */
  onOpenSettings?: () => void;
}

/**
 * 位置权限状态配置
 */
export interface PermissionStatusConfig {
  /** 状态文本 */
  text: string;
  /** 状态图标 */
  icon: string;
  /** 状态颜色 */
  color: 'success' | 'warning' | 'error' | 'info';
  /** 是否显示请求按钮 */
  showRequestButton: boolean;
  /** 是否显示设置引导 */
  showSettingsGuide: boolean;
}

/**
 * 地址格式化结果
 */
export interface FormattedAddress {
  /** 完整地址 */
  full: string;
  /** 简短地址 */
  short: string;
  /** 城市信息 */
  city: string;
  /** 区县信息 */
  district: string;
  /** 省份信息 */
  province: string;
  /** 兴趣点 */
  poi?: string;
}

/**
 * 位置精度配置
 */
export interface AccuracyConfig {
  /** 精度范围（米） */
  range: string;
  /** 精度等级 */
  level: 'high' | 'medium' | 'low';
  /** 精度颜色 */
  color: 'success' | 'warning' | 'error';
  /** 精度描述 */
  description: string;
}

/**
 * 位置组件主题配置
 */
export interface LocationTheme {
  /** 主色调 */
  primaryColor: string;
  /** 背景色 */
  backgroundColor: string;
  /** 文字颜色 */
  textColor: string;
  /** 边框颜色 */
  borderColor: string;
  /** 成功颜色 */
  successColor: string;
  /** 警告颜色 */
  warningColor: string;
  /** 错误颜色 */
  errorColor: string;
  /** 信息颜色 */
  infoColor: string;
}

/**
 * 位置组件国际化配置
 */
export interface LocationLocale {
  /** 位置信息标题 */
  locationTitle: string;
  /** 未知位置文本 */
  unknownLocation: string;
  /** 获取位置中 */
  gettingLocation: string;
  /** 位置获取失败 */
  locationFailed: string;
  /** 精度标签 */
  accuracyLabel: string;
  /** 时间标签 */
  timeLabel: string;
  /** 刷新按钮文本 */
  refreshButton: string;
  /** 权限状态文本 */
  permissionStatus: {
    granted: string;
    denied: string;
    notDetermined: string;
    restricted: string;
  };
  /** 权限请求文本 */
  permissionRequest: {
    title: string;
    message: string;
    button: string;
    guideTitle: string;
    guideMessage: string;
    settingsButton: string;
    cancelButton: string;
  };
}

/**
 * 位置组件默认配置
 */
export interface LocationConfig {
  /** 主题配置 */
  theme: LocationTheme;
  /** 国际化配置 */
  locale: LocationLocale;
  /** 地址格式化配置 */
  addressFormat: {
    /** 默认格式 */
    default: 'full' | 'short' | 'city';
    /** 是否显示精度 */
    showAccuracy: boolean;
    /** 是否显示时间戳 */
    showTimestamp: boolean;
    /** 时间格式 */
    timeFormat: string;
  };
  /** 权限配置 */
  permission: {
    /** 自动请求权限 */
    autoRequest: boolean;
    /** 显示权限引导 */
    showGuide: boolean;
    /** 请求超时时间（毫秒） */
    requestTimeout: number;
  };
}