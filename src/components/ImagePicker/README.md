# ImagePicker 图片选择器组件

## 概述

ImagePicker 是一个功能完整的图片选择、验证、压缩和预览组件，支持微信小程序和 H5 双平台。

## 功能特性

- ✅ **多平台支持**: 微信小程序和 H5 双平台兼容
- ✅ **智能验证**: 格式、大小、尺寸验证
- ✅ **高效压缩**: Canvas-based 图片压缩，支持自定义配置
- ✅ **批量处理**: 一次最多选择 9 张图片
- ✅ **实时预览**: 支持缩略图展示和全屏预览
- ✅ **错误处理**: 友好的中文错误提示
- ✅ **内存管理**: 自动清理 blob URL，防止内存泄漏
- ✅ **性能优化**: 支持跳过尺寸检查，超时保护

## 基本使用

```tsx
import React, { useState } from 'react'
import ImagePicker, { ImageItem } from '@/components/ImagePicker'

const MyComponent: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([])

  const handleImageChange = (newImages: ImageItem[]) => {
    setImages(newImages)
  }

  return (
    <ImagePicker
      value={images}
      onChange={handleImageChange}
      maxCount={9}
      maxSize={2 * 1024 * 1024} // 2MB
    />
  )
}
```

## API 参考

### ImagePicker Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | ImageItem[] | [] | 当前选中的图片列表 |
| onChange | (images: ImageItem[]) => void | - | 图片变化回调 |
| maxCount | number | 9 | 最大图片数量 |
| maxSize | number | 2MB | 最大文件大小（字节） |
| compressionConfig | CompressionConfig | - | 压缩配置 |
| showCompressButton | boolean | true | 是否显示压缩按钮 |
| autoCompress | boolean | false | 是否自动压缩 |
| hintText | string | - | 自定义提示文本 |
| disabled | boolean | false | 是否禁用 |
| onError | (error: string) => void | - | 错误回调 |
| onSuccess | (images: ImageItem[]) => void | - | 成功回调 |

### ImageItem 接口

```typescript
interface ImageItem {
  id: string                    // 唯一标识
  file?: File                  // H5 平台的文件对象
  tempFilePath?: string        // 微信小程序的临时文件路径
  url: string                  // 预览 URL
  status: 'pending' | 'compressing' | 'compressed' | 'error'
  error?: string               // 错误信息
  originalSize?: number        // 原始文件大小
  compressedSize?: number      // 压缩后大小
}
```

### CompressionConfig 配置

```typescript
interface CompressionConfig {
  maxWidth: number        // 最大宽度（默认 1280）
  maxHeight: number       // 最大高度（默认 1280）
  quality: number         // 压缩质量 0-1（默认 0.8）
  maxSize: number         // 最大文件大小（默认 2MB）
  format: 'jpeg' | 'png'  // 输出格式（默认 'jpeg'）
}
```

## 高级用法

### 自定义压缩配置

```tsx
<ImagePicker
  value={images}
  onChange={setImages}
  compressionConfig={{
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9,
    maxSize: 5 * 1024 * 1024, // 5MB
    format: 'png'
  }}
/>
```

### 自动压缩模式

```tsx
<ImagePicker
  value={images}
  onChange={setImages}
  autoCompress={true}
  showCompressButton={false}
/>
```

### 错误处理

```tsx
<ImagePicker
  value={images}
  onChange={setImages}
  onError={(error) => {
    console.error('图片处理错误:', error)
    // 显示错误提示
  }}
  onSuccess={(newImages) => {
    console.log('图片处理成功:', newImages)
  }}
/>
```

## 平台差异

### 微信小程序
- 使用 `Taro.chooseImage` 选择图片
- 通过 Canvas 进行图片压缩
- 支持拍照和相册选择
- 需要临时文件路径处理

### H5 平台
- 使用原生 `<input type="file">` 选择图片
- 通过浏览器 Canvas API 压缩
- 支持拖拽上传（可扩展）
- 自动管理 blob URL

## 错误处理

组件提供详细的错误信息，包括：

- **格式错误**: "不支持的图片格式，请使用 JPG、JPEG、PNG 格式"
- **大小错误**: "图片大小不能超过 2.0MB"
- **数量错误**: "最多只能上传 9 张图片，当前已选择 5 张"
- **尺寸错误**: "图片尺寸过大，最大支持 4096x4096 像素"
- **加载错误**: "无法读取图片信息，请检查文件是否损坏"
- **超时错误**: "图片加载超时，请检查文件是否过大或损坏"

## 性能优化

### 跳过尺寸检查
对于大批量图片处理，可以跳过尺寸检查以提高性能：

```tsx
// 在 Hook 中使用
const { selectImages } = useImagePicker({
  skipDimensionCheck: true  // 跳过尺寸验证
})
```

### 智能压缩建议
系统根据原始大小和目标大小自动推荐压缩参数：

- **轻微压缩** (ratio >= 0.8): quality 0.9, maxWidth 1920
- **中等压缩** (ratio >= 0.5): quality 0.8, maxWidth 1280
- **强力压缩** (ratio >= 0.3): quality 0.7, maxWidth 1024
- **极限压缩** (ratio < 0.3): quality 0.6, maxWidth 800

## 内存管理

- 自动清理 blob URL
- Canvas 上下文清理
- 组件卸载时资源释放
- 超时保护机制

## 样式定制

组件支持通过 SCSS 变量进行样式定制：

```scss
// 自定义主题色
$color-primary: #1890ff;
$color-error: #ff4d4f;
$color-success: #52c41a;

// 自定义间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
```

## 注意事项

1. **微信小程序**: 需要在页面中添加隐藏的 Canvas 元素用于压缩
2. **H5 平台**: 需要处理浏览器兼容性问题
3. **大文件处理**: 建议开启 `skipDimensionCheck` 选项提升性能
4. **网络环境**: 压缩过程可能需要较长时间，建议显示加载状态

## 更新日志

### v1.0.0 (2025-09-11)
- ✅ 基础图片选择功能
- ✅ 多平台兼容性
- ✅ 智能压缩算法
- ✅ 完整的错误处理
- ✅ 内存管理和性能优化
- ✅ 测试覆盖

## 相关链接

- [ImagePicker 组件源码](./index.tsx)
- [图片验证工具](../../utils/imageValidation.ts)
- [图片压缩工具](../../utils/imageCompression.ts)
- [图片选择 Hook](../../hooks/useImagePicker.ts)