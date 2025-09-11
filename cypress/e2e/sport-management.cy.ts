describe('运动记录管理E2E测试', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('应该完成完整的运动记录CRUD流程', () => {
    // 创建运动记录
    cy.get('[data-testid="add-record-btn"]').click();
    cy.get('[data-testid="sport-type-select"]').select('跑步');
    cy.get('[data-testid="duration-input"]').type('30');
    cy.get('[data-testid="distance-input"]').type('5');
    cy.get('[data-testid="submit-btn"]').click();
    
    cy.get('[data-testid="success-message"]').should('contain', '运动记录已创建');
    
    // 验证记录出现在列表中
    cy.get('[data-testid="record-list"]').should('contain', '跑步');
    cy.get('[data-testid="record-list"]').should('contain', '30分钟');
  });

  it('应该处理网络错误和加载状态', () => {
    // 模拟网络错误
    cy.intercept('POST', '**/api/records', { forceNetworkError: true }).as('createRecord');
    
    cy.get('[data-testid="add-record-btn"]').click();
    cy.get('[data-testid="submit-btn"]').click();
    
    cy.wait('@createRecord');
    cy.get('[data-testid="error-message"]').should('contain', '网络连接失败');
  });
});
