/**
 * Cypress组件测试支持文件
 * 用于React组件的测试
 */

import { mount } from 'cypress/react'
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/store'

// 导入全局样式
import '@/app.scss'

// 类型声明
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 挂载React组件
       */
      mount: typeof mount
      
      /**
       * 使用Redux store挂载组件
       */
      mountWithStore: (component: React.ReactElement, options?: any) => Chainable<any>
      
      /**
       * 获取组件props
       */
      getProps: () => Chainable<any>
      
      /**
       * 设置组件props
       */
      setProps: (props: any) => Chainable<void>
      
      /**
       * 获取组件状态
       */
      getState: () => Chainable<any>
      
      /**
       * 触发组件事件
       */
      triggerEvent: (eventName: string, ...args: any[]) => Chainable<void>
    }
  }
}

/**
 * 创建测试用的Redux store
 */
function createTestStore(initialState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}

/**
 * 自定义mount函数，自动包装Redux Provider
 */
Cypress.Commands.add('mount', (component, options = {}) => {
  const { store = createTestStore(), ...mountOptions } = options
  
  const wrapped = (
    <Provider store={store}>
      {component}
    </Provider>
  )
  
  return mount(wrapped, mountOptions)
})

/**
 * 使用Redux store挂载组件
 */
Cypress.Commands.add('mountWithStore', (component, options = {}) => {
  const store = createTestStore(options.initialState || {})
  
  return cy.mount(component, { store, ...options }).then(() => {
    return { store }
  })
})

/**
 * 获取组件props
 */
Cypress.Commands.add('getProps', () => {
  return cy.window().then((win) => {
    return (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.[0]?.currentElement?.props
  })
})

/**
 * 设置组件props
 */
Cypress.Commands.add('setProps', (props) => {
  return cy.window().then((win) => {
    const component = (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.[0]?.currentElement
    if (component) {
      component.props = { ...component.props, ...props }
    }
  })
})

/**
 * 获取组件状态
 */
Cypress.Commands.add('getState', () => {
  return cy.window().then((win) => {
    return (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.[0]?.currentElement?.state
  })
})

/**
 * 触发组件事件
 */
Cypress.Commands.add('triggerEvent', (eventName, ...args) => {
  return cy.window().then((win) => {
    const component = (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.[0]?.currentElement
    if (component && component.props[eventName]) {
      component.props[eventName](...args)
    }
  })
})

// 设置全局配置
Cypress.on('uncaught:exception', (err) => {
  // 防止React警告中断测试
  if (err.message.includes('ReactDOM.render')) {
    return false
  }
})

// 测试前准备
beforeEach(() => {
  // 设置viewport为iPhone尺寸
  cy.viewport(375, 667)
  
  // 清除控制台输出
  cy.window().then((win) => {
    win.console.clear()
  })
})