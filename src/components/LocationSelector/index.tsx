/**
 * LocationSelector 位置选择组件
 * 提供位置选择和显示功能
 */

import React, { useState, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { LocationInfo } from '@/types/sport'
import { showToast, showLoading, hideLoading } from '@/utils/ui'
import './index.scss'

interface LocationSelectorProps {
  /** 当前位置信息 */
  location?: LocationInfo
  /** 位置变化回调 */
  onChange: (location: LocationInfo | undefined) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否必填 */
  required?: boolean
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onChange,
  className = '',
  style,
  required = false
}) => {
  const [loading, setLoading] = useState(false)

  /**
   * 获取当前位置
   */
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true)
      showLoading({ title: '正在获取位置...' })

      // 获取位置授权
      const authRes = await Taro.authorize({
        scope: 'scope.userLocation'
      })

      // 获取当前位置
      const locationRes = await Taro.getLocation({
        type: 'gcj02',
        altitude: false
      })

      const { latitude, longitude } = locationRes

      // 逆地址解析（这里简化处理，实际需要调用地图API）
      const address = await reverseGeocoding(latitude, longitude)

      const locationInfo: LocationInfo = {
        latitude,
        longitude,
        address: address || '当前位置',
        city: '',
        district: ''
      }

      onChange(locationInfo)
      
      showToast({
        title: '位置获取成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('获取位置失败:', error)
      
      // 处理不同错误情况
      if (error.errMsg.includes('auth deny')) {
        showToast({
          title: '请授权位置权限',
          icon: 'none'
        })
        
        // 引导用户开启权限
        Taro.showModal({
          title: '位置权限',
          content: '需要获取您的位置信息，请在设置中开启位置权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              Taro.openSetting()
            }
          }
        })
      } else {
        showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    } finally {
      setLoading(false)
      hideLoading()
    }
  }, [onChange])

  /**
   * 选择位置（打开地图选择）
   */
  const chooseLocation = useCallback(async () => {
    try {
      setLoading(true)
      showLoading({ title: '正在打开地图...' })

      // 获取位置授权
      await Taro.authorize({
        scope: 'scope.userLocation'
      })

      // 打开地图选择位置
      const locationRes = await Taro.chooseLocation({
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        name: location?.address || ''
      })

      const locationInfo: LocationInfo = {
        latitude: locationRes.latitude,
        longitude: locationRes.longitude,
        address: locationRes.name || locationRes.address || '选择的位置',
        city: '',
        district: ''
      }

      onChange(locationInfo)
      
      showToast({
        title: '位置选择成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('选择位置失败:', error)
      
      if (error.errMsg.includes('cancel')) {
        // 用户取消选择，不显示错误
        return
      }
      
      if (error.errMsg.includes('auth deny')) {
        showToast({
          title: '请授权位置权限',
          icon: 'none'
        })
      } else {
        showToast({
          title: '选择位置失败',
          icon: 'none'
        })
      }
    } finally {
      setLoading(false)
      hideLoading()
    }
  }, [location, onChange])

  /**
   * 清除位置
   */
  const handleClearLocation = useCallback(() => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除位置信息吗？',
      success: (res) => {
        if (res.confirm) {
          onChange(undefined)
        }
      }
    })
  }, [onChange])

  /**
   * 逆地址解析（简化版，实际应该调用地图API）
   */
  const reverseGeocoding = async (latitude: number, longitude: number): Promise<string> => {
    // 这里应该调用实际的地图API进行逆地址解析
    // 暂时返回简化地址
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`)
      }, 500)
    })
  }

  /**
   * 渲染位置信息
   */
  const renderLocationInfo = () => {
    if (!location) {
      return (
        <View className="location-empty">
          <Text className="empty-text">未选择位置</Text>
          <Text className="empty-hint">可添加运动位置信息</Text>
        </View>
      )
    }

    return (
      <View className="location-info">
        <View className="location-icon">📍</View>
        <View className="location-details">
          <Text className="location-address">{location.address}</Text>
          <Text className="location-coords">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
        <View className="location-actions">
          <Button
            className="btn-clear"
            onClick={handleClearLocation}
            disabled={loading}
          >
            清除
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={`location-selector ${className}`} style={style}>
      <View className="selector-header">
        <Text className="selector-title">
          运动位置
          {required && <Text className="required-mark">*</Text>}
        </Text>
      </View>

      <View className="location-display">
        {renderLocationInfo()}
      </View>

      <View className="selector-actions">
        <Button
          className="btn-current"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          {loading ? '获取中...' : '📍 获取当前位置'}
        </Button>
        
        <Button
          className="btn-choose"
          onClick={chooseLocation}
          disabled={loading}
        >
          🗺️ 选择位置
        </Button>
      </View>

      <View className="selector-footer">
        <Text className="selector-hint">
          可记录运动地点，方便回顾和分享
        </Text>
      </View>
    </View>
  )
}

export default LocationSelector