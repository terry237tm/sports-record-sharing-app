/**
 * 代码覆盖率配置
 * 详细的代码覆盖率报告和分析配置
 */

module.exports = {
  // 覆盖率报告配置
  coverageConfig: {
    // 报告格式
    reporters: [
      'text',           // 控制台输出
      'text-summary',   // 控制台摘要
      'html',          // HTML报告
      'lcov',          // LCOV格式（用于CI）
      'json-summary',  // JSON摘要
      'json'           // 完整JSON数据
    ],
    
    // 报告输出目录
    directory: 'coverage',
    
    // 覆盖率提供程序
    provider: 'v8',
    
    // 是否包含未覆盖的文件
    includeUntested: true,
    
    // 是否跳过完整文件
    skipFull: false,
    
    // 水印配置（覆盖率阈值可视化）
    watermarks: {
      statements: [70, 90],
      functions: [70, 90],
      branches: [70, 90],
      lines: [70, 90]
    }
  },
  
  // 覆盖率阈值配置
  thresholds: {
    // 全局阈值
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    },
    
    // 按文件类型设置不同的阈值
    byFileType: {
      // 核心服务文件 - 更高的覆盖率要求
      'src/services/**/*.ts': {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      },
      
      // 工具函数 - 高覆盖率要求
      'src/utils/**/*.ts': {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      
      // 组件文件 - 中等覆盖率要求
      'src/components/**/*.tsx': {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75
      },
      
      // Hooks - 高覆盖率要求
      'src/hooks/**/*.ts': {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      
      // Store/状态管理 - 高覆盖率要求
      'src/store/**/*.ts': {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      
      // 页面组件 - 中等覆盖率要求
      'src/pages/**/*.tsx': {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70
      },
      
      // 类型定义文件 - 低覆盖率要求（主要是类型）
      'src/types/**/*.ts': {
        statements: 30,
        branches: 20,
        functions: 30,
        lines: 30
      },
      
      // 配置文件 - 低覆盖率要求
      'src/config/**/*.ts': {
        statements: 30,
        branches: 20,
        functions: 30,
        lines: 30
      }
    }
  },
  
  // 覆盖率收集配置
  collectFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/mocks/**',
    '!src/index.ts',
    '!src/app.{ts,tsx}',
    '!src/app.config.ts'
  ],
  
  // 覆盖率排除配置
  exclude: [
    // 第三方库
    '**/node_modules/**',
    
    // 构建输出
    '**/dist/**',
    '**/build/**',
    '**/.temp/**',
    '**/miniprogram/**',
    
    // 测试文件
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/tests/**',
    '**/test/**',
    
    // Mock文件
    '**/mocks/**',
    '**/__mocks__/**',
    
    // 配置文件
    '**/*.config.*',
    '**/config/**',
    
    // 声明文件
    '**/*.d.ts',
    
    // 故事文件
    '**/*.stories.*',
    '**/*.story.*',
    
    // 文档
    '**/*.md',
    '**/docs/**',
    
    // 脚本和工具
    '**/scripts/**',
    '**/tools/**',
    '**/bin/**',
    
    // 云函数
    '**/cloud-functions/**',
    '**/cloudfunctions/**'
  ],
  
  // 覆盖率分析配置
  analysis: {
    // 详细的覆盖率分析
    detailed: true,
    
    // 显示未覆盖的行
    showUncoveredLines: true,
    
    // 显示分支覆盖详情
    showBranchCoverage: true,
    
    // 按文件大小排序
    sortBySize: true,
    
    // 按覆盖率排序
    sortByCoverage: false,
    
    // 生成趋势报告
    generateTrends: true,
    
    // 趋势报告文件
    trendsFile: 'coverage/coverage-trends.json'
  },
  
  // 报告生成配置
  reports: {
    // HTML报告配置
    html: {
      // 输出目录
      output: 'coverage/html',
      
      // 页面标题
      title: '运动记录分享小程序 - 测试覆盖率报告',
      
      // 是否包含源码
      includeSource: true,
      
      // 是否包含测试用例
      includeTests: true,
      
      // 主题
      theme: 'dark',
      
      // 自定义样式
      customCSS: `
        .header h1 { color: #1890ff; }
        .metric.good { color: #52c41a; }
        .metric.warning { color: #faad14; }
        .metric.bad { color: #f5222d; }
      `
    },
    
    // JSON报告配置
    json: {
      output: 'coverage/coverage-final.json',
      includeSources: true,
      includeTests: true
    },
    
    // LCOV报告配置
    lcov: {
      output: 'coverage/lcov.info',
      includeSources: true
    },
    
    // 文本报告配置
    text: {
      // 显示文件详情
      showFileDetails: true,
      
      // 显示摘要
      showSummary: true,
      
      // 显示未覆盖的行
      showUncoveredLines: true,
      
      // 排序方式
      sortBy: 'coverage' // 'coverage', 'name', 'size'
    }
  },
  
  // CI/CD集成配置
  ci: {
    // 是否在CI环境中失败
    failOnLowCoverage: false,
    
    // 覆盖率下降阈值
    coverageDropThreshold: 5, // 5%
    
    // 生成CI友好的报告
    generateCIReports: true,
    
    // CI报告格式
    ciReports: ['text-summary', 'lcov'],
    
    // 上传到覆盖率服务
    uploadToServices: [
      {
        name: 'codecov',
        enabled: false,
        config: {
          token: process.env.CODECOV_TOKEN
        }
      },
      {
        name: 'coveralls',
        enabled: false,
        config: {
          token: process.env.COVERALLS_TOKEN
        }
      }
    ]
  },
  
  // 性能优化配置
  performance: {
    // 并行处理文件数
    parallelFiles: 4,
    
    // 缓存覆盖率数据
    cache: true,
    
    // 缓存目录
    cacheDir: '.coverage-cache',
    
    // 内存限制（MB）
    memoryLimit: 512,
    
    // 超时时间（秒）
    timeout: 300
  },
  
  // 调试配置
  debug: {
    // 启用调试模式
    enabled: false,
    
    // 调试输出目录
    outputDir: 'coverage/debug',
    
    // 记录详细日志
    verbose: false,
    
    // 记录性能数据
    profile: false
  }
}

/**
 * 获取覆盖率配置
 * @param {string} env - 环境变量
 * @returns {Object}
 */
function getCoverageConfig(env = process.env.NODE_ENV) {
  const baseConfig = module.exports.coverageConfig
  
  // 根据环境调整配置
  if (env === 'development') {
    return {
      ...baseConfig,
      thresholds: {
        global: {
          statements: 50,
          branches: 40,
          functions: 50,
          lines: 50
        }
      }
    }
  }
  
  if (env === 'production') {
    return {
      ...baseConfig,
      thresholds: {
        global: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85
        }
      }
    }
  }
  
  return baseConfig
}

module.exports.getCoverageConfig = getCoverageConfig