/**
 * CSS样式文件Mock
 * 用于在测试中处理样式文件导入
 */

module.exports = {
  // 返回一个空对象，模拟CSS模块
  default: {},
  // 支持CSS模块的类名映射
  className: 'mock-class-name',
  // 支持CSS-in-JS
  styles: {}
}