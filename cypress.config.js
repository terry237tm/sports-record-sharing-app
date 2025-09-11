/**
 * Cypress 配置文件
 * 用于运动记录分享小程序的E2E测试和组件测试
 */

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // E2E测试配置
  e2e: {
    // 基础URL
    baseUrl: 'http://localhost:10086',
    
    // 测试文件目录
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // 支持文件
    supportFile: 'cypress/support/e2e.ts',
    
    // 测试超时时间
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // 视口配置
    viewportWidth: 375,
    viewportHeight: 667,
    
    // 视频录制
    video: true,
    videoCompression: 32,
    videoUploadOnPasses: false,
    
    // 截图配置
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // 测试重试
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // 环境变量
    env: {
      // 小程序环境
      WEAPP_ENV: 'test',
      
      // 测试用户
      TEST_USER: {
        openid: 'test-openid',
        nickname: '测试用户',
        avatar: '/assets/images/default-avatar.png'
      },
      
      // CloudBase配置
      CLOUDBASE_ENV: 'taro-sports-record-sharing-test',
      
      // 测试数据
      TEST_DATA: {
        sportTypes: ['running', 'cycling', 'swimming', 'fitness', 'other'],
        durations: [15, 30, 45, 60, 90],
        distances: [1.5, 3.2, 5.0, 10.5, 21.1],
        calories: [100, 250, 400, 600, 800]
      }
    },
    
    // 测试前准备
    setupNodeEvents(on, config) {
      // 加载环境变量
      require('dotenv').config()
      
      // 配置测试报告
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        table(message) {
          console.table(message)
          return null
        }
      })
      
      return config
    }
  },
  
  // 组件测试配置
  component: {
    // 开发服务器配置
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js')
    },
    
    // 测试文件目录
    specPattern: 'src/components/**/*.cy.{js,jsx,ts,tsx}',
    
    // 支持文件
    supportFile: 'cypress/support/component.ts',
    
    // 视口配置
    viewportWidth: 375,
    viewportHeight: 667,
    
    // 测试超时时间
    defaultCommandTimeout: 5000
  },
  
  // 全局配置
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  
  // 报告配置
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: true,
    json: true
  },
  
  // 文件上传配置
  fileServerFolder: 'dist',
  fixturesFolder: 'cypress/fixtures',
  
  // 动画等待
  waitForAnimations: true,
  animationDistanceThreshold: 5,
  
  // 键盘和鼠标事件
  keystrokeDelay: 10,
  
  // 测试隔离
  testIsolation: true,
  
  // 实验性功能
  experimentalFetchPolyfill: true,
  experimentalInteractiveRunEvents: true,
  experimentalModifyObstructiveThirdPartyCode: true,
  experimentalSkipDomainInjection: [],
  experimentalOriginDependencies: false,
  experimentalSourceRewriting: false,
  experimentalSingleTabRunMode: false
})