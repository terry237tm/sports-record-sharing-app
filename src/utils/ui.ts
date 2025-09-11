/**
 * UI工具函数
 * 提供常用的UI交互功能，如Toast、Modal、Loading等
 */

import Taro from '@tarojs/taro'

/**
 * 显示Toast提示
 */
interface ToastOptions {
  title: string
  icon?: 'success' | 'loading' | 'none'
  duration?: number
  mask?: boolean
}

export function showToast(options: ToastOptions): Promise<void> {
  return new Promise((resolve) => {
    Taro.showToast({
      title: options.title,
      icon: options.icon || 'none',
      duration: options.duration || 2000,
      mask: options.mask || false,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 显示Loading
 */
interface LoadingOptions {
  title?: string
  mask?: boolean
}

export function showLoading(options: LoadingOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    Taro.showLoading({
      title: options.title || '加载中...',
      mask: options.mask !== false,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 隐藏Loading
 */
export function hideLoading(): Promise<void> {
  return new Promise((resolve) => {
    Taro.hideLoading({
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 显示Modal对话框
 */
interface ModalOptions {
  title?: string
  content: string
  showCancel?: boolean
  cancelText?: string
  cancelColor?: string
  confirmText?: string
  confirmColor?: string
  editable?: boolean
  placeholderText?: string
}

interface ModalResult {
  confirm: boolean
  cancel: boolean
  content?: string
}

export function showModal(options: ModalOptions): Promise<ModalResult> {
  return new Promise((resolve) => {
    Taro.showModal({
      title: options.title,
      content: options.content,
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      cancelColor: options.cancelColor || '#000000',
      confirmText: options.confirmText || '确定',
      confirmColor: options.confirmColor || '#576B95',
      editable: options.editable,
      placeholderText: options.placeholderText,
      success: (res) => {
        resolve({
          confirm: res.confirm,
          cancel: res.cancel,
          content: res.content
        })
      },
      fail: () => {
        resolve({
          confirm: false,
          cancel: true
        })
      }
    })
  })
}

/**
 * 显示ActionSheet操作菜单
 */
interface ActionSheetOptions {
  itemList: string[]
  itemColor?: string
  alertText?: string
}

interface ActionSheetResult {
  tapIndex: number
  cancel: boolean
}

export function showActionSheet(options: ActionSheetOptions): Promise<ActionSheetResult> {
  return new Promise((resolve) => {
    Taro.showActionSheet({
      itemList: options.itemList,
      itemColor: options.itemColor,
      alertText: options.alertText,
      success: (res) => {
        resolve({
          tapIndex: res.tapIndex,
          cancel: false
        })
      },
      fail: () => {
        resolve({
          tapIndex: -1,
          cancel: true
        })
      }
    })
  })
}

/**
 * 显示顶部导航栏加载动画
 */
export function showNavigationBarLoading(): Promise<void> {
  return new Promise((resolve) => {
    Taro.showNavigationBarLoading({
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 隐藏顶部导航栏加载动画
 */
export function hideNavigationBarLoading(): Promise<void> {
  return new Promise((resolve) => {
    Taro.hideNavigationBarLoading({
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 设置导航栏标题
 */
interface SetNavigationBarTitleOptions {
  title: string
}

export function setNavigationBarTitle(options: SetNavigationBarTitleOptions): Promise<void> {
  return new Promise((resolve) => {
    Taro.setNavigationBarTitle({
      title: options.title,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 设置导航栏颜色
 */
interface SetNavigationBarColorOptions {
  frontColor: '#000000' | '#ffffff'
  backgroundColor: string
  animation?: {
    duration: number
    timingFunc: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  }
}

export function setNavigationBarColor(options: SetNavigationBarColorOptions): Promise<void> {
  return new Promise((resolve) => {
    Taro.setNavigationBarColor({
      frontColor: options.frontColor,
      backgroundColor: options.backgroundColor,
      animation: options.animation,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 显示操作菜单
 */
interface ShowShareMenuOptions {
  withShareTicket?: boolean
  menus?: Array<'shareAppMessage' | 'shareTimeline'>
}

export function showShareMenu(options: ShowShareMenuOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    Taro.showShareMenu({
      withShareTicket: options.withShareTicket,
      menus: options.menus,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 隐藏操作菜单
 */
export function hideShareMenu(): Promise<void> {
  return new Promise((resolve) => {
    Taro.hideShareMenu({
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 设置页面是否支持滚动
 */
export function setPageScrollable(scrollable: boolean): void {
  if (scrollable) {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  }
}

/**
 * 滚动到页面顶部
 */
interface PageScrollToOptions {
  scrollTop: number
  duration?: number
  selector?: string
}

export function pageScrollTo(options: PageScrollToOptions): Promise<void> {
  return new Promise((resolve) => {
    Taro.pageScrollTo({
      scrollTop: options.scrollTop,
      duration: options.duration || 300,
      selector: options.selector,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

/**
 * 设置页面标题
 */
export function setPageTitle(title: string): void {
  setNavigationBarTitle({ title })
}

/**
 * 显示成功提示
 */
export function showSuccessToast(title: string, duration = 2000): Promise<void> {
  return showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示错误提示
 */
export function showErrorToast(title: string, duration = 2000): Promise<void> {
  return showToast({
    title,
    icon: 'none',
    duration
  })
}

/**
 * 显示加载提示
 */
export function showLoadingToast(title = '加载中...'): Promise<void> {
  return showToast({
    title,
    icon: 'loading',
    duration: 10000, // 长时间显示，需要手动隐藏
    mask: true
  })
}

/**
 * 显示确认对话框
 */
interface ConfirmOptions {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
}

export async function showConfirm(options: ConfirmOptions): Promise<boolean> {
  const result = await showModal({
    title: options.title,
    content: options.content,
    confirmText: options.confirmText,
    cancelText: options.cancelText
  })
  
  return result.confirm
}

/**
 * 显示输入对话框
 */
interface PromptOptions {
  title?: string
  content: string
  placeholderText?: string
  confirmText?: string
  cancelText?: string
}

interface PromptResult {
  confirmed: boolean
  value?: string
}

export async function showPrompt(options: PromptOptions): Promise<PromptResult> {
  const result = await showModal({
    title: options.title,
    content: options.content,
    placeholderText: options.placeholderText,
    confirmText: options.confirmText,
    cancelText: options.cancelText,
    editable: true
  })
  
  return {
    confirmed: result.confirm,
    value: result.content
  }
}

/**
 * 显示操作菜单
 */
export async function showActionMenu(items: string[]): Promise<number> {
  const result = await showActionSheet({
    itemList: items
  })
  
  return result.cancel ? -1 : result.tapIndex
}

/**
 * 显示分享菜单
 */
export async function showShareDialog(): Promise<void> {
  await showShareMenu()
}

/**
 * 隐藏分享菜单
 */
export async function hideShareDialog(): Promise<void> {
  await hideShareMenu()
}

// 默认导出所有函数
export default {
  showToast,
  showLoading,
  hideLoading,
  showModal,
  showActionSheet,
  showNavigationBarLoading,
  hideNavigationBarLoading,
  setNavigationBarTitle,
  setNavigationBarColor,
  showShareMenu,
  hideShareMenu,
  setPageScrollable,
  pageScrollTo,
  setPageTitle,
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  showConfirm,
  showPrompt,
  showActionMenu,
  showShareDialog,
  hideShareDialog
}