import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { LocationDisplay } from '@/components/LocationDisplay'
import { LocationPermission } from '@/components/LocationPermission'
import LocationSelector from '@/components/LocationSelector'
import LocationSearch from '@/components/LocationSearch'
import { MapView } from '@/components/MapView'
import { useLocationPermission } from '@/hooks/useLocationPermission'
import { useLocationEcosystem } from '@/hooks/useLocationEcosystem'
import { LocationData } from '@/services/location/types'

import './index.scss'

export default function LocationDemo() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null)
  const [activeTab, setActiveTab] = useState('display')

  // 使用位置权限Hook
  const { status, isGranted, requestPermission } = useLocationPermission()

  // 使用统一位置生态系统Hook
  const {
    getCurrentLocation,
    getLocationByStrategy,
    searchLocation: searchLocationService,
    cache,
    privacy
  } = useLocationEcosystem()

  useLoad(() => {
    console.log('位置服务演示页面加载完成')
  })

  // 获取当前位置
  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setCurrentLocation(location)
      console.log('当前位置获取成功:', location)
    } catch (error) {
      console.error('获取当前位置失败:', error)
    }
  }

  // 使用不同策略获取位置
  const handleGetLocationByStrategy = async (strategy: string) => {
    try {
      const location = await getLocationByStrategy(strategy)
      setCurrentLocation(location)
      console.log(`${strategy}策略位置获取成功:`, location)
    } catch (error) {
      console.error(`${strategy}策略位置获取失败:`, error)
    }
  }

  // 搜索位置
  const handleSearchLocation = async (keyword: string) => {
    try {
      const results = await searchLocationService(keyword)
      if (results.length > 0) {
        setSearchLocation(results[0])
        console.log('位置搜索成功:', results[0])
      }
    } catch (error) {
      console.error('位置搜索失败:', error)
    }
  }

  // 处理位置选择
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    console.log('位置选择成功:', location)
  }

  const tabs = [
    { key: 'display', label: '位置显示' },
    { key: 'permission', label: '权限管理' },
    { key: 'selector', label: '位置选择' },
    { key: 'search', label: '位置搜索' },
    { key: 'map', label: '地图展示' }
  ]

  return (
    <View className="location-demo">
      <View className="demo-header">
        <Text className="demo-title">🗺️ 位置服务演示</Text>
        <Text className="demo-subtitle">体验完整的位置服务功能</Text>
      </View>

      {/* 标签页导航 */}
      <View className="tab-navigation">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </View>

      {/* 当前状态显示 */}
      <View className="status-bar">
        <Text className="status-text">权限状态: {status}</Text>
        <Text className="status-text">缓存命中率: {cache?.getStats().hitRate || 0}%</Text>
      </View>

      <ScrollView className="demo-content" scrollY>
        {/* 位置显示演示 */}
        {activeTab === 'display' && (
          <View className="demo-section">
            <Text className="section-title">📍 位置信息显示</Text>
            
            <View className="control-buttons">
              <Button type="primary" onClick={handleGetCurrentLocation}>
                获取当前位置
              </Button>
              <Button onClick={() => handleGetLocationByStrategy('highAccuracy')}>
                高精度定位
              </Button>
              <Button onClick={() => handleGetLocationByStrategy('balanced')}>
                平衡模式
              </Button>
              <Button onClick={() => handleGetLocationByStrategy('lowPower')}>
                低功耗模式
              </Button>
            </View>

            {currentLocation && (
              <View className="location-result">
                <Text className="result-title">当前位置信息:</Text>
                <LocationDisplay
                  location={currentLocation}
                  showAccuracy={true}
                  showTimestamp={true}
                  addressFormat="full"
                  onRefresh={handleGetCurrentLocation}
                />
              </View>
            )}
          </View>
        )}

        {/* 权限管理演示 */}
        {activeTab === 'permission' && (
          <View className="demo-section">
            <Text className="section-title">🔐 位置权限管理</Text>
            
            <LocationPermission
              status={status}
              onRequestPermission={requestPermission}
              onOpenSettings={() => {
                Taro.openSetting({
                  success: () => console.log('设置页面已打开'),
                  fail: (error) => console.error('打开设置失败:', error)
                })
              }}
              guideTitle="需要位置权限"
              requestButtonText="请求位置权限"
              settingsButtonText="前往设置"
            />

            <View className="permission-info">
              <Text className="info-text">当前权限状态: {status}</Text>
              <Text className="info-text">是否已授权: {isGranted ? '是' : '否'}</Text>
            </View>
          </View>
        )}

        {/* 位置选择演示 */}
        {activeTab === 'selector' && (
          <View className="demo-section">
            <Text className="section-title">🎯 位置选择器</Text>
            
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              showCurrentLocation={true}
              showSearch={true}
              confirmButtonText="确认选择"
              cancelButtonText="取消"
            />

            {selectedLocation && (
              <View className="location-result">
                <Text className="result-title">选择的位置:</Text>
                <LocationDisplay
                  location={selectedLocation}
                  showAccuracy={true}
                  showTimestamp={true}
                  addressFormat="full"
                />
              </View>
            )}
          </View>
        )}

        {/* 位置搜索演示 */}
        {activeTab === 'search' && (
          <View className="demo-section">
            <Text className="section-title">🔍 位置搜索</Text>
            
            <LocationSearch
              onSearch={handleSearchLocation}
              placeholder="搜索地址或地点"
              showCurrentLocation={true}
              maxResults={5}
              debounceDelay={300}
            />

            {searchLocation && (
              <View className="location-result">
                <Text className="result-title">搜索结果:</Text>
                <LocationDisplay
                  location={searchLocation}
                  showAccuracy={true}
                  showTimestamp={true}
                  addressFormat="full"
                />
              </View>
            )}
          </View>
        )}

        {/* 地图展示演示 */}
        {activeTab === 'map' && (
          <View className="demo-section">
            <Text className="section-title">🗺️ 地图展示</Text>
            
            <View className="map-controls">
              <Button onClick={handleGetCurrentLocation}>在地图上显示当前位置</Button>
            </View>

            <MapView
              style={{ width: '100%', height: '400px' }}
              latitude={currentLocation?.latitude || 39.9042}
              longitude={currentLocation?.longitude || 116.4074}
              markers={currentLocation ? [{
                id: 'current',
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                title: '当前位置',
                iconPath: '/assets/icons/location.png',
                width: 30,
                height: 30
              }] : []}
              showLocation={true}
              enableZoom={true}
              enableScroll={true}
              enableRotate={true}
              showCompass={true}
              showScale={true}
              enableTraffic={false}
              onMarkerTap={(detail) => {
                console.log('标记点击:', detail)
              }}
              onRegionChange={(detail) => {
                console.log('地图区域变化:', detail)
              }}
            />

            {currentLocation && (
              <View className="map-info">
                <Text className="info-text">
                  当前地图中心: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
                <Text className="info-text">地址: {currentLocation.address}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部信息栏 */}
      <View className="footer-info">
        <Text className="footer-text">💡 提示: 位置服务需要网络连接和相应的权限</Text>
        <Text className="footer-text">🔒 所有位置数据都经过隐私保护处理</Text>
      </View>
    </View>
  )
}