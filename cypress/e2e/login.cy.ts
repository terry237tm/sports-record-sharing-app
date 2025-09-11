/**
 * 登录功能E2E测试
 * 测试小程序的登录流程
 */

describe('登录功能', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  describe('页面渲染', () => {
    it('应该显示登录页面', () => {
      cy.get('.login-page').should('be.visible')
      cy.get('[data-testid="login-title"]').should('contain', '欢迎使用运动记录分享')
      cy.get('[data-testid="login-button"]').should('be.visible')
    })

    it('应该显示用户协议和隐私政策', () => {
      cy.get('[data-testid="user-agreement"]').should('be.visible')
      cy.get('[data-testid="privacy-policy"]').should('be.visible')
    })

    it('应该显示微信登录按钮', () => {
      cy.get('[data-testid="wechat-login-button"]').should('be.visible')
      cy.get('[data-testid="wechat-login-button"]').should('contain', '微信一键登录')
    })
  })

  describe('登录交互', () => {
    it('应该处理微信登录成功', () => {
      // 模拟微信登录成功
      cy.mockWechatAPI('login', { code: 'test-code-123' })
      cy.mockWechatAPI('getUserInfo', {
        userInfo: {
          nickName: '测试用户',
          avatarUrl: '/assets/images/default-avatar.png',
          gender: 1,
          city: '北京',
          province: '北京',
          country: '中国',
          language: 'zh_CN'
        }
      })

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待登录完成
      cy.wait(1000)

      // 验证页面跳转
      cy.url().should('include', '/pages/index/index')
      
      // 验证用户信息
      cy.get('[data-testid="user-avatar"]').should('be.visible')
      cy.get('[data-testid="user-nickname"]').should('contain', '测试用户')
    })

    it('应该处理微信登录失败', () => {
      // 模拟微信登录失败
      cy.mockWechatAPI('login', { errMsg: 'login:fail' })

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待错误提示
      cy.wait(1000)

      // 验证错误提示
      cy.get('[data-testid="error-message"]').should('contain', '登录失败，请重试')
      
      // 验证仍在登录页面
      cy.url().should('include', '/pages/login/index')
    })

    it('应该处理用户拒绝授权', () => {
      // 模拟用户拒绝授权
      cy.mockWechatAPI('login', { code: 'test-code-123' })
      cy.mockWechatAPI('getUserInfo', { errMsg: 'getUserInfo:fail auth deny' })

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待处理完成
      cy.wait(1000)

      // 验证提示信息
      cy.get('[data-testid="auth-deny-message"]').should('contain', '需要您的授权才能继续使用')
    })
  })

  describe('协议和政策', () => {
    it('应该显示用户协议', () => {
      cy.get('[data-testid="user-agreement-link"]').click()
      
      // 验证协议页面
      cy.get('[data-testid="agreement-page"]').should('be.visible')
      cy.get('[data-testid="agreement-title"]').should('contain', '用户协议')
      cy.get('[data-testid="agreement-content"]').should('be.visible')
    })

    it('应该显示隐私政策', () => {
      cy.get('[data-testid="privacy-policy-link"]').click()
      
      // 验证政策页面
      cy.get('[data-testid="policy-page"]').should('be.visible')
      cy.get('[data-testid="policy-title"]').should('contain', '隐私政策')
      cy.get('[data-testid="policy-content"]').should('be.visible')
    })

    it('应该同意协议后才能登录', () => {
      // 取消协议勾选
      cy.get('[data-testid="agreement-checkbox"]').uncheck()
      
      // 验证登录按钮被禁用
      cy.get('[data-testid="wechat-login-button"]').should('be.disabled')
      
      // 重新勾选协议
      cy.get('[data-testid="agreement-checkbox"]').check()
      
      // 验证登录按钮可用
      cy.get('[data-testid="wechat-login-button"]').should('not.be.disabled')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', () => {
      // 模拟网络错误
      cy.intercept('POST', '/api/auth/login', {
        forceNetworkError: true
      }).as('loginRequest')

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待请求
      cy.wait('@loginRequest')

      // 验证错误提示
      cy.get('[data-testid="network-error-message"]').should('contain', '网络连接失败')
    })

    it('应该处理服务器错误', () => {
      // 模拟服务器错误
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('loginRequest')

      // 模拟微信登录
      cy.mockWechatAPI('login', { code: 'test-code-123' })

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待请求
      cy.wait('@loginRequest')

      // 验证错误提示
      cy.get('[data-testid="server-error-message"]').should('contain', '服务器错误')
    })

    it('应该处理超时错误', () => {
      // 模拟超时
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 408,
        body: { error: 'Request Timeout' },
        delay: 30000
      }).as('loginRequest')

      // 模拟微信登录
      cy.mockWechatAPI('login', { code: 'test-code-123' })

      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()

      // 等待超时
      cy.wait('@loginRequest', { timeout: 35000 })

      // 验证错误提示
      cy.get('[data-testid="timeout-error-message"]').should('contain', '请求超时')
    })
  })

  describe('性能测试', () => {
    it('应该快速加载登录页面', () => {
      const startTime = performance.now()
      
      cy.visit('/')
      cy.waitForPageLoad()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // 验证加载时间小于3秒
      expect(loadTime).to.be.lessThan(3000)
    })

    it('应该快速处理登录请求', () => {
      // 模拟微信登录
      cy.mockWechatAPI('login', { code: 'test-code-123' })
      cy.mockWechatAPI('getUserInfo', {
        userInfo: {
          nickName: '测试用户',
          avatarUrl: '/assets/images/default-avatar.png',
          gender: 1,
          city: '北京',
          province: '北京',
          country: '中国',
          language: 'zh_CN'
        }
      })

      const startTime = performance.now()
      
      // 点击登录按钮
      cy.get('[data-testid="wechat-login-button"]').click()
      
      // 等待页面跳转
      cy.url().should('include', '/pages/index/index')
      
      const endTime = performance.now()
      const loginTime = endTime - startTime
      
      // 验证登录时间小于5秒
      expect(loginTime).to.be.lessThan(5000)
    })
  })

  describe('兼容性测试', () => {
    it('应该支持不同的viewport尺寸', () => {
      // iPhone SE
      cy.viewport(320, 568)
      cy.get('.login-page').should('be.visible')
      
      // iPhone 12 Pro
      cy.viewport(390, 844)
      cy.get('.login-page').should('be.visible')
      
      // iPhone 14 Pro Max
      cy.viewport(430, 932)
      cy.get('.login-page').should('be.visible')
    })

    it('应该支持横屏模式', () => {
      // 切换到横屏
      cy.viewport(667, 375)
      
      // 验证页面元素仍然可见
      cy.get('.login-page').should('be.visible')
      cy.get('[data-testid="login-title"]').should('be.visible')
      cy.get('[data-testid="wechat-login-button"]').should('be.visible')
    })
  })
})