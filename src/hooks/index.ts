/**
 * Hooks 统一导出文件
 * 所有自定义 Hook 的入口文件
 */

// 位置相关 Hooks
export { useLocationPermission } from './useLocationPermission';
export { useLocation } from './useLocation';
export { useLocationEcosystem } from './useLocationEcosystem';

// 图片相关 Hooks
export { useImagePicker } from './useImagePicker';
export { useImageUpload } from './useImageUpload';
export { useImageCompression } from './useImageCompression';

// 运动数据相关 Hooks
export { useSportData } from './useSportData';
export { useSportTypes } from './useSportTypes';

// 通用 Hooks
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { useLocalStorage } from './useLocalStorage';
export { useNetworkStatus } from './useNetworkStatus';

// 导出类型定义
export type { 
  UseLocationPermissionReturn,
  LocationPermissionOptions 
} from './useLocationPermission';

export type { 
  UseLocationReturn,
  LocationOptions 
} from './useLocation';

export type { 
  UseLocationEcosystemReturn,
  UseLocationEcosystemOptions 
} from './useLocationEcosystem';

export type { 
  UseImagePickerReturn,
  ImagePickerOptions 
} from './useImagePicker';

export type { 
  UseImageUploadReturn,
  ImageUploadOptions 
} from './useImageUpload';

export type { 
  UseImageCompressionReturn,
  ImageCompressionOptions 
} from './useImageCompression';

export type { 
  UseSportDataReturn,
  SportDataOptions 
} from './useSportData';

export type { 
  UseSportTypesReturn,
  SportTypesOptions 
} from './useSportTypes';