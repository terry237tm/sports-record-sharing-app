/**
 * Jest 配置文件
 * 用于运动记录分享小程序的单元测试和集成测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 预设配置 - 使用支持JS和TS的预设
  preset: 'ts-jest/presets/js-with-ts',
  
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 扩展测试环境 - 支持小程序环境模拟
  testEnvironmentOptions: {
    url: 'http://localhost',
    // 启用自定义的全局变量模拟
    customExportConditions: ['node', 'node-addons']
  }
  
  // 根目录
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 模块路径映射（与 tsconfig.json 保持一致）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // 转换器配置 - 增强TypeScript支持
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: 'node',
          target: 'es2017',
          lib: ['es2017', 'dom'],
          types: ['jest', '@testing-library/jest-dom', '@tarojs/taro']
        },
        isolatedModules: true, // 提高转换性能
        diagnostics: {
          warnOnly: true // 在测试环境中允许类型警告
        }
      }
    ],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // 转换忽略配置 - 扩展需要转换的包
  transformIgnorePatterns: [
    'node_modules/(?!(taro-ui|@tarojs|@babel|@reduxjs)/)'
  ],
  
  // 覆盖率配置 - 优化收集规则
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.{ts,tsx}',
    '!src/app.config.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}', // 排除故事文件
    '!src/**/__tests__/**', // 排除测试目录
    '!src/**/mocks/**' // 排除mock目录
  
  // 覆盖率阈值 - 设置合理的覆盖率目标
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // 为关键模块设置更高的覆盖率要求
    './src/services/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/utils/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 覆盖率报告格式 - 添加更多报告格式
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'text-summary'],
  
  // 详细的覆盖率报告配置
  coverageDirectory: 'coverage',
  coverageProvider: 'v8' // 使用V8引擎提供更好的覆盖率数据
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 测试超时时间
  testTimeout: 10000,
  
  // 清除全局变量配置（已移至transform配置中）
  
  // 模拟模块
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/cloud-functions/'
  ],
  
  // 模拟模块 - 扩展忽略模式
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/cloud-functions/',
    '<rootDir>/miniprogram/', // 排除小程序编译目录
    '<rootDir>/.temp/' // 排除临时目录
  ],
  
  // 模块路径映射扩展 - 添加更多别名支持
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|ico|bmp)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(woff|woff2|eot|ttf|otf)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(mp3|mp4|wav|avi|mov)$': '<rootDir>/tests/__mocks__/fileMock.js'
  }
}