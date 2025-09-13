/**
 * LocationSelector 组件演示
 * 展示地图选点功能的完整交互流程
 */

import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { LocationData } from '@/types/location'
import LocationSelector from './LocationSelector'
import LocationSearch from '../LocationSearch/LocationSearch'
import styles from './demo.module.scss'

const LocationSelectorDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null)
  const [showSelector, setShowSelector] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const handleLocationSelect = (location: LocationData | null) => {
    setSelectedLocation(location)
    setShowSelector(false)
  }

  const handleSearchSelect = (location: LocationData | null) => {
    setSearchLocation(location)
    setShowSearch(false)
  }

  const renderLocationInfo = (location: LocationData | null, title: string) => {
    if (!location) {
      return (
        <View className={styles.locationInfo}>
          <Text className={styles.emptyText}>{title}：未选择位置</Text>
        </View>
      )
    }

    return (
      <View className={styles.locationInfo}>
        <Text className={styles.locationTitle}>{title}</Text>
        <Text className={styles.locationAddress}>{location.address}</Text>
        <Text className={styles.locationCoords}>
          纬度: {location.latitude.toFixed(6)}, 经度: {location.longitude.toFixed(6)}
        </Text>
        {location.accuracy && (
          <Text className={styles.locationAccuracy}>精度: ±{location.accuracy.toFixed(0)}米</Text>
        )}
      </View>
    )
  }

  return (
    <View className={styles.demoContainer}>
      <View className={styles.demoHeader}>
        <Text className={styles.demoTitle}>位置选择器演示</Text>
        <Text className={styles.demoDescription}>体验地图选点和地址搜索功能</Text>
      </View>

      {/* 地图选点演示 */}
      <View className={styles.demoSection}>
        <Text className={styles.sectionTitle}>1. 地图选点</Text>
        <Button
          className={styles.demoButton}
          onClick={() => setShowSelector(true)}
          type="primary"
        >
          打开地图选点
        </Button>
        
        {renderLocationInfo(selectedLocation, '选择的位置')}
      </View>

      {/* 地址搜索演示 */}
      <View className={styles.demoSection}>
        <Text className={styles.sectionTitle}>2. 地址搜索</Text>
        <Button
          className={styles.demoButton}
          onClick={() => setShowSearch(true)}
          type="primary"
        >
          打开地址搜索
        </Button>
        
        {renderLocationInfo(searchLocation, '搜索的位置')}
      </View>

      {/* 结果对比 */}
      {(selectedLocation || searchLocation) && (
        <View className={styles.demoSection}>
          <Text className={styles.sectionTitle}>3. 结果对比</Text>
          {selectedLocation && searchLocation && (
            <View className={styles.comparison}>
              <Text className={styles.comparisonText}>
                {selectedLocation.latitude === searchLocation.latitude &&
                 selectedLocation.longitude === searchLocation.longitude
                  ? '✅ 两个位置相同'
                  : '❌ 两个位置不同'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 地图选点弹窗 */}
      {showSelector && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <LocationSelector
              value={selectedLocation}
              onChange={handleLocationSelect}
              showSearch={true}
              draggable={true}
              zoom={16}
            />
            <Button
              className={styles.closeButton}
              onClick={() => setShowSelector(false)}
            >
              关闭
            </Button>
          </View>
        </View>
      )}

      {/* 地址搜索弹窗 */}
      {showSearch && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <LocationSearch
              value={searchLocation}
              onChange={handleSearchSelect}
              placeholder="搜索地址、地标、POI..."
              showHistory={true}
              showCurrentLocation={true}
              debounceDelay={300}
            />
            
            <Button
              className={styles.closeButton}
              onClick={() => setShowSearch(false)}
            >
              关闭
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default LocationSelectorDemo