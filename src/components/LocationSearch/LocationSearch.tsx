/**
 * LocationSearch 地址搜索组件
 * 提供地址搜索、自动完成、搜索建议、历史记录功能
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { LocationData } from '@/services/location/types'
import { useLocationService } from '@/hooks/useLocationService'
import { useDebounce } from '@/hooks/useDebounce'
import { showToast } from '@/utils/ui'
import { validateCoordinates } from '@/utils/location'
import styles from './LocationSearch.module.scss'

export interface LocationSearchProps {
  /** 当前选中的位置 */
  value?: LocationData | null
  /** 位置变化回调 */
  onChange: (location: LocationData | null) => void
  /** 搜索框占位符 */
  placeholder?: string
  /** 是否显示搜索历史 */
  showHistory?: boolean
  /** 搜索历史最大数量 */
  maxHistory?: number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否自动聚焦 */
  autoFocus?: boolean
  /** 是否显示当前位置按钮 */
  showCurrentLocation?: boolean
  /** 搜索延迟时间（毫秒） */
  debounceDelay?: number
}

export interface SearchHistoryItem {
  address: string
  location: LocationData
  timestamp: number
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  placeholder = '搜索地址、地标、POI...',
  showHistory = true,
  maxHistory = 5,
  className = '',
  style,
  autoFocus = false,
  showCurrentLocation = true,
  debounceDelay = 300
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const locationService = useLocationService()
  const debouncedSearchValue = useDebounce(searchValue, debounceDelay)
  const inputRef = useRef<any>(null)
  const historyKey = 'location_search_history'

  // 初始化搜索历史
  useEffect(() => {
    if (showHistory) {
      loadSearchHistory()
    }
  }, [showHistory])

  // 同步外部值到搜索框
  useEffect(() => {
    if (value?.address && !searchValue) {
      setSearchValue(value.address)
    }
  }, [value, searchValue])

  // 监听搜索值变化
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      handleSearch(debouncedSearchValue.trim())
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [debouncedSearchValue])

  /**
   * 加载搜索历史
   */
  const loadSearchHistory = useCallback(() => {
    try {
      const history = Taro.getStorageSync(historyKey)
      if (history && Array.isArray(history)) {
        setSearchHistory(history.slice(0, maxHistory))
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }, [maxHistory, historyKey])

  /**
   * 保存搜索历史
   */
  const saveSearchHistory = useCallback((address: string, location: LocationData) => {
    try {
      const newItem: SearchHistoryItem = {
        address,
        location,
        timestamp: Date.now()
      }
      
      // 移除重复项
      const filteredHistory = searchHistory.filter(
        item => item.address !== address
      )
      
      // 添加到开头
      const newHistory = [newItem, ...filteredHistory].slice(0, maxHistory)
      
      setSearchHistory(newHistory)
      Taro.setStorageSync(historyKey, newHistory)
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }, [searchHistory, maxHistory, historyKey])

  /**
   * 清除搜索历史
   */
  const clearSearchHistory = useCallback(() => {
    try {
      setSearchHistory([])
      Taro.removeStorageSync(historyKey)
      showToast({
        title: '搜索历史已清除',
        icon: 'success'
      })
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }, [historyKey])

  /**
   * 执行搜索
   */
  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return

    setIsSearching(true)
    setShowResults(true)
    setSelectedIndex(-1)

    try {
      // 使用腾讯地图搜索服务
      const results = await locationService.searchLocation(keyword)
      
      // 过滤无效结果
      const validResults = results.filter(result => 
        validateCoordinates(result.latitude, result.longitude)
      )
      
      setSearchResults(validResults)
      
      if (validResults.length === 0) {
        showToast({
          title: '未找到相关位置',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('搜索失败:', error)
      showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [locationService])

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((event: any) => {
    const value = event.detail.value
    setSearchValue(value)
    
    if (!value.trim()) {
      setShowResults(false)
      setSearchResults([])
    }
  }, [])

  /**
   * 处理输入聚焦
   */
  const handleInputFocus = useCallback(() => {
    if (searchValue.trim() && searchResults.length > 0) {
      setShowResults(true)
    } else if (showHistory && searchHistory.length > 0 && !searchValue.trim()) {
      setShowResults(true)
    }
  }, [searchValue, searchResults, showHistory, searchHistory])

  /**
   * 处理输入失焦
   */
  const handleInputBlur = useCallback(() => {
    // 延迟关闭结果列表，允许点击选择
    setTimeout(() => {
      setShowResults(false)
      setSelectedIndex(-1)
    }, 200)
  }, [])

  /**
   * 选择搜索结果
   */
  const handleSelectResult = useCallback((location: LocationData, index: number) => {
    setSelectedIndex(index)
    setSearchValue(location.address)
    setShowResults(false)
    
    // 保存到搜索历史
    saveSearchHistory(location.address, location)
    
    // 触发回调
    onChange(location)
    
    showToast({
      title: '已选择位置',
      icon: 'success'
    })
  }, [onChange, saveSearchHistory])

  /**
   * 选择历史记录
   */
  const handleSelectHistory = useCallback((item: SearchHistoryItem) => {
    setSearchValue(item.address)
    setShowResults(false)
    
    // 触发回调
    onChange(item.location)
    
    showToast({
      title: '已选择位置',
      icon: 'success'
    })
  }, [onChange])

  /**
   * 获取当前位置
   */
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await locationService.getCurrentLocation()
      setSearchValue(location.address)
      setShowResults(false)
      onChange(location)
      
      showToast({
        title: '已获取当前位置',
        icon: 'success'
      })
    } catch (error) {
      console.error('获取当前位置失败:', error)
      showToast({
        title: '获取位置失败',
        icon: 'none'
      })
    }
  }, [locationService, onChange])

  /**
   * 格式化距离显示
   */
  const formatDistance = useCallback((distance?: number) => {
    if (!distance) return ''
    
    if (distance < 1000) {
      return `${distance.toFixed(0)}米`
    } else {
      return `${(distance / 1000).toFixed(1)}公里`
    }
  }, [])

  /**
   * 渲染搜索框
   */
  const renderSearchInput = () => {
    return (
      <View className={styles.searchInputContainer}>
        <Input
          ref={inputRef}
          className={styles.searchInput}
          value={searchValue}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSearching}
          onInput={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        
        {searchValue && (
          <View 
            className={styles.clearButton}
            onClick={() => {
              setSearchValue('')
              setSearchResults([])
              setShowResults(false)
              onChange(null)
            }}
          >
            ✕
          </View>
        )}
        
        {isSearching && (
          <View className={styles.loadingIndicator}>
            <Text className={styles.loadingText}>🔄</Text>
          </View>
        )}
      </View>
    )
  }

  /**
   * 渲染搜索结果
   */
  const renderSearchResults = () => {
    if (!showResults || (!searchResults.length && !searchHistory.length)) {
      return null
    }

    return (
      <ScrollView 
        className={styles.resultsContainer}
        scrollY
        scrollWithAnimation
      >
        {/* 搜索历史 */}
        {showHistory && !searchValue.trim() && searchHistory.length > 0 && (
          <View className={styles.historySection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>最近搜索</Text>
              <Text 
                className={styles.clearHistoryButton}
                onClick={clearSearchHistory}
              >
                清除
              </Text>
            </View>
            
            {searchHistory.map((item, index) => (
              <View
                key={`history-${index}`}
                className={`${styles.resultItem} ${
                  selectedIndex === index - searchResults.length ? styles.selected : ''
                }`}
                onClick={() => handleSelectHistory(item)}
              >
                <View className={styles.resultIcon}>🕐</View>
                <View className={styles.resultContent}>
                  <Text className={styles.resultTitle}>{item.address}</Text>
                  <Text className={styles.resultSubtitle}>
                    {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <View className={styles.resultsSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>搜索结果</Text>
            </View>
            
            {searchResults.map((result, index) => (
              <View
                key={`result-${index}`}
                className={`${styles.resultItem} ${
                  selectedIndex === index ? styles.selected : ''
                }`}
                onClick={() => handleSelectResult(result, index)}
              >
                <View className={styles.resultIcon}>📍</View>
                <View className={styles.resultContent}>
                  <Text className={styles.resultTitle}>{result.address}</Text>
                  <View className={styles.resultMeta}>
                    <Text className={styles.resultCoords}>
                      {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                    </Text>
                    {result.accuracy && (
                      <Text className={styles.resultAccuracy}>
                        ±{result.accuracy.toFixed(0)}米
                      </Text>
                    )}
                    {result.distance && (
                      <Text className={styles.resultDistance}>
                        {formatDistance(result.distance)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 无结果提示 */}
        {searchValue.trim() && !isSearching && searchResults.length === 0 && (
          <View className={styles.noResults}>
            <Text className={styles.noResultsText}>未找到相关位置</Text>
            <Text className={styles.noResultsHint}>请尝试其他关键词</Text>
          </View>
        )}
      </ScrollView>
    )
  }

  /**
   * 渲染当前位置按钮
   */
  const renderCurrentLocationButton = () => {
    if (!showCurrentLocation) return null

    return (
      <View className={styles.currentLocationButton}>
        <View 
          className={styles.currentLocationButtonContent}
          onClick={handleGetCurrentLocation}
        >
          📍 使用当前位置
        </View>
      </View>
    )
  }

  return (
    <View className={`${styles.locationSearch} ${className}`} style={style}>
      {/* 搜索输入框 */}
      {renderSearchInput()}
      
      {/* 搜索结果 */}
      {renderSearchResults()}
      
      {/* 当前位置按钮 */}
      {renderCurrentLocationButton()}
    </View>
  )
}

export default LocationSearch

// 自定义Hook用于位置搜索
export const useLocationSearch = (options?: {
  debounceDelay?: number
  maxResults?: number
}) => {
  const locationService = useLocationService()
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchLocation = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return []
    }

    setIsSearching(true)
    
    try {
      const results = await locationService.searchLocation(keyword)
      const limitedResults = options?.maxResults 
        ? results.slice(0, options.maxResults)
        : results
      
      setSearchResults(limitedResults)
      return limitedResults
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchResults([])
      return []
    } finally {
      setIsSearching(false)
    }
  }, [locationService, options?.maxResults])

  return {
    searchResults,
    isSearching,
    searchLocation
  }
}