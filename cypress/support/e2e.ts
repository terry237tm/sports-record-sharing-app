/**
 * Cypress E2E测试支持文件
 * 导入全局命令和自定义命令
 */

// 导入全局类型
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 登录小程序
       */
      login(): Chainable<void>
      
      /**
       * 登出小程序
       */
      logout(): Chainable<void>
      
      /**
       * 获取运动记录列表
       */
      getSportRecords(): Chainable<any[]>
      
      /**
       * 创建运动记录
       */
      createSportRecord(record: any): Chainable<any>
      
      /**
       * 删除运动记录
       */
      deleteSportRecord(recordId: string): Chainable<void>
      
      /**
       * 上传图片
       */
      uploadImage(fileName: string): Chainable<string>
      
      /**
       * 获取地理位置
       */
      getLocation(): Chainable<{ latitude: number; longitude: number }>
      
      /**
       * 等待小程序页面加载
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * 检查页面元素是否存在
       */
      checkElementExists(selector: string): Chainable<boolean>
      
      /**
       * 获取小程序页面数据
       */
      getPageData(): Chainable<any>
      
      /**
       * 设置小程序页面数据
       */
      setPageData(data: any): Chainable<void>
      
      /**
       * 模拟微信API调用
       */
      mockWechatAPI(apiName: string, response: any): Chainable<void>
      
      /**
       * 清除所有模拟
       */
      clearAllMocks(): Chainable<void>
    }
  }
}

// 导入测试工具函数
import './commands'

// 设置全局配置
Cypress.on('uncaught:exception', (err, runnable) => {
  // 防止小程序API报错中断测试
  if (err.message.includes('wx') || err.message.includes('getCurrentPages')) {
    return false
  }
})

// 测试前准备
beforeEach(() => {
  // 清除所有cookies和localStorage
  cy.clearCookies()
  cy.clearLocalStorage()
  
  // 设置viewport为iPhone尺寸
  cy.viewport(375, 667)
  
  // 等待页面加载
  cy.waitForPageLoad()
})

// 测试后清理
afterEach(() => {
  // 清除所有模拟
  cy.clearAllMocks()
})