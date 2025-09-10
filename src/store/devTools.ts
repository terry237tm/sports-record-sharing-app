/**
 * Redux DevTools 增强配置
 * 提供开发环境下的调试支持
 */

// 注意：在 Taro 项目中，Redux 的 compose 可能不可用
// 我们使用原生 JavaScript 的 compose 逻辑

// Redux DevTools 扩展接口
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any
  }
}

/**
 * 获取 Redux DevTools Compose 函数
 * 在生产环境或 DevTools 不可用时返回 undefined
 */
export const getDevToolsCompose = () => {
  if (process.env.NODE_ENV === 'production') {
    return undefined
  }

  // 检查是否支持 Redux DevTools
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  return undefined
}

/**
 * Redux DevTools 配置选项
 */
export const devToolsOptions = {
  // 启用时序旅行调试
  trace: true,
  // 设置跟踪限制
  traceLimit: 25,
  // 自定义 action 类型过滤
  actionsBlacklist: ['@@INIT'],
  // 自定义 state 路径过滤
  stateSanitizer: (state: any) => {
    // 可以在这里清理敏感数据
    return state
  },
  // 自定义 action 过滤
  actionSanitizer: (action: any) => {
    // 可以在这里清理敏感数据
    return action
  },
  // 启用在控制台中显示 action
  serialize: {
    options: {
      undefined: true,
      symbol: true,
      function: (fn: Function) => fn.toString()
    }
  }
}