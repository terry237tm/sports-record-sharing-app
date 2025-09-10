/**
 * UI状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// UI状态接口
interface UIState {
  // 全局加载状态
  globalLoading: boolean
  globalLoadingText: string
  
  // 页面加载状态
  pageLoading: boolean
  pageLoadingText: string
  
  // 网络状态
  networkStatus: 'online' | 'offline' | 'unknown'
  
  // 系统信息
  systemInfo: {
    platform: string
    system: string
    version: string
    screenWidth: number
    screenHeight: number
    pixelRatio: number
    windowWidth: number
    windowHeight: number
    statusBarHeight: number
    safeArea: {
      left: number
      right: number
      top: number
      bottom: number
    }
  } | null
  
  // 主题设置
  theme: 'light' | 'dark'
  
  // 导航栏配置
  navigationBar: {
    title: string
    backgroundColor: string
    textColor: string
    showBack: boolean
    showHome: boolean
  }
  
  // TabBar配置
  tabBar: {
    current: number
    list: Array<{
      pagePath: string
      text: string
      iconPath: string
      selectedIconPath: string
    }>
  }
  
  // 弹窗状态
  modals: {
    showAuthModal: boolean
    showLocationModal: boolean
    showShareModal: boolean
    showImagePreview: boolean
    showActionSheet: boolean
  }
  
  // 提示信息
  toast: {
    show: boolean
    title: string
    icon: 'success' | 'loading' | 'none'
    duration: number
    mask: boolean
  }
  
  // 动作表单项
  actionSheetItems: Array<{
    text: string
    color?: string
    disabled?: boolean
  }>
  
  // 图片预览数据
  imagePreview: {
    urls: string[]
    current: number
    show: boolean
  }
  
  // 下拉刷新状态
  pullDownRefresh: {
    triggered: boolean
    loading: boolean
  }
  
  // 上拉加载状态
  pullUpLoad: {
    loading: boolean
    hasMore: boolean
    noMoreText: string
  }
  
  // 滚动位置
  scrollPositions: Record<string, number>
}

// 初始状态
const initialState: UIState = {
  globalLoading: false,
  globalLoadingText: '加载中...',
  
  pageLoading: false,
  pageLoadingText: '页面加载中...',
  
  networkStatus: 'online',
  
  systemInfo: null,
  
  theme: 'light',
  
  navigationBar: {
    title: '运动记录',
    backgroundColor: '#FF6B35',
    textColor: '#FFFFFF',
    showBack: true,
    showHome: false
  },
  
  tabBar: {
    current: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/assets/icons/home.png',
        selectedIconPath: '/assets/icons/home-active.png'
      },
      {
        pagePath: '/pages/history/index',
        text: '记录',
        iconPath: '/assets/icons/record.png',
        selectedIconPath: '/assets/icons/record-active.png'
      },
      {
        pagePath: '/pages/share/index',
        text: '分享',
        iconPath: '/assets/icons/share.png',
        selectedIconPath: '/assets/icons/share-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconPath: '/assets/icons/profile.png',
        selectedIconPath: '/assets/icons/profile-active.png'
      }
    ]
  },
  
  modals: {
    showAuthModal: false,
    showLocationModal: false,
    showShareModal: false,
    showImagePreview: false,
    showActionSheet: false
  },
  
  toast: {
    show: false,
    title: '',
    icon: 'none',
    duration: 2000,
    mask: false
  },
  
  actionSheetItems: [],
  
  imagePreview: {
    urls: [],
    current: 0,
    show: false
  },
  
  pullDownRefresh: {
    triggered: false,
    loading: false
  },
  
  pullUpLoad: {
    loading: false,
    hasMore: true,
    noMoreText: '没有更多了'
  },
  
  scrollPositions: {}
}

// 创建 slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 设置全局加载状态
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; text?: string }>) => {
      state.globalLoading = action.payload.loading
      if (action.payload.text) {
        state.globalLoadingText = action.payload.text
      }
    },
    
    // 设置页面加载状态
    setPageLoading: (state, action: PayloadAction<{ loading: boolean; text?: string }>) => {
      state.pageLoading = action.payload.loading
      if (action.payload.text) {
        state.pageLoadingText = action.payload.text
      }
    },
    
    // 设置网络状态
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline' | 'unknown'>) => {
      state.networkStatus = action.payload
    },
    
    // 设置系统信息
    setSystemInfo: (state, action: PayloadAction<UIState['systemInfo']>) => {
      state.systemInfo = action.payload
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    
    // 设置导航栏配置
    setNavigationBar: (state, action: PayloadAction<Partial<UIState['navigationBar']>>) => {
      state.navigationBar = { ...state.navigationBar, ...action.payload }
    },
    
    // 设置TabBar当前项
    setTabBarCurrent: (state, action: PayloadAction<number>) => {
      state.tabBar.current = action.payload
    },
    
    // 设置TabBar列表
    setTabBarList: (state, action: PayloadAction<UIState['tabBar']['list']>) => {
      state.tabBar.list = action.payload
    },
    
    // 设置弹窗显示状态
    setModalVisible: (state, action: PayloadAction<{ modal: keyof UIState['modals']; visible: boolean }>) => {
      state.modals[action.payload.modal] = action.payload.visible
    },
    
    // 设置Toast信息
    showToast: (state, action: PayloadAction<Partial<UIState['toast']>>) => {
      state.toast = { ...state.toast, ...action.payload, show: true }
    },
    
    // 隐藏Toast
    hideToast: (state) => {
      state.toast.show = false
    },
    
    // 设置动作表单项
    setActionSheetItems: (state, action: PayloadAction<UIState['actionSheetItems']>) => {
      state.actionSheetItems = action.payload
    },
    
    // 设置图片预览数据
    setImagePreview: (state, action: PayloadAction<Partial<UIState['imagePreview']>>) => {
      state.imagePreview = { ...state.imagePreview, ...action.payload }
    },
    
    // 显示图片预览
    showImagePreview: (state, action: PayloadAction<{ urls: string[]; current?: number }>) => {
      state.imagePreview = {
        urls: action.payload.urls,
        current: action.payload.current || 0,
        show: true
      }
      state.modals.showImagePreview = true
    },
    
    // 隐藏图片预览
    hideImagePreview: (state) => {
      state.imagePreview.show = false
      state.modals.showImagePreview = false
    },
    
    // 设置下拉刷新状态
    setPullDownRefresh: (state, action: PayloadAction<Partial<UIState['pullDownRefresh']>>) => {
      state.pullDownRefresh = { ...state.pullDownRefresh, ...action.payload }
    },
    
    // 设置上拉加载状态
    setPullUpLoad: (state, action: PayloadAction<Partial<UIState['pullUpLoad']>>) => {
      state.pullUpLoad = { ...state.pullUpLoad, ...action.payload }
    },
    
    // 设置滚动位置
    setScrollPosition: (state, action: PayloadAction<{ key: string; position: number }>) => {
      state.scrollPositions[action.payload.key] = action.payload.position
    },
    
    // 获取滚动位置
    getScrollPosition: (state, key: string) => {
      return state.scrollPositions[key] || 0
    },
    
    // 清除滚动位置
    clearScrollPosition: (state, action: PayloadAction<string>) => {
      delete state.scrollPositions[action.payload]
    },
    
    // 重置所有弹窗状态
    resetModals: (state) => {
      state.modals = initialState.modals
    },
    
    // 重置所有状态
    resetState: () => initialState
  }
})

// 导出 actions
export const {
  setGlobalLoading,
  setPageLoading,
  setNetworkStatus,
  setSystemInfo,
  setTheme,
  setNavigationBar,
  setTabBarCurrent,
  setTabBarList,
  setModalVisible,
  showToast,
  hideToast,
  setActionSheetItems,
  setImagePreview,
  showImagePreview,
  hideImagePreview,
  setPullDownRefresh,
  setPullUpLoad,
  setScrollPosition,
  clearScrollPosition,
  resetModals,
  resetState
} = uiSlice.actions

// 导出 reducer
export default uiSlice.reducer

// 导出 selectors
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading
export const selectGlobalLoadingText = (state: { ui: UIState }) => state.ui.globalLoadingText
export const selectPageLoading = (state: { ui: UIState }) => state.ui.pageLoading
export const selectNetworkStatus = (state: { ui: UIState }) => state.ui.networkStatus
export const selectSystemInfo = (state: { ui: UIState }) => state.ui.systemInfo
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectNavigationBar = (state: { ui: UIState }) => state.ui.navigationBar
export const selectTabBarCurrent = (state: { ui: UIState }) => state.ui.tabBar.current
export const selectTabBarList = (state: { ui: UIState }) => state.ui.tabBar.list
export const selectModals = (state: { ui: UIState }) => state.ui.modals
export const selectToast = (state: { ui: UIState }) => state.ui.toast
export const selectActionSheetItems = (state: { ui: UIState }) => state.ui.actionSheetItems
export const selectImagePreview = (state: { ui: UIState }) => state.ui.imagePreview
export const selectPullDownRefresh = (state: { ui: UIState }) => state.ui.pullDownRefresh
export const selectPullUpLoad = (state: { ui: UIState }) => state.ui.pullUpLoad
export const selectScrollPositions = (state: { ui: UIState }) => state.ui.scrollPositions

// 获取特定弹窗状态
export const selectModalVisible = (modal: keyof UIState['modals']) => 
  (state: { ui: UIState }) => state.ui.modals[modal]

// 获取特定滚动位置
export const selectScrollPosition = (key: string) => 
  (state: { ui: UIState }) => state.ui.scrollPositions[key] || 0

// 主题相关工具函数
export const getThemeColors = (theme: 'light' | 'dark') => {
  const colors = {
    light: {
      primary: '#FF6B35',
      secondary: '#4ECDC4',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#333333',
      textSecondary: '#666666',
      border: '#E5E5E5',
      error: '#FF4444',
      warning: '#FFB800',
      success: '#52C41A'
    },
    dark: {
      primary: '#FF8A65',
      secondary: '#80CBC4',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#333333',
      error: '#FF6B6B',
      warning: '#FFD93D',
      success: '#6DD400'
    }
  }
  return colors[theme]
}

// 响应式断点
export const responsiveBreakpoints = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}

// 检查设备类型
export const getDeviceType = (systemInfo: UIState['systemInfo']) => {
  if (!systemInfo) return 'unknown'
  
  const { screenWidth, screenHeight } = systemInfo
  const aspectRatio = screenHeight / screenWidth
  
  if (screenWidth <= responsiveBreakpoints.sm) {
    return 'phone'
  } else if (screenWidth <= responsiveBreakpoints.md) {
    return 'small-tablet'
  } else if (screenWidth <= responsiveBreakpoints.lg) {
    return 'large-tablet'
  } else {
    return 'desktop'
  }
}

// 检查是否为iPhone X系列（有刘海）
export const isIPhoneXSeries = (systemInfo: UIState['systemInfo']) => {
  if (!systemInfo) return false
  
  const { screenHeight, statusBarHeight } = systemInfo
  return /iphone/xi.test(systemInfo.system) && screenHeight >= 812 && statusBarHeight >= 44
}

// 默认Toast配置
export const defaultToastConfig = {
  duration: 2000,
  mask: false,
  icon: 'none' as const
}

// 默认动作表配置
export const defaultActionSheetConfig = {
  itemColor: '#333333',
  itemDisabledColor: '#CCCCCC'
}

// 默认图片预览配置
export const defaultImagePreviewConfig = {
  current: 0,
  show: false
}

// 默认导航栏配置
export const defaultNavigationBarConfig = {
  title: '运动记录',
  backgroundColor: '#FF6B35',
  textColor: '#FFFFFF',
  showBack: true,
  showHome: false
}

// 默认TabBar配置
export const defaultTabBarConfig = {
  current: 0,
  list: [
    {
      pagePath: '/pages/index/index',
      text: '首页',
      iconPath: '/assets/icons/home.png',
      selectedIconPath: '/assets/icons/home-active.png'
    },
    {
      pagePath: '/pages/history/index',
      text: '记录',
      iconPath: '/assets/icons/record.png',
      selectedIconPath: '/assets/icons/record-active.png'
    },
    {
      pagePath: '/pages/share/index',
      text: '分享',
      iconPath: '/assets/icons/share.png',
      selectedIconPath: '/assets/icons/share-active.png'
    },
    {
      pagePath: '/pages/profile/index',
      text: '我的',
      iconPath: '/assets/icons/profile.png',
      selectedIconPath: '/assets/icons/profile-active.png'
    }
  ]
}

// UI工具函数
export const uiUtils = {
  getThemeColors,
  getDeviceType,
  isIPhoneXSeries,
  responsiveBreakpoints,
  defaultToastConfig,
  defaultActionSheetConfig,
  defaultImagePreviewConfig,
  defaultNavigationBarConfig,
  defaultTabBarConfig
} as const

export type UIUtils = typeof uiUtils
export type { UIState } from './uiSlice'
export type { UIState as TUIState } from './uiSlice'

// 默认导出UI工具函数
export default uiUtils

// 重新导出所有UI相关类型
export type {
  UIState as TUIState,
  SystemInfo as TSystemInfo,
  NavigationBar as TNavigationBar,
  TabBar as TTabBar,
  Modals as TModals,
  Toast as TToast,
  ActionSheetItems as TActionSheetItems,
  ImagePreview as TImagePreview,
  PullDownRefresh as TPullDownRefresh,
  PullUpLoad as TPullUpLoad
} from './uiSlice'