/**
 * 分享功能状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ShareImageData, ShareResult, SharePlatform, ShareTemplateType } from '@/types'

// 分享状态接口
interface ShareState {
  // 分享图片数据
  shareImageData: ShareImageData | null
  
  // Canvas 相关
  canvas: HTMLCanvasElement | null
  canvasLoading: boolean
  canvasError: string | null
  
  // 分享状态
  shareLoading: boolean
  shareError: string | null
  shareResults: ShareResult[]
  
  // 选中的模板
  selectedTemplate: ShareTemplateType
  
  // 图片生成状态
  imageGenerating: boolean
  imageGenerateError: string | null
  generatedImageUrl: string | null
  
  // 保存状态
  saveLoading: boolean
  saveError: string | null
  savedImagePath: string | null
}

// 初始状态
const initialState: ShareState = {
  shareImageData: null,
  canvas: null,
  canvasLoading: false,
  canvasError: null,
  shareLoading: false,
  shareError: null,
  shareResults: [],
  selectedTemplate: ShareTemplateType.STANDARD,
  imageGenerating: false,
  imageGenerateError: null,
  generatedImageUrl: null,
  saveLoading: false,
  saveError: null,
  savedImagePath: null
}

// 创建 slice
const shareSlice = createSlice({
  name: 'share',
  initialState,
  reducers: {
    // 设置分享图片数据
    setShareImageData: (state, action: PayloadAction<ShareImageData | null>) => {
      state.shareImageData = action.payload
    },
    
    // 设置Canvas元素
    setCanvas: (state, action: PayloadAction<HTMLCanvasElement | null>) => {
      state.canvas = action.payload
    },
    
    // 设置Canvas加载状态
    setCanvasLoading: (state, action: PayloadAction<boolean>) => {
      state.canvasLoading = action.payload
    },
    
    // 设置Canvas错误
    setCanvasError: (state, action: PayloadAction<string | null>) => {
      state.canvasError = action.payload
    },
    
    // 设置分享加载状态
    setShareLoading: (state, action: PayloadAction<boolean>) => {
      state.shareLoading = action.payload
    },
    
    // 设置分享错误
    setShareError: (state, action: PayloadAction<string | null>) => {
      state.shareError = action.payload
    },
    
    // 添加分享结果
    addShareResult: (state, action: PayloadAction<ShareResult>) => {
      state.shareResults = [...state.shareResults, action.payload]
    },
    
    // 清除分享结果
    clearShareResults: (state) => {
      state.shareResults = []
    },
    
    // 设置选中的模板
    setSelectedTemplate: (state, action: PayloadAction<ShareTemplateType>) => {
      state.selectedTemplate = action.payload
    },
    
    // 设置图片生成状态
    setImageGenerating: (state, action: PayloadAction<boolean>) => {
      state.imageGenerating = action.payload
    },
    
    // 设置图片生成错误
    setImageGenerateError: (state, action: PayloadAction<string | null>) => {
      state.imageGenerateError = action.payload
    },
    
    // 设置生成的图片URL
    setGeneratedImageUrl: (state, action: PayloadAction<string | null>) => {
      state.generatedImageUrl = action.payload
    },
    
    // 设置保存加载状态
    setSaveLoading: (state, action: PayloadAction<boolean>) => {
      state.saveLoading = action.payload
    },
    
    // 设置保存错误
    setSaveError: (state, action: PayloadAction<string | null>) => {
      state.saveError = action.payload
    },
    
    // 设置保存的图片路径
    setSavedImagePath: (state, action: PayloadAction<string | null>) => {
      state.savedImagePath = action.payload
    },
    
    // 重置分享状态
    resetShareState: (state) => {
      return {
        ...initialState,
        selectedTemplate: state.selectedTemplate // 保留模板选择
      }
    },
    
    // 重置所有状态
    resetState: (state) => {
      return initialState
    }
  }
})

// 导出 actions
export const {
  setShareImageData,
  setCanvas,
  setCanvasLoading,
  setCanvasError,
  setShareLoading,
  setShareError,
  addShareResult,
  clearShareResults,
  setSelectedTemplate,
  setImageGenerating,
  setImageGenerateError,
  setGeneratedImageUrl,
  setSaveLoading,
  setSaveError,
  setSavedImagePath,
  resetShareState,
  resetState
} = shareSlice.actions

// 导出 reducer
export default shareSlice.reducer

// 导出 selectors
export const selectShareImageData = (state: { share: ShareState }) => state.share.shareImageData
export const selectCanvas = (state: { share: ShareState }) => state.share.canvas
export const selectCanvasLoading = (state: { share: ShareState }) => state.share.canvasLoading
export const selectShareLoading = (state: { share: ShareState }) => state.share.shareLoading
export const selectShareResults = (state: { share: ShareState }) => state.share.shareResults
export const selectSelectedTemplate = (state: { share: ShareState }) => state.share.selectedTemplate
export const selectImageGenerating = (state: { share: ShareState }) => state.share.imageGenerating
export const selectGeneratedImageUrl = (state: { share: ShareState }) => state.share.generatedImageUrl
export const selectSaveLoading = (state: { share: ShareState }) => state.share.saveLoading
export const selectSavedImagePath = (state: { share: ShareState }) => state.share.savedImagePath