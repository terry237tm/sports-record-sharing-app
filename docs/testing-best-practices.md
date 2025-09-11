# 测试最佳实践指南

## 概述

本文档描述了运动记录分享小程序项目中单元测试、集成测试和端到端测试的最佳实践。遵循这些指南可以确保测试的质量、可维护性和有效性。

## 📋 测试策略

### 测试金字塔

```
    ⚡ 快速反馈
    ↑
E2E测试    (少量)  - 用户旅程验证
集成测试   (中等)  - 组件间交互验证  
单元测试   (大量)  - 函数和组件验证
    ↓
    💰 成本效益
```

### 测试覆盖率目标

- **单元测试**: 覆盖率目标 80%
- **集成测试**: 覆盖率目标 70%
- **端到端测试**: 关键用户路径 100% 覆盖

## 🧪 单元测试最佳实践

### 1. 测试结构 (AAA模式)

```typescript
// ✅ 好的实践 - 清晰的AAA结构
describe('用户服务', () => {
  it('应该成功创建用户', async () => {
    // Arrange - 准备测试数据和环境
    const userData = { name: '测试用户', email: 'test@example.com' }
    mockDatabase.createUser.mockResolvedValue({ id: '123', ...userData })
    
    // Act - 执行被测试的操作
    const result = await userService.createUser(userData)
    
    // Assert - 验证结果
    expect(result).toEqual({ id: '123', ...userData })
    expect(mockDatabase.createUser).toHaveBeenCalledWith(userData)
  })
})
```

### 2. 测试命名规范

```typescript
// ✅ 好的命名
it('应该在用户未登录时返回未认证状态', () => { ... })
it('应该在密码正确时成功验证用户', () => { ... })
it('应该在网络超时时抛出超时错误', () => { ... })

// ❌ 差的命名
it('测试用户认证', () => { ... })
it('验证登录功能' () => { ... })
it('处理错误情况' () => { ... })
```

### 3. 测试数据管理

```typescript
// ✅ 使用数据工厂生成测试数据
import { createMockUser, createMockSportRecord } from '@/tests/mocks/dataFactory'

it('应该正确计算运动统计数据', () => {
  const records = [
    createMockSportRecord({ duration: 30, distance: 5 }),
    createMockSportRecord({ duration: 45, distance: 8 }),
    createMockSportRecord({ duration: 60, distance: 10 })
  ]
  
  const stats = calculateStats(records)
  expect(stats.totalDuration).toBe(135)
  expect(stats.totalDistance).toBe(23)
})
```

### 4. Mock策略

```typescript
// ✅ 适当的Mock粒度
jest.mock('@tarojs/taro', () => ({
  request: jest.fn(),
  showToast: jest.fn(),
  getStorage: jest.fn()
}))

// ✅ 使用工厂函数创建Mock
const createMockAPI = () => ({
  getUserInfo: jest.fn().mockResolvedValue({ name: '测试用户' }),
  updateUser: jest.fn().mockImplementation((data) => Promise.resolve({ ...data, id: '123' }))
})
```

### 5. 异步测试

```typescript
// ✅ 正确处理异步操作
it('应该异步加载用户数据', async () => {
  const mockData = { id: '123', name: '测试用户' }
  mockAPI.getUser.mockResolvedValue(mockData)
  
  const { result } = renderHook(() => useUserData('123'))
  
  // 初始状态
  expect(result.current.loading).toBe(true)
  expect(result.current.data).toBeNull()
  
  // 等待数据加载
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
  
  expect(result.current.data).toEqual(mockData)
})
```

## 🔄 集成测试最佳实践

### 1. 组件集成测试

```typescript
describe('用户认证流程集成测试', () => {
  it('应该完成完整的登录流程', async () => {
    // 模拟API响应
    mockLoginAPI.mockResolvedValue({ token: 'test-token', user: mockUser })
    
    // 渲染登录页面
    render(<Provider store={store}>
      <LoginPage />
    </Provider>)
    
    // 用户输入
    await userEvent.type(screen.getByLabelText('用户名'), 'testuser')
    await userEvent.type(screen.getByLabelText('密码'), 'password123')
    
    // 点击登录
    await userEvent.click(screen.getByRole('button', { name: '登录' }))
    
    // 验证结果
    await waitFor(() => {
      expect(screen.getByText('登录成功')).toBeInTheDocument()
      expect(localStorage.getItem('token')).toBe('test-token')
    })
  })
})
```

### 2. API集成测试

```typescript
describe('运动记录API集成测试', () => {
  it('应该创建并获取运动记录', async () => {
    const recordData = createMockSportRecord()
    
    // 创建记录
    const createdRecord = await sportService.createRecord(recordData)
    expect(createdRecord).toHaveProperty('_id')
    
    // 获取记录
    const fetchedRecord = await sportService.getRecord(createdRecord._id)
    expect(fetchedRecord).toMatchObject(recordData)
    
    // 验证数据一致性
    expect(fetchedRecord._id).toBe(createdRecord._id)
    expect(fetchedRecord.createdAt).toBeDefined()
  })
})
```

## 🎭 端到端测试最佳实践

### 1. 关键用户路径测试

```typescript
describe('运动记录分享E2E测试', () => {
  it('应该完成运动记录的创建、编辑和分享流程', async () => {
    // 1. 用户登录
    await page.goto('/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // 2. 创建运动记录
    await page.click('button:has-text("开始运动")')
    await page.selectOption('select[name="sportType"]', 'running')
    await page.fill('input[name="duration"]', '30')
    await page.fill('input[name="distance"]', '5')
    await page.click('button:has-text("保存记录")')
    
    // 3. 验证记录创建
    await expect(page.locator('.success-message')).toContainText('运动记录已保存')
    
    // 4. 编辑记录
    await page.click('.record-card .edit-button')
    await page.fill('textarea[name="description"]', '今天的跑步感觉很棒！')
    await page.click('button:has-text("更新")')
    
    // 5. 分享记录
    await page.click('.record-card .share-button')
    await page.click('button:has-text("生成分享图片")')
    
    // 6. 验证分享功能
    await expect(page.locator('.share-image')).toBeVisible()
  })
})
```

## 🎯 测试数据管理

### 1. 测试数据工厂

```typescript
// tests/mocks/dataFactory.ts
export const createMockUser = (overrides = {}) => ({
  openid: `user_${Date.now()}`,
  nickname: '测试用户',
  avatar: '/assets/default-avatar.png',
  gender: 1,
  city: '北京市',
  ...overrides
})

export const createMockSportRecord = (overrides = {}) => ({
  _id: `record_${Date.now()}`,
  sportType: 'running',
  duration: 30,
  distance: 5.2,
  calories: 300,
  images: [],
  location: {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '北京市东城区'
  },
  createdAt: new Date(),
  ...overrides
})
```

### 2. 测试环境隔离

```typescript
// 每个测试前清理环境
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  mockAPI.reset()
})

// 测试数据隔离
const createIsolatedTestData = () => {
  const testId = Date.now()
  return {
    userId: `user_${testId}`,
    recordId: `record_${testId}`,
    timestamp: testId
  }
}
```

## 🚨 错误处理和边界情况

### 1. 网络错误测试

```typescript
it('应该处理网络超时错误', async () => {
  mockAPI.getUserInfo.mockRejectedValue(new Error('Network timeout'))
  
  const { result } = renderHook(() => useUserInfo())
  
  await waitFor(() => {
    expect(result.current.error).toBeDefined()
    expect(result.current.error.message).toContain('Network timeout')
  })
})
```

### 2. 数据验证错误测试

```typescript
it('应该处理无效的用户输入', async () => {
  const invalidData = {
    duration: -10, // 负数持续时间
    distance: 'invalid', // 字符串距离
    calories: null // null值
  }
  
  const result = await validateSportData(invalidData)
  
  expect(result.isValid).toBe(false)
  expect(result.errors).toContain('持续时间必须为正数')
  expect(result.errors).toContain('距离必须为数字')
  expect(result.errors).toContain('卡路里不能为空')
})
```

### 3. 边界条件测试

```typescript
it('应该处理极限值情况', () => {
  // 测试最大安全整数
  expect(formatDuration(Number.MAX_SAFE_INTEGER)).toBe('9007199254740991分钟')
  
  // 测试最小有效值
  expect(formatDuration(0.001)).toBe('0分钟')
  
  // 测试空值处理
  expect(formatDuration(null as any)).toBe('0分钟')
  expect(formatDuration(undefined as any)).toBe('0分钟')
})
```

## 📊 性能测试

### 1. 组件性能测试

```typescript
it('应该在大数据量下保持良好的渲染性能', () => {
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    data: createMockSportRecord()
  }))
  
  const startTime = performance.now()
  
  render(<SportRecordList records={largeDataset} />)
  
  const endTime = performance.now()
  const renderTime = endTime - startTime
  
  // 渲染时间应该小于100ms
  expect(renderTime).toBeLessThan(100)
})
```

### 2. API性能测试

```typescript
it('应该在合理时间内完成API调用', async () => {
  const startTime = performance.now()
  
  const result = await api.getSportRecords({ page: 1, pageSize: 50 })
  
  const endTime = performance.now()
  const apiTime = endTime - startTime
  
  // API响应时间应该小于2秒
  expect(apiTime).toBeLessThan(2000)
  expect(result.records).toHaveLength(50)
})
```

## 🔧 测试工具和辅助函数

### 1. 测试工具函数

```typescript
// tests/utils/testHelpers.ts
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms))

export const flushPromises = () => 
  new Promise(resolve => setImmediate(resolve))

export const createMockFile = (name = 'test.jpg', size = 1024) => {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type: 'image/jpeg' })
}

export const mockGeolocation = (coords = {}) => {
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn((success) => 
      success({ coords: { latitude: 39.9, longitude: 116.4, ...coords } })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }
}
```

### 2. 测试断言辅助函数

```typescript
// tests/utils/testAssertions.ts
export const expectToBeValidSportRecord = (record: any) => {
  expect(record).toHaveProperty('_id')
  expect(record).toHaveProperty('sportType')
  expect(record).toHaveProperty('duration')
  expect(record).toHaveProperty('distance')
  expect(record).toHaveProperty('createdAt')
  expect(typeof record.duration).toBe('number')
  expect(typeof record.distance).toBe('number')
  expect(record.duration).toBeGreaterThan(0)
  expect(record.distance).toBeGreaterThanOrEqual(0)
}

export const expectToBeValidUser = (user: any) => {
  expect(user).toHaveProperty('openid')
  expect(user).toHaveProperty('nickname')
  expect(typeof user.openid).toBe('string')
  expect(user.openid).toHaveLength(> 0)
}
```

## 📈 测试报告和度量

### 1. 覆盖率报告解读

```
=============================== Coverage summary ===============================
Statements   : 82.35% ( 1400/1700 )
Branches     : 75.89% ( 450/593 )
Functions    : 80.12% ( 320/399 )
Lines        : 81.76% ( 1350/1650 )
================================================================================

✅ 覆盖率达标 - 所有指标都超过了设定的阈值
⚠️  需要关注 - 分支覆盖率较低，需要增加条件测试用例
```

### 2. 测试质量度量

- **测试执行时间**: 单元测试 < 2分钟，集成测试 < 5分钟
- **测试稳定性**: 成功率 > 95%，无间歇性失败
- **测试维护成本**: 新功能开发时间占比 < 20%
- **缺陷检测率**: 测试发现缺陷占总缺陷的 > 80%

## 🔍 调试和故障排除

### 1. 测试调试技巧

```typescript
// 启用详细日志
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    originalConsole.log('[TEST]', ...args)
  })
})

// 使用调试器
it('应该调试复杂逻辑', () => {
  debugger // 在Chrome DevTools中设置断点
  const result = complexBusinessLogic(inputData)
  expect(result).toBe(expectedOutput)
})
```

### 2. 常见问题和解决方案

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| 间歇性测试失败 | 测试有时通过，有时失败 | 检查异步操作，增加适当的等待时间 |
| Mock未生效 | 真实API被调用 | 确保Mock在测试前设置，检查模块路径 |
| 内存泄漏 | 测试运行缓慢，内存使用增加 | 在afterEach中清理资源，使用--detectLeaks |
| 测试依赖 | 测试执行顺序影响结果 | 确保测试独立性，避免共享状态 |

## 📚 持续集成和部署

### 1. CI/CD配置

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### 2. 测试门控

```json
{
  "scripts": {
    "test:precommit": "npm run test:unit -- --changedSince=main",
    "test:prepush": "npm run test:coverage -- --threshold=70",
    "test:pr": "npm run test:unit && npm run test:integration"
  }
}
```

## 🎯 总结

良好的测试实践是确保软件质量的关键。通过遵循这些最佳实践，我们可以：

1. **提高代码质量** - 通过全面的测试覆盖发现潜在问题
2. **增强开发信心** - 确保代码更改不会破坏现有功能
3. **改善代码设计** - 可测试的代码通常是更好的设计
4. **降低维护成本** - 及早发现问题比后期修复成本更低
5. **加速开发流程** - 自动化测试提供快速反馈

记住：**测试不是成本，而是投资**。

## 📖 相关资源

- [Jest官方文档](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Taro测试指南](https://taro.zone/docs/guide/testing)
- [TypeScript测试最佳实践](https://www.typescriptlang.org/docs/handbook/testing.html)
- [小程序测试指南](https://developers.weixin.qq.com/miniprogram/dev/framework/testing/)"}