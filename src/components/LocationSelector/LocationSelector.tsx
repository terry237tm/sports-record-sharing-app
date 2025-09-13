/**
 * LocationSelector 位置选择器组件
 * 提供交互式地图选点功能，支持拖拽、坐标显示、位置确认
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Button, Map, CoverView, CoverImage } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { LocationData } from '@/services/location/types'
import { useLocationService } from '@/hooks/useLocationService'
import { showToast, showLoading, hideLoading } from '@/utils/ui'
import { validateCoordinates } from '@/utils/location'
import styles from './LocationSelector.module.scss'

export interface LocationSelectorProps {
  /** 当前位置数据 */
  value?: LocationData | null
  /** 位置变化回调 */
  onChange: (location: LocationData | null) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 地图缩放级别 */
  zoom?: number
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  className = '',
  style,
  showSearch = true,
  draggable = true,
  zoom = 16,
  confirmText = '确认选择',
  cancelText = '重新选择'
}) => {
  const [mapCenter, setMapCenter] = useState({
    latitude: value?.latitude || 39.9042, // 北京天安门默认位置
    longitude: value?.longitude || 116.4074
  })
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  
  const locationService = useLocationService()
  const mapRef = useRef<any>(null)

  // 初始化地图位置
  useEffect(() => {
    if (value && validateCoordinates(value.latitude, value.longitude)) {
      setMapCenter({
        latitude: value.latitude,
        longitude: value.longitude
      })
      setSelectedLocation(value)
    } else {
      // 获取当前位置作为默认位置
      getCurrentLocation()
    }
  }, [])

  /**
   * 获取当前位置
   */
  const getCurrentLocation = useCallback(async () => {
    try {
      showLoading({ title: '正在获取位置...' })
      
      const location = await locationService.getCurrentLocation()
      
      setMapCenter({
        latitude: location.latitude,
        longitude: location.longitude
      })
      setSelectedLocation(location)
      
      showToast({
        title: '位置获取成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('获取位置失败:', error)
      showToast({
        title: '获取位置失败，使用默认位置',
        icon: 'none'
      })
    } finally {
      hideLoading()
    }
  }, [locationService])

  /**
   * 地图加载完成
   */
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])

  /**
   * 地图区域变化处理
   */
  const handleRegionChange = useCallback((event: any) => {
    const { type, detail } = event
    const { latitude, longitude } = detail
    
    if (type === 'end' && draggable) {
      setIsDragging(false)
      setMapCenter({
        latitude,
        longitude
      })
      
      // 逆地址解析获取详细地址
      const updateLocation = async () => {
        try {
          setAddressLoading(true)
          const locationData = await locationService.reverseGeocoding(
            latitude,
            longitude
          )
          
          setSelectedLocation(locationData)
        } catch (error) {
          console.error('逆地址解析失败:', error)
          // 使用坐标作为地址
          setSelectedLocation({
            latitude,
            longitude,
            address: `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`,
            timestamp: Date.now()
          })
        } finally {
          setAddressLoading(false)
        }
      }
      
      updateLocation()
    } else if (type === 'begin' && draggable) {
      setIsDragging(true)
    }
  }, [draggable, locationService])

  /**
   * 确认选择位置
   */
  const handleConfirm = useCallback(() => {
    if (!selectedLocation) {
      showToast({
        title: '请先选择位置',
        icon: 'none'
      })
      return
    }

    onChange(selectedLocation)
    showToast({
      title: '位置选择成功',
      icon: 'success'
    })
  }, [selectedLocation, onChange])

  /**
   * 重新选择位置
   */
  const handleReset = useCallback(() => {
    setSelectedLocation(null)
    onChange(null)
    
    // 回到当前位置
    getCurrentLocation()
  }, [onChange, getCurrentLocation])

  /**
   * 渲染地图标记
   */
  const renderMapMarkers = () => {
    if (!selectedLocation) return null

    return [
      {
        id: 0,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        iconPath: '/assets/images/location-marker.png',
        width: 32,
        height: 40,
        anchor: { x: 0.5, y: 1 }
      }
    ]
  }

  /**
   * 渲染位置信息
   */
  const renderLocationInfo = () => {
    if (!selectedLocation && !addressLoading) {
      return (
        <View className={styles.locationInfoEmpty}>
          <Text className={styles.emptyText}>拖动地图选择位置</Text>
          <Text className={styles.emptyHint}>地图中心的标记即为选择的位置</Text>
        </View>
      )
    }

    if (addressLoading) {
      return (
        <View className={styles.locationInfoLoading}>
          <Text className={styles.loadingText}>正在获取地址信息...</Text>
        </View>
      )
    }

    return (
      <View className={styles.locationInfo}>
        <View className={styles.locationIcon}>📍</View>
        <View className={styles.locationDetails}>
          <Text className={styles.locationAddress}>
            {selectedLocation?.address || '未知位置'}
          </Text>
          <Text className={styles.locationCoords}>
            {selectedLocation && `
              ${selectedLocation.latitude.toFixed(6)}, 
              ${selectedLocation.longitude.toFixed(6)}
            `}
          </Text>
          {selectedLocation?.accuracy && (
            <Text className={styles.locationAccuracy}>
              精度: ±{selectedLocation.accuracy.toFixed(0)}米
            </Text>
          )}
        </View>
      </View>
    )
  }

  /**
   * 渲染搜索框（预留接口）
   */
  const renderSearchBox = () => {
    if (!showSearch) return null

    return (
      <View className={styles.searchBox}>
        <View className={styles.searchInput}>
          <Text className={styles.searchPlaceholder}>
            🔍 搜索地址（功能开发中）
          </Text>
        </View>
      </View>
    )
  }

  /**
   * 渲染控制按钮
   */
  const renderControls = () => {
    return (
      <View className={styles.controls}>
        <Button
          className={styles.btnCurrentLocation}
          onClick={getCurrentLocation}
          size="mini"
        >
          📍 当前位置
        </Button>
      </View>
    )
  }

  /**
   * 渲染操作按钮
   */
  const renderActions = () => {
    return (
      <View className={styles.actions}>
        <Button
          className={styles.btnConfirm}
          onClick={handleConfirm}
          type="primary"
          disabled={!selectedLocation || isDragging}
        >
          {confirmText}
        </Button>
        
        <Button
          className={styles.btnCancel}
          onClick={handleReset}
          disabled={isDragging}
        >
          {cancelText}
        </Button>
      </View>
    )
  }

  return (
    <View className={`${styles.locationSelector} ${className}`} style={style}>
      {/* 搜索框 */}
      {renderSearchBox()}
      
      {/* 地图容器 */}
      <View className={styles.mapContainer}>
        <Map
          ref={mapRef}
          className={styles.map}
          latitude={mapCenter.latitude}
          longitude={mapCenter.longitude}
          scale={zoom}
          markers={renderMapMarkers()}
          showLocation
          enableScroll
          enableZoom
          enableRotate={false}
          onRegionChange={handleRegionChange}
        >
          {/* 中心标记点 */}
          <CoverView className={styles.centerMarker}>
            <CoverImage
              className={styles.centerMarkerIcon}
              src="/assets/images/map-center-marker.png"
            />
            {isDragging && (
              <CoverView className={styles.draggingHint}>
                <Text className={styles.draggingText}>松开选择此位置</Text>
              </CoverView>
            )}
          </CoverView>
        </Map>
        
        {/* 控制按钮 */}
        {renderControls()}
      </View>
      
      {/* 位置信息 */}
      <View className={styles.locationInfoContainer}>
        {renderLocationInfo()}
      </View>
      
      {/* 操作按钮 */}
      {renderActions()}
      
      {/* 使用提示 */}
      <View className={styles.usageHint}>
        <Text className={styles.hintText}>
          💡 提示：拖动地图选择位置，点击确认按钮完成选择
        </Text>
      </View>
    </View>
  )
}

export default LocationSelector