/**
 * MapView 地图组件
 * 提供地图显示、标记、覆盖层等功能的完整地图视图组件
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View, Map, CoverView, CoverImage } from '@tarojs/components';
import { LocationData } from '@/services/location/types';
import { useLocation } from '@/hooks/useLocation';
import { formatDistance, formatCoordinate } from '@/utils/location/format';
import styles from './MapView.module.scss';

/**
 * 地图标记接口
 */
export interface MapMarker {
  /** 标记ID */
  id: string | number;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 标记标题 */
  title?: string;
  /** 标记描述 */
  description?: string;
  /** 自定义图标 */
  iconPath?: string;
  /** 图标宽度 */
  width?: number;
  /** 图标高度 */
  height?: number;
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否显示气泡 */
  callout?: {
    content: string;
    color?: string;
    fontSize?: number;
    borderRadius?: number;
    bgColor?: string;
    padding?: number;
    display?: 'BYCLICK' | 'ALWAYS';
    textAlign?: 'left' | 'center' | 'right';
  };
  /** 标签 */
  label?: {
    content: string;
    color?: string;
    fontSize?: number;
    x?: number;
    y?: number;
    anchorX?: number;
    anchorY?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    bgColor?: string;
    padding?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
  /** 锚点 */
  anchor?: {
    x: number;
    y: number;
  };
  /** 自定义数据 */
  customData?: any;
}

/**
 * 地图覆盖层接口
 */
export interface MapOverlay {
  /** 覆盖层ID */
  id: string | number;
  /** 覆盖层类型 */
  type: 'circle' | 'polygon' | 'polyline' | 'rectangle';
  /** 样式配置 */
  styles: {
    color?: string;
    fillColor?: string;
    width?: number;
    dottedLine?: boolean;
    borderColor?: string;
    borderWidth?: number;
  };
  /** 坐标点 */
  points: Array<{
    latitude: number;
    longitude: number;
  }>;
  /** 圆心（圆形覆盖层） */
  center?: {
    latitude: number;
    longitude: number;
  };
  /** 半径（圆形覆盖层，单位：米） */
  radius?: number;
}

/**
 * 地图控件接口
 */
export interface MapControl {
  /** 控件ID */
  id: number;
  /** 控件位置 */
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  /** 控件图标 */
  iconPath: string;
  /** 是否可点击 */
  clickable: boolean;
}

/**
 * MapView组件属性
 */
export interface MapViewProps {
  /** 地图类型 */
  mapType?: 'standard' | 'satellite' | 'traffic';
  /** 是否显示用户位置 */
  showUserLocation?: boolean;
  /** 用户位置图标 */
  userLocationIcon?: string;
  /** 标记点数据 */
  markers?: MapMarker[];
  /** 覆盖层数据 */
  overlays?: MapOverlay[];
  /** 控件数据 */
  controls?: MapControl[];
  /** 中心坐标 */
  center?: {
    latitude: number;
    longitude: number;
  };
  /** 缩放级别 */
  zoom?: number;
  /** 旋转角度 */
  rotate?: number;
  /** 倾斜角度 */
  skew?: number;
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** 是否启用滚动 */
  enableScroll?: boolean;
  /** 是否启用旋转 */
  enableRotate?: boolean;
  /** 是否显示比例尺 */
  showScale?: boolean;
  /** 是否显示指南针 */
  showCompass?: boolean;
  /** 是否显示定位按钮 */
  enableLocation?: boolean;
  /** 是否启用3D地图 */
  enable3D?: boolean;
  /** 是否显示路况 */
  showTraffic?: boolean;
  /** 最大缩放级别 */
  maxZoom?: number;
  /** 最小缩放级别 */
  minZoom?: number;
  /** 自定义样式 */
  customStyle?: any;
  /** 自定义样式ID */
  styleId?: string;
  /** 图层ID */
  layerStyle?: number;
  /** 是否开启俯视视角 */
  enableOverlooking?: boolean;
  /** 是否开启建筑动画 */
  enableBuilding?: boolean;
  /** 是否开启POI点 */
  enablePoi?: boolean;
  /** 是否开启道路名称 */
  enableRoad?: boolean;
  /** 地图宽度 */
  width?: string | number;
  /** 地图高度 */
  height?: string | number;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 标记点击事件 */
  onMarkerTap?: (marker: MapMarker) => void;
  /** 标记气泡点击事件 */
  onCalloutTap?: (marker: MapMarker) => void;
  /** 标记标签点击事件 */
  onLabelTap?: (marker: MapMarker) => void;
  /** 控件点击事件 */
  onControlTap?: (control: MapControl) => void;
  /** 地图区域变化事件 */
  onRegionChange?: (region: any) => void;
  /** 地图点击事件 */
  onTap?: (event: any) => void;
  /** 地图更新事件 */
  onUpdated?: () => void;
  /** 定位失败事件 */
  onLocationError?: (error: any) => void;
  /** 定位成功事件 */
  onLocationSuccess?: (location: LocationData) => void;
  /** 地图加载完成事件 */
  onLoad?: () => void;
}

/**
 * 地图视图默认配置
 */
const DEFAULT_MAP_CONFIG = {
  mapType: 'standard' as const,
  zoom: 16,
  enableZoom: true,
  enableScroll: true,
  enableRotate: false,
  showScale: true,
  showCompass: false,
  enableLocation: true,
  enable3D: false,
  showTraffic: false,
  maxZoom: 20,
  minZoom: 3,
  enablePoi: true,
  enableRoad: true,
  width: '100%',
  height: '400px'
};

/**
 * MapView 地图组件
 * 提供完整的地图显示和交互功能
 */
export const MapView: React.FC<MapViewProps> = React.memo(({
  mapType = DEFAULT_MAP_CONFIG.mapType,
  showUserLocation = true,
  userLocationIcon,
  markers = [],
  overlays = [],
  controls = [],
  center,
  zoom = DEFAULT_MAP_CONFIG.zoom,
  rotate = 0,
  skew = 0,
  enableZoom = DEFAULT_MAP_CONFIG.enableZoom,
  enableScroll = DEFAULT_MAP_CONFIG.enableScroll,
  enableRotate = DEFAULT_MAP_CONFIG.enableRotate,
  showScale = DEFAULT_MAP_CONFIG.showScale,
  showCompass = DEFAULT_MAP_CONFIG.showCompass,
  enableLocation = DEFAULT_MAP_CONFIG.enableLocation,
  enable3D = DEFAULT_MAP_CONFIG.enable3D,
  showTraffic = DEFAULT_MAP_CONFIG.showTraffic,
  maxZoom = DEFAULT_MAP_CONFIG.maxZoom,
  minZoom = DEFAULT_MAP_CONFIG.minZoom,
  customStyle,
  styleId,
  layerStyle,
  enableOverlooking,
  enableBuilding,
  enablePoi = DEFAULT_MAP_CONFIG.enablePoi,
  enableRoad = DEFAULT_MAP_CONFIG.enableRoad,
  width = DEFAULT_MAP_CONFIG.width,
  height = DEFAULT_MAP_CONFIG.height,
  className,
  style,
  onMarkerTap,
  onCalloutTap,
  onLabelTap,
  onControlTap,
  onRegionChange,
  onTap,
  onUpdated,
  onLocationError,
  onLocationSuccess,
  onLoad
}) => {
  const mapRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);
  
  // 使用位置Hook获取当前位置
  const { 
    location, 
    loading, 
    error, 
    getCurrentLocation,
    refreshLocation 
  } = useLocation();

  /**
   * 初始化地图中心位置
   */
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    } else if (showUserLocation && location) {
      setMapCenter({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  }, [center, location, showUserLocation]);

  /**
   * 监听位置变化
   */
  useEffect(() => {
    if (location && showUserLocation) {
      setCurrentLocation(location);
      if (onLocationSuccess) {
        onLocationSuccess(location);
      }
      
      // 如果没有设置中心点，自动以用户位置为中心
      if (!center) {
        setMapCenter({
          latitude: location.latitude,
          longitude: location.longitude
        });
      }
    }
  }, [location, center, showUserLocation, onLocationSuccess]);

  /**
   * 处理位置错误
   */
  useEffect(() => {
    if (error && onLocationError) {
      onLocationError(error);
    }
  }, [error, onLocationError]);

  /**
   * 处理标记点击事件
   */
  const handleMarkerTap = useCallback((event: any) => {
    const { markerId } = event.detail;
    const marker = markers.find(m => m.id === markerId);
    if (marker && onMarkerTap) {
      onMarkerTap(marker);
    }
  }, [markers, onMarkerTap]);

  /**
   * 处理气泡点击事件
   */
  const handleCalloutTap = useCallback((event: any) => {
    const { markerId } = event.detail;
    const marker = markers.find(m => m.id === markerId);
    if (marker && onCalloutTap) {
      onCalloutTap(marker);
    }
  }, [markers, onCalloutTap]);

  /**
   * 处理标签点击事件
   */
  const handleLabelTap = useCallback((event: any) => {
    const { markerId } = event.detail;
    const marker = markers.find(m => m.id === markerId);
    if (marker && onLabelTap) {
      onLabelTap(marker);
    }
  }, [markers, onLabelTap]);

  /**
   * 处理控件点击事件
   */
  const handleControlTap = useCallback((event: any) => {
    const { controlId } = event.detail;
    const control = controls.find(c => c.id === controlId);
    if (control && onControlTap) {
      onControlTap(control);
    }
  }, [controls, onControlTap]);

  /**
   * 处理地图区域变化
   */
  const handleRegionChange = useCallback((event: any) => {
    if (onRegionChange) {
      onRegionChange(event.detail);
    }
  }, [onRegionChange]);

  /**
   * 处理地图点击
   */
  const handleTap = useCallback((event: any) => {
    if (onTap) {
      onTap(event.detail);
    }
  }, [onTap]);

  /**
   * 处理地图加载完成
   */
  const handleLoad = useCallback(() => {
    setIsMapLoaded(true);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  /**
   * 处理定位按钮点击
   */
  const handleLocationClick = useCallback(async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('定位失败:', error);
    }
  }, [getCurrentLocation]);

  /**
   * 用户位置标记
   */
  const userLocationMarker = useMemo(() => {
    if (!showUserLocation || !currentLocation) {
      return [];
    }

    return [{
      id: 'user-location',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      title: '我的位置',
      description: currentLocation.address,
      iconPath: userLocationIcon || '/assets/icons/location-user.png',
      width: 32,
      height: 32,
      clickable: true,
      callout: {
        content: `我的位置\n${currentLocation.address}`,
        display: 'BYCLICK',
        bgColor: '#ffffff',
        color: '#333333',
        fontSize: 14,
        borderRadius: 8,
        padding: 10
      }
    }];
  }, [showUserLocation, currentLocation, userLocationIcon]);

  /**
   * 合并所有标记
   */
  const allMarkers = useMemo(() => {
    return [...userLocationMarker, ...markers];
  }, [userLocationMarker, markers]);

  /**
   * 生成地图控件
   */
  const mapControls = useMemo(() => {
    const defaultControls: MapControl[] = [];

    // 添加定位控件
    if (enableLocation) {
      defaultControls.push({
        id: 1,
        position: {
          left: 10,
          top: 10,
          width: 40,
          height: 40
        },
        iconPath: '/assets/icons/location-control.png',
        clickable: true
      });
    }

    return [...defaultControls, ...controls];
  }, [enableLocation, controls]);

  // 处理控件点击
  useEffect(() => {
    const handleControlClick = (event: any) => {
      const { controlId } = event.detail;
      if (controlId === 1) {
        handleLocationClick();
      }
    };

    Taro.eventCenter.on('MapControlTap', handleControlClick);
    return () => {
      Taro.eventCenter.off('MapControlTap', handleControlClick);
    };
  }, [handleLocationClick]);

  if (!mapCenter) {
    return (
      <View className={`${styles.mapContainer} ${styles.loadingContainer} ${className || ''}`}>
        <View className={styles.loadingContent}>
          <View className={styles.loadingSpinner} />
          <View className={styles.loadingText}>
            {loading ? '正在获取位置信息...' : '地图加载中...'}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`${styles.mapContainer} ${className || ''}`} style={style}>
      <Map
        ref={mapRef}
        className={styles.map}
        style={{ width, height }}
        latitude={mapCenter.latitude}
        longitude={mapCenter.longitude}
        scale={zoom}
        minScale={minZoom}
        maxScale={maxZoom}
        markers={allMarkers}
        covers={overlays}
        controls={mapControls}
        polyline={overlays.filter(o => o.type === 'polyline').map(o => ({
          points: o.points,
          color: o.styles.color,
          width: o.styles.width,
          dottedLine: o.styles.dottedLine
        }))}
        circles={overlays.filter(o => o.type === 'circle').map(o => ({
          latitude: o.center!.latitude,
          longitude: o.center!.longitude,
          radius: o.radius!,
          fillColor: o.styles.fillColor,
          color: o.styles.color,
          strokeWidth: o.styles.borderWidth
        }))}
        polygons={overlays.filter(o => o.type === 'polygon').map(o => ({
          points: o.points,
          fillColor: o.styles.fillColor,
          strokeColor: o.styles.borderColor,
          strokeWidth: o.styles.borderWidth
        }))}
        includePoints={allMarkers.map(m => ({
          latitude: m.latitude,
          longitude: m.longitude
        }))}
        enableZoom={enableZoom}
        enableScroll={enableScroll}
        enableRotate={enableRotate}
        showScale={showScale}
        showCompass={showCompass}
        enable3D={enable3D}
        enableOverlooking={enableOverlooking}
        enableBuilding={enableBuilding}
        enablePoi={enablePoi}
        enableRoad={enableRoad}
        showLocation={showUserLocation}
        layerStyle={layerStyle}
        rotate={rotate}
        skew={skew}
        setting={{
          skew: 0,
          rotate: 0,
          showLocation: showUserLocation,
          showScale: showScale,
          showCompass: showCompass,
          showRoad: enableRoad,
          showTraffic: showTraffic,
          showPoi: enablePoi
        }}
        onMarkerTap={handleMarkerTap}
        onCalloutTap={handleCalloutTap}
        onLabelTap={handleLabelTap}
        onControlTap={handleControlTap}
        onRegionChange={handleRegionChange}
        onTap={handleTap}
        onUpdated={onUpdated}
        onLoad={handleLoad}
      />
      
      {/* 加载遮罩 */}
      {!isMapLoaded && (
        <CoverView className={styles.mapOverlay}>
          <CoverView className={styles.loadingOverlay}>
            <CoverView className={styles.loadingSpinner} />
            <CoverView className={styles.loadingText}>地图加载中...</CoverView>
          </CoverView>
        </CoverView>
      )}
      
      {/* 位置信息面板 */}
      {showUserLocation && currentLocation && (
        <CoverView className={styles.locationPanel}>
          <CoverView className={styles.locationInfo}>
            <CoverView className={styles.locationAddress}>
              {currentLocation.address}
            </CoverView>
            <CoverView className={styles.locationCoords}>
              {formatCoordinate(currentLocation.latitude, currentLocation.longitude)}
              {currentLocation.accuracy && (
                <CoverView className={styles.locationAccuracy}>
                  精度: ±{currentLocation.accuracy}米
                </CoverView>
              )}
            </CoverView>
          </CoverView>
        </CoverView>
      )}
    </View>
  );
});

MapView.displayName = 'MapView';

export default MapView;