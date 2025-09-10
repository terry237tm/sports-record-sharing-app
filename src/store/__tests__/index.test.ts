/**
 * Store 配置测试 - 简化版本
 */

import { store } from '../index'

describe('Store 配置', () => {
  it('应该正确创建 store 实例', () => {
    expect(store).toBeDefined()
    expect(typeof store.getState).toBe('function')
    expect(typeof store.dispatch).toBe('function')
    expect(typeof store.subscribe).toBe('function')
  })

  it('应该包含 sport 和 share reducer', () => {
    const state = store.getState()
    
    expect(state).toHaveProperty('sport')
    expect(state).toHaveProperty('share')
  })

  it('应该正确导出 store 类型', () => {
    const state = store.getState()
    
    // 验证类型正确性
    expect(state.sport).toBeDefined()
    expect(state.share).toBeDefined()
  })

  it('应该正确导出 dispatch 函数', () => {
    const dispatch = store.dispatch
    
    expect(dispatch).toBeDefined()
    expect(typeof dispatch).toBe('function')
  })
})