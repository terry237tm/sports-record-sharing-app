import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'

// 导入位置服务组件
import { LocationDisplay } from '@/components/LocationDisplay'
import { LocationPermission } from '@/components/LocationPermission'
import LocationSelector from '@/components/LocationSelector'
import LocationSearch from '@/components/LocationSearch'
import MapView from '@/components/MapView'

// 模拟位置数据用于测试
const mockLocation = {
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市东城区东华门街道',
  city: '北京市',
  district: '东城区',
  province: '北京市',
  country: '中国',
  poi: '东华门',
  accuracy: 65,
  timestamp: Date.now()
}

const mockSearchResults = [
  {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市东城区东华门街道',
    city: '北京市',
    district: '东城区',
    province: '北京市',
    poi: '东华门',
    accuracy: 65,
    timestamp: Date.now()
  },
  {
    latitude: 39.9156,
    longitude: 116.3974,
    address: '北京市西城区什刹海街道',
    city: '北京市',
    district: '西城区',
    province: '北京市',
    poi: '什刹海',
    accuracy: 58,
    timestamp: Date.now()
  }
]

export default function LocationComponentsTest() {
  const [currentLocation, setCurrentLocation] = useState(mockLocation)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchResults, setSearchResults] = useState(mockSearchResults)
  const [permissionStatus, setPermissionStatus] = useState('granted')

  useEffect(() => {
    console.log('🗺️ 位置服务组件测试页面加载完成')
    console.log('📍 当前模拟位置:', mockLocation)
    console.log('🔍 模拟搜索结果:', mockSearchResults)
  }, [])

  // 模拟获取当前位置
  const handleGetCurrentLocation = () => {
    console.log('📍 获取当前位置 (模拟)')
    setCurrentLocation(mockLocation)
    Taro.showToast({
      title: '位置获取成功',
      icon: 'success',
      duration: 2000
    })
  }

  // 模拟位置选择
  const handleLocationSelect = (location) => {
    console.log('🎯 位置选择:', location)
    setSelectedLocation(location)
    Taro.showToast({
      title: '位置已选择',
      icon: 'success',
      duration: 2000
    })
  }

  // 模拟位置搜索
  const handleSearchLocation = (keyword) => {
    console.log('🔍 搜索位置:', keyword)
    return mockSearchResults
  }

  // 模拟权限请求
  const handleRequestPermission = () => {
    console.log('🔐 请求位置权限')
    setPermissionStatus('granted')
    Taro.showToast({
      title: '权限已授权',
      icon: 'success',
      duration: 2000
    })
  }

  // 模拟打开设置
  const handleOpenSettings = () => {
    console.log('⚙️ 打开设置')
    Taro.showToast({
      title: '设置页面 (模拟)',
      icon: 'none',
      duration: 2000
    })
  }

  return (
    <View className="location-test">
      <View className="test-header">
        <Text className="test-title">🗺️ 位置服务组件测试</Text>
        <Text className="test-subtitle">体验位置服务功能 (模拟数据)</Text>
      </View>

      {/* 组件测试区域 */}
      <View className="test-content">
        
        {/* 位置显示组件测试 */}
        <View className="test-section">
          <Text className="section-title">📍 位置显示组件</Text>
          <Button type="primary" onClick={handleGetCurrentLocation}>
            显示当前位置
          </Button>
          
          <View className="component-demo">
            <LocationDisplay
              location={currentLocation}
              loading={false}
              error={null}
              onRefresh={handleGetCurrentLocation}
              showAccuracy={true}
              showTimestamp={true}
              addressFormat="full"
            />
          </View>
        </View>

        {/* 权限管理组件测试 */}
        <View className="test-section">
          <Text className="section-title">🔐 权限管理组件</Text>
          <LocationPermission
            status={permissionStatus}
            onRequestPermission={handleRequestPermission}
            onOpenSettings={handleOpenSettings}
            guideTitle="需要位置权限"
            requestButtonText="请求位置权限"
            settingsButtonText="前往设置"
          />
        </View>

        {/* 位置选择器组件测试 */}
        <View className="test-section">
          <Text className="section-title">🎯 位置选择器组件</Text>
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            showCurrentLocation={true}
            showSearch={true}
            confirmButtonText="确认选择"
            cancelButtonText="取消"
          />
          
          {selectedLocation && (
            <View className="selected-result">
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

        {/* 位置搜索组件测试 */}
        <View className="test-section">
          <Text className="section-title">🔍 位置搜索组件</Text>
          <LocationSearch
            onSearch={handleSearchLocation}
            placeholder="搜索地址或地点"
            showCurrentLocation={true}
            maxResults={5}
            debounceDelay={300}
          />
        </View>

        {/* 地图组件测试 */}
        <View className="test-section">
          <Text className="section-title">🗺️ 地图组件</Text>
          <Button onClick={handleGetCurrentLocation}>
            在地图上显示当前位置
          </Button>
          
          <View className="map-container">
            <MapView
              style={{ width: '100%', height: '300px' }}
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              markers={[
                {
                  id: 'current',
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  title: '当前位置',
                  iconPath: '/assets/icons/location.png',
                  width: 30,
                  height: 30
                }
              ]}
              showLocation={true}
              enableZoom={true}
              enableScroll={true}
              showCompass={true}
              showScale={true}
              onMarkerTap={(detail) => {
                console.log('标记点击:', detail)
                Taro.showToast({
                  title: '点击了位置标记',
                  icon: 'none'
                })
              }}
            />
          </View>
        </View>
      </View>

      {/* 功能说明 */}
      <View className="feature-info">
        <Text className="info-title">✨ 功能特点</Text>
        <Text className="info-item">📍 精确的位置信息显示</Text>
        <Text className="info-item">🔐 完整的权限管理流程</Text>
        <Text className="info-item">🎯 交互式位置选择器</Text>
        <Text className="info-item">🔍 智能地址搜索</Text>
        <Text className="info-item">🗺️ 丰富的地图展示</Text>
        <Text className="info-item">⚡ 高性能缓存机制</Text>
        <Text className="info-item">🛡️ 企业级隐私保护</Text>
      </View>
    </View>
  )
}

// 页面配置
LocationComponentsTest.config = {
  navigationBarTitleText: '🗺️ 位置服务测试',
  enablePullDownRefresh: false,
  navigationBarBackgroundColor: '#667eea',
  navigationBarTextStyle: 'white'
}

export { LocationComponentsTest }