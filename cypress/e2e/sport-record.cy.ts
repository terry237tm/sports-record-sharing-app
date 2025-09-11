/**
 * 运动记录功能E2E测试
 * 测试运动记录的创建、编辑、删除等操作
 */

describe('运动记录功能', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/pages/sports/index')
    cy.waitForPageLoad()
  })

  describe('运动记录列表', () => {
    it('应该显示运动记录列表', () => {
      cy.get('[data-testid="sport-list"]').should('be.visible')
      cy.get('[data-testid="sport-card"]').should('have.length.at.least', 1)
    })

    it('应该显示运动记录详情', () => {
      cy.get('[data-testid="sport-card"]').first().click()
      
      // 验证详情页面
      cy.get('[data-testid="sport-detail-page"]').should('be.visible')
      cy.get('[data-testid="sport-type"]').should('be.visible')
      cy.get('[data-testid="sport-data"]').should('be.visible')
      cy.get('[data-testid="sport-location"]').should('be.visible')
    })

    it('应该支持下拉刷新', () => {
      // 模拟下拉刷新
      cy.get('[data-testid="sport-list"]').trigger('touchstart', {
        touches: [{ clientY: 100 }]
      })
      
      cy.get('[data-testid="sport-list"]').trigger('touchmove', {
        touches: [{ clientY: 200 }]
      })
      
      cy.get('[data-testid="sport-list"]').trigger('touchend')
      
      // 验证刷新指示器
      cy.get('[data-testid="refresh-indicator"]').should('be.visible')
      
      // 等待刷新完成
      cy.wait(2000)
      
      // 验证刷新指示器消失
      cy.get('[data-testid="refresh-indicator"]').should('not.exist')
    })

    it('应该支持上拉加载更多', () => {
      // 模拟上拉加载
      cy.get('[data-testid="sport-list"]').scrollTo('bottom')
      
      // 验证加载指示器
      cy.get('[data-testid="load-more-indicator"]').should('be.visible')
      
      // 等待加载完成
      cy.wait(2000)
      
      // 验证加载指示器消失
      cy.get('[data-testid="load-more-indicator"]').should('not.exist')
    })
  })

  describe('创建运动记录', () => {
    it('应该打开创建运动记录页面', () => {
      cy.get('[data-testid="add-sport-button"]').click()
      
      // 验证创建页面
      cy.get('[data-testid="create-sport-page"]').should('be.visible')
      cy.get('[data-testid="sport-type-selector"]').should('be.visible')
      cy.get('[data-testid="sport-data-input"]').should('be.visible')
    })

    it('应该创建跑步记录', () => {
      // 打开创建页面
      cy.get('[data-testid="add-sport-button"]').click()
      
      // 选择运动类型
      cy.get('[data-testid="sport-type-running"]').click()
      
      // 输入运动数据
      cy.get('[data-testid="duration-input"]').type('30')
      cy.get('[data-testid="distance-input"]').type('5.2')
      cy.get('[data-testid="calories-input"]').type('300')
      
      // 输入描述
      cy.get('[data-testid="description-input"]').type('今天跑步感觉很棒！')
      
      // 获取位置
      cy.get('[data-testid="get-location-button"]').click()
      
      // 等待位置获取
      cy.wait(2000)
      
      // 上传图片
      cy.get('[data-testid="upload-image-button"]').click()
      cy.get('[data-testid="image-picker"]').selectFile('cypress/fixtures/test-image.jpg')
      
      // 保存记录
      cy.get('[data-testid="save-button"]').click()
      
      // 验证保存成功
      cy.get('[data-testid="success-message"]').should('contain', '运动记录保存成功')
      
      // 返回列表页面
      cy.url().should('include', '/pages/sports/index')
    })

    it('应该创建骑行记录', () => {
      // 打开创建页面
      cy.get('[data-testid="add-sport-button"]').click()
      
      // 选择运动类型
      cy.get('[data-testid="sport-type-cycling"]').click()
      
      // 输入运动数据
      cy.get('[data-testid="duration-input"]').type('60')
      cy.get('[data-testid="distance-input"]').type('15.5')
      cy.get('[data-testid="calories-input"]').type('450')
      
      // 输入描述
      cy.get('[data-testid="description-input"]').type('今天骑行了15公里')
      
      // 保存记录
      cy.get('[data-testid="save-button"]').click()
      
      // 验证保存成功
      cy.get('[data-testid="success-message"]').should('contain', '运动记录保存成功')
    })

    it('应该验证必填字段', () => {
      // 打开创建页面
      cy.get('[data-testid="add-sport-button"]').click()
      
      // 直接保存，不输入任何数据
      cy.get('[data-testid="save-button"]').click()
      
      // 验证错误提示
      cy.get('[data-testid="validation-error"]').should('contain', '请选择运动类型')
      
      // 选择运动类型
      cy.get('[data-testid="sport-type-running"]').click()
      
      // 再次保存
      cy.get('[data-testid="save-button"]').click()
      
      // 验证新的错误提示
      cy.get('[data-testid="validation-error"]').should('contain', '请输入运动时长')
    })
  })

  describe('编辑运动记录', () => {
    it('应该打开编辑页面', () => {
      // 长按第一个记录
      cy.get('[data-testid="sport-card"]').first().trigger('longpress')
      
      // 选择编辑
      cy.get('[data-testid="edit-menu-item"]').click()
      
      // 验证编辑页面
      cy.get('[data-testid="edit-sport-page"]').should('be.visible')
      cy.get('[data-testid="sport-type-selector"]').should('be.visible')
      cy.get('[data-testid="sport-data-input"]').should('be.visible')
    })

    it('应该编辑运动记录', () => {
      // 打开编辑页面
      cy.get('[data-testid="sport-card"]').first().trigger('longpress')
      cy.get('[data-testid="edit-menu-item"]').click()
      
      // 修改运动数据
      cy.get('[data-testid="duration-input"]').clear().type('45')
      cy.get('[data-testid="distance-input"]').clear().type('6.5')
      cy.get('[data-testid="calories-input"]').clear().type('380')
      
      // 修改描述
      cy.get('[data-testid="description-input"]').clear().type('修改后的运动记录')
      
      // 保存修改
      cy.get('[data-testid="save-button"]').click()
      
      // 验证修改成功
      cy.get('[data-testid="success-message"]').should('contain', '运动记录更新成功')
    })

    it('应该支持图片编辑', () => {
      // 打开编辑页面
      cy.get('[data-testid="sport-card"]').first().trigger('longpress')
      cy.get('[data-testid="edit-menu-item"]').click()
      
      // 删除现有图片
      cy.get('[data-testid="delete-image-button"]').first().click()
      
      // 添加新图片
      cy.get('[data-testid="upload-image-button"]').click()
      cy.get('[data-testid="image-picker"]').selectFile('cypress/fixtures/new-image.jpg')
      
      // 保存修改
      cy.get('[data-testid="save-button"]').click()
      
      // 验证修改成功
      cy.get('[data-testid="success-message"]').should('contain', '运动记录更新成功')
    })
  })

  describe('删除运动记录', () => {
    it('应该删除运动记录', () => {
      // 获取记录数量
      cy.get('[data-testid="sport-card"]').its('length').then((initialCount) => {
        // 长按第一个记录
        cy.get('[data-testid="sport-card"]').first().trigger('longpress')
        
        // 选择删除
        cy.get('[data-testid="delete-menu-item"]').click()
        
        // 确认删除
        cy.get('[data-testid="confirm-delete-button"]').click()
        
        // 验证删除成功
        cy.get('[data-testid="success-message"]').should('contain', '运动记录删除成功')
        
        // 验证记录数量减少
        cy.get('[data-testid="sport-card"]').should('have.length', initialCount - 1)
      })
    })

    it('应该取消删除操作', () => {
      // 获取记录数量
      cy.get('[data-testid="sport-card"]').its('length').then((initialCount) => {
        // 长按第一个记录
        cy.get('[data-testid="sport-card"]').first().trigger('longpress')
        
        // 选择删除
        cy.get('[data-testid="delete-menu-item"]').click()
        
        // 取消删除
        cy.get('[data-testid="cancel-delete-button"]').click()
        
        // 验证记录数量不变
        cy.get('[data-testid="sport-card"]').should('have.length', initialCount)
      })
    })
  })

  describe('搜索和筛选', () => {
    it('应该支持按运动类型筛选', () => {
      // 打开筛选器
      cy.get('[data-testid="filter-button"]').click()
      
      // 选择跑步类型
      cy.get('[data-testid="filter-running"]').click()
      
      // 应用筛选
      cy.get('[data-testid="apply-filter-button"]').click()
      
      // 验证筛选结果
      cy.get('[data-testid="sport-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="sport-type"]').should('contain', '跑步')
      })
    })

    it('应该支持按日期筛选', () => {
      // 打开筛选器
      cy.get('[data-testid="filter-button"]').click()
      
      // 选择日期范围
      cy.get('[data-testid="date-range-start"]').type('2024-01-01')
      cy.get('[data-testid="date-range-end"]').type('2024-01-31')
      
      // 应用筛选
      cy.get('[data-testid="apply-filter-button"]').click()
      
      // 验证筛选结果
      cy.get('[data-testid="sport-card"]').should('be.visible')
    })

    it('应该支持搜索功能', () => {
      // 点击搜索按钮
      cy.get('[data-testid="search-button"]').click()
      
      // 输入搜索关键词
      cy.get('[data-testid="search-input"]').type('跑步')
      
      // 执行搜索
      cy.get('[data-testid="search-submit"]').click()
      
      // 验证搜索结果
      cy.get('[data-testid="sport-card"]').each(($card) => {
        cy.wrap($card).should('contain', '跑步')
      })
    })
  })

  describe('分享功能', () => {
    it('应该支持分享运动记录', () => {
      // 点击分享按钮
      cy.get('[data-testid="share-button"]').first().click()
      
      // 验证分享选项
      cy.get('[data-testid="share-options"]').should('be.visible')
      cy.get('[data-testid="share-to-wechat"]').should('be.visible')
      cy.get('[data-testid="share-to-moments"]').should('be.visible')
      cy.get('[data-testid="share-to-qq"]').should('be.visible')
    })

    it('应该生成分享图片', () => {
      // 点击分享按钮
      cy.get('[data-testid="share-button"]').first().click()
      
      // 选择生成分享图片
      cy.get('[data-testid="generate-share-image"]').click()
      
      // 等待图片生成
      cy.wait(3000)
      
      // 验证分享图片
      cy.get('[data-testid="share-image-preview"]').should('be.visible')
    })
  })

  describe('数据统计', () => {
    it('应该显示数据统计', () => {
      // 切换到统计页面
      cy.get('[data-testid="stats-tab"]').click()
      
      // 验证统计信息
      cy.get('[data-testid="total-distance"]').should('be.visible')
      cy.get('[data-testid="total-duration"]').should('be.visible')
      cy.get('[data-testid="total-calories"]').should('be.visible')
      cy.get('[data-testid="total-records"]').should('be.visible')
    })

    it('应该显示运动类型分布', () => {
      // 切换到统计页面
      cy.get('[data-testid="stats-tab"]').click()
      
      // 验证图表
      cy.get('[data-testid="sport-type-chart"]').should('be.visible')
      cy.get('[data-testid="distance-chart"]').should('be.visible')
      cy.get('[data-testid="duration-chart"]').should('be.visible')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', () => {
      // 模拟网络错误
      cy.intercept('GET', '/api/sport-records', {
        forceNetworkError: true
      }).as('getRecords')

      // 刷新页面
      cy.reload()

      // 等待请求
      cy.wait('@getRecords')

      // 验证错误提示
      cy.get('[data-testid="network-error-message"]').should('contain', '网络连接失败')
    })

    it('应该处理空数据情况', () => {
      // 模拟空数据
      cy.intercept('GET', '/api/sport-records', {
        statusCode: 200,
        body: { data: [] }
      }).as('getRecords')

      // 刷新页面
      cy.reload()

      // 等待请求
      cy.wait('@getRecords')

      // 验证空状态提示
      cy.get('[data-testid="empty-state-message"]').should('contain', '暂无运动记录')
    })
  })
})