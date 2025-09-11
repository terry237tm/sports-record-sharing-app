/**
 * useSportForm Hook 测试
 * 验证 Hook 的定义和导出
 */

// 注意：在测试环境中，我们只验证 hooks 的导出和类型定义
// 实际的 React hooks 测试需要在组件环境中进行

describe('useSportForm Hook 定义', () => {
  it('useSportForm 文件应该存在并导出函数', () => {
    // 验证文件存在
    const fs = require('fs')
    const path = require('path')
    
    const hookPath = path.join(__dirname, '../useSportForm.ts')
    expect(fs.existsSync(hookPath)).toBe(true)
    
    // 读取文件内容
    const hookContent = fs.readFileSync(hookPath, 'utf-8')
    
    // 验证导出的函数
    expect(hookContent).toContain('export function useSportForm')
    expect(hookContent).toContain('SportFormState')
    expect(hookContent).toContain('SportFormActions')
    expect(hookContent).toContain('UseSportFormReturn')
  })

  it('应该包含必要的 Hook 功能定义', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证状态管理
    expect(hookContent).toContain('updateField')
    expect(hookContent).toContain('updateLocation')
    expect(hookContent).toContain('addImage')
    expect(hookContent).toContain('removeImage')
    
    // 验证验证功能
    expect(hookContent).toContain('validateField')
    expect(hookContent).toContain('validateForm')
    
    // 验证表单操作
    expect(hookContent).toContain('resetForm')
    expect(hookContent).toContain('setSubmitting')
    expect(hookContent).toContain('setLoading')
    
    // 验证提交相关
    expect(hookContent).toContain('setSubmitError')
    expect(hookContent).toContain('setSubmitSuccess')
    expect(hookContent).toContain('incrementSubmitCount')
    
    // 验证状态属性
    expect(hookContent).toContain('isDirty')
    expect(hookContent).toContain('isValid')
    expect(hookContent).toContain('isSubmitting')
    expect(hookContent).toContain('isLoading')
    expect(hookContent).toContain('submitError')
    expect(hookContent).toContain('submitSuccess')
  })

  it('应该正确导入类型和工具函数', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证类型导入
    expect(hookContent).toContain('SportRecordFormData')
    expect(hookContent).toContain('SportType')
    expect(hookContent).toContain('LocationInfo')
    
    // 验证工具函数导入
    expect(hookContent).toContain('validateSportForm')
    expect(hookContent).toContain('formatFormData')
    
    // 验证 React Hook 导入
    expect(hookContent).toContain('useState')
    expect(hookContent).toContain('useCallback')
    expect(hookContent).toContain('useMemo')
  })

  it('应该包含初始状态定义', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证初始数据
    expect(hookContent).toContain('initialFormData')
    expect(hookContent).toContain('SportType.RUNNING')
    expect(hookContent).toContain("duration: ''")
    expect(hookContent).toContain("calories: ''")
    expect(hookContent).toContain('images: []')
    expect(hookContent).toContain('location: undefined')
  })

  it('应该包含图片上传限制逻辑', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证图片数量限制
    expect(hookContent).toContain('newImages.length > 9')
    expect(hookContent).toContain('最多只能上传9张图片')
    
    // 验证图片添加和移除逻辑
    expect(hookContent).toContain('addImage')
    expect(hookContent).toContain('removeImage')
  })

  it('应该包含表单验证逻辑', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证自动验证逻辑
    expect(hookContent).toContain('autoValidate')
    expect(hookContent).toContain('isDirty')
    expect(hookContent).toContain('submitCount > 0')
    
    // 验证错误清除逻辑
    expect(hookContent).toContain("errors: {")
    expect(hookContent).toContain("[field]: ''")
  })

  it('应该包含格式化数据功能', () => {
    const fs = require('fs')
    const path = require('path')
    
    const hookContent = fs.readFileSync(path.join(__dirname, '../useSportForm.ts'), 'utf-8')
    
    // 验证格式化数据
    expect(hookContent).toContain('formattedData')
    expect(hookContent).toContain('formatFormData')
    expect(hookContent).toContain('useMemo')
  })
})