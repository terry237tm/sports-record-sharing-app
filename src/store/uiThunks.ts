/**
 * UI相关异步操作
 * 使用 createAsyncThunk 创建异步操作，处理UI相关的异步逻辑
 */

import { createAsyncThunk } from '@reduxjs/toolkit'

/**
 * 显示Toast提示
 * 自动处理Toast的显示和隐藏逻辑
 */
export const showToast = createAsyncThunk(
  'ui/showToast',
  async (params: {
    title: string
    icon?: 'success' | 'loading' | 'none'
    duration?: number
    mask?: boolean
  }) => {
    // 显示Toast
    const toastConfig = {
      title: params.title,
      icon: params.icon || 'none',
      duration: params.duration || 2000,
      mask: params.mask || false
    }
    
    // 返回配置，让reducer处理显示逻辑
    return toastConfig
  }
)

/**
 * 隐藏Toast提示
 */
export const hideToast = createAsyncThunk(
  'ui/hideToast',
  async () => {
    // 可以在这里添加额外的清理逻辑
    return true
  }
)

/**
 * 设置全局加载状态
 */
export const setGlobalLoading = createAsyncThunk(
  'ui/setGlobalLoading',
  async (params: {
    loading: boolean
    text?: string
    delay?: number
  }) => {
    const { loading, text, delay } = params
    
    if (loading && delay) {
      // 如果需要延迟显示加载状态
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    return {
      loading,
      text: text || '加载中...'
    }
  }
)

/**
 * 设置页面加载状态
 */
export const setPageLoading = createAsyncThunk(
  'ui/setPageLoading',
  async (params: {
    loading: boolean
    text?: string
    delay?: number
  }) => {
    const { loading, text, delay } = params
    
    if (loading && delay) {
      // 如果需要延迟显示加载状态
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    return {
      loading,
      text: text || '页面加载中...'
    }
  }
)

/**
 * 显示确认对话框
 */
export const showConfirmDialog = createAsyncThunk(
  'ui/showConfirmDialog',
  async (params: {
    title: string
    content: string
    confirmText?: string
    cancelText?: string
    confirmColor?: string
  }) => {
    return {
      title: params.title,
      content: params.content,
      confirmText: params.confirmText || '确定',
      cancelText: params.cancelText || '取消',
      confirmColor: params.confirmColor || '#FF6B35'
    }
  }
)

/**
 * 显示操作菜单
 */
export const showActionSheet = createAsyncThunk(
  'ui/showActionSheet',
  async (params: {
    itemList: string[]
    itemColor?: string
    cancelText?: string
  }) => {
    return {
      itemList: params.itemList,
      itemColor: params.itemColor || '#333333',
      cancelText: params.cancelText || '取消'
    }
  }
)

/**
 * 显示模态框
 */
export const showModal = createAsyncThunk(
  'ui/showModal',
  async (params: {
    title: string
    content?: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
    cancelColor?: string
    confirmColor?: string
  }) => {
    return {
      title: params.title,
      content: params.content || '',
      showCancel: params.showCancel !== false,
      cancelText: params.cancelText || '取消',
      confirmText: params.confirmText || '确定',
      cancelColor: params.cancelColor || '#999999',
      confirmColor: params.confirmColor || '#FF6B35'
    }
  }
)

/**
 * 显示图片预览
 */
export const showImagePreview = createAsyncThunk(
  'ui/showImagePreview',
  async (params: {
    urls: string[]
    current?: number
    showMenuByLongpress?: boolean
  }) => {
    return {
      urls: params.urls,
      current: params.current || 0,
      showMenuByLongpress: params.showMenuByLongpress || false
    }
  }
)

/**
 * 网络状态检查
 */
export const checkNetworkStatus = createAsyncThunk(
  'ui/checkNetworkStatus',
  async () => {
    try {
      // 这里可以实现实际的网络状态检查逻辑
      // 例如通过尝试请求一个简单的API来判断网络状态
      return navigator.onLine ? 'online' : 'offline'
    } catch (error) {
      return 'unknown'
    }
  }
)

/**
 * 获取系统信息
 */
export const getSystemInfo = createAsyncThunk(
  'ui/getSystemInfo',
  async () => {
    try {
      // 这里可以实现实际的系统信息获取逻辑
      // 在Taro环境中，可以使用Taro.getSystemInfo()
      const systemInfo = {
        platform: 'weapp',
        system: 'iOS 14.0',
        version: '8.0.0',
        screenWidth: 375,
        screenHeight: 812,
        pixelRatio: 2,
        windowWidth: 375,
        windowHeight: 812,
        statusBarHeight: 44,
        safeArea: {
          left: 0,
          right: 375,
          top: 44,
          bottom: 778
        }
      }
      
      return systemInfo
    } catch (error) {
      throw new Error('获取系统信息失败')
    }
  }
)

/**
 * 切换主题
 */
export const toggleTheme = createAsyncThunk(
  'ui/toggleTheme',
  async (theme?: 'light' | 'dark') => {
    // 如果没有指定主题，则根据当前时间或系统设置自动切换
    if (!theme) {
      const hour = new Date().getHours()
      theme = (hour >= 6 && hour < 18) ? 'light' : 'dark'
    }
    
    return theme
  }
)

/**
 * 显示通知
 */
export const showNotification = createAsyncThunk(
  'ui/showNotification',
  async (params: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    requireInteraction?: boolean
  }) => {
    // 这里可以实现实际的通知显示逻辑
    // 在浏览器环境中，可以使用Notification API
    // 在小程序环境中，可以使用相应的API
    
    return {
      title: params.title,
      body: params.body,
      icon: params.icon,
      badge: params.badge,
      tag: params.tag,
      requireInteraction: params.requireInteraction || false,
      timestamp: Date.now()
    }
  }
)

/**
 * 显示加载指示器
 */
export const showLoading = createAsyncThunk(
  'ui/showLoading',
  async (params: {
    title?: string
    mask?: boolean
  }) => {
    return {
      title: params.title || '加载中...',
      mask: params.mask || false
    }
  }
)

/**
 * 隐藏加载指示器
 */
export const hideLoading = createAsyncThunk(
  'ui/hideLoading',
  async () => {
    return true
  }
)

/**
 * 导航栏操作
 */
export const setNavigationBarTitle = createAsyncThunk(
  'ui/setNavigationBarTitle',
  async (title: string) => {
    return title
  }
)

export const setNavigationBarColor = createAsyncThunk(
  'ui/setNavigationBarColor',
  async (params: {
    frontColor: '#ffffff' | '#000000'
    backgroundColor: string
    animation?: {
      duration?: number
      timingFunc?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
    }
  }) => {
    return params
  }
)

/**
 * TabBar操作
 */
export const setTabBarBadge = createAsyncThunk(
  'ui/setTabBarBadge',
  async (params: {
    index: number
    text: string
  }) => {
    return params
  }
)

export const removeTabBarBadge = createAsyncThunk(
  'ui/removeTabBarBadge',
  async (index: number) => {
    return index
  }
)

export const showTabBarRedDot = createAsyncThunk(
  'ui/showTabBarRedDot',
  async (index: number) => {
    return index
  }
)

export const hideTabBarRedDot = createAsyncThunk(
  'ui/hideTabBarRedDot',
  async (index: number) => {
    return index
  }
)

/**
 * 滚动位置管理
 */
export const saveScrollPosition = createAsyncThunk(
  'ui/saveScrollPosition',
  async (params: {
    key: string
    position: number
  }) => {
    return params
  }
)

export const restoreScrollPosition = createAsyncThunk(
  'ui/restoreScrollPosition',
  async (key: string) => {
    return key
  }
)

/**
 * 下拉刷新
 */
export const startPullDownRefresh = createAsyncThunk(
  'ui/startPullDownRefresh',
  async () => {
    return true
  }
)

export const stopPullDownRefresh = createAsyncThunk(
  'ui/stopPullDownRefresh',
  async () => {
    return false
  }
)

/**
 * 振动反馈
 */
export const vibrate = createAsyncThunk(
  'ui/vibrate',
  async (params: {
    type: 'light' | 'medium' | 'heavy'
  }) => {
    // 这里可以实现实际的振动逻辑
    // 在支持的环境中调用振动API
    return params.type
  }
)

/**
 * 剪贴板操作
 */
export const setClipboardData = createAsyncThunk(
  'ui/setClipboardData',
  async (data: string) => {
    // 这里可以实现实际的剪贴板操作逻辑
    return data
  }
)

export const getClipboardData = createAsyncThunk(
  'ui/getClipboardData',
  async () => {
    // 这里可以实现实际的剪贴板读取逻辑
    return ''
  }
)