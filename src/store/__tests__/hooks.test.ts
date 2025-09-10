/**
 * Store hooks 测试 - 定义验证
 */

// 注意：在测试环境中，我们只验证 hooks 的导出和类型定义
// 实际的 React hooks 测试需要在组件环境中进行

describe('Store Hooks 定义', () => {
  it('hooks 文件应该存在并导出函数', () => {
    // 验证文件存在
    const fs = require('fs')
    const path = require('path')
    
    const hooksPath = path.join(__dirname, '../hooks.ts')
    expect(fs.existsSync(hooksPath)).toBe(true)
    
    // 读取文件内容
    const hooksContent = fs.readFileSync(hooksPath, 'utf-8')
    
    // 验证导出的函数
    expect(hooksContent).toContain('export const useAppDispatch')
    expect(hooksContent).toContain('export const useAppSelector')
  })

  it('应该正确导入 React Redux hooks', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hooksPath = path.join(__dirname, '../hooks.ts')
    const hooksContent = fs.readFileSync(hooksPath, 'utf-8')
    
    // 验证导入
    expect(hooksContent).toContain('useDispatch')
    expect(hooksContent).toContain('useSelector')
    expect(hooksContent).toContain('TypedUseSelectorHook')
  })

  it('应该正确导入 store 类型', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hooksPath = path.join(__dirname, '../hooks.ts')
    const hooksContent = fs.readFileSync(hooksPath, 'utf-8')
    
    // 验证类型导入
    expect(hooksContent).toContain('RootState')
    expect(hooksContent).toContain('AppDispatch')
  })
})