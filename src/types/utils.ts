/**
 * 工具函数类型定义
 * 定义通用的工具函数类型和辅助类型
 */

/**
 * 验证器类型定义
 */

// 验证结果
export interface ValidationResult {
  isValid: boolean
  message?: string
  errors?: ValidationError[]
}

// 验证规则
export interface ValidationRule<T = any> {
  validator: Validator<T>
  message?: string
}

// 验证器函数类型
export type Validator<T = any> = (value: T) => ValidationResult | boolean | string

// 异步验证器
export type AsyncValidator<T = any> = (value: T) => Promise<ValidationResult | boolean | string>

// 验证器组合
export type ValidatorComposer<T = any> = (...validators: Validator<T>[]) => Validator<T>

/**
 * 格式化器类型定义
 */

// 基础格式化器
export type Formatter<T = any, R = string> = (value: T) => R

// 日期格式化器
export type DateFormatter = (date: Date | string | number, format?: string) => string

// 数字格式化器
export type NumberFormatter = (value: number, options?: NumberFormatOptions) => string

// 货币格式化器
export type CurrencyFormatter = (value: number, currency?: string, locale?: string) => string

// 数字格式化选项
export interface NumberFormatOptions {
  decimals?: number
  thousandsSeparator?: string
  decimalSeparator?: string
  prefix?: string
  suffix?: string
}

/**
 * 辅助函数类型定义
 */

// 深度部分类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深度必需类型
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object | undefined ? DeepRequired<NonNullable<T[P]>> : T[P]
}

// 按类型选择属性
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

// 排除类型属性
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}

// 可选属性类型
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// 必需属性类型
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 函数工具类型定义
 */

// 防抖函数类型
export type DebounceFunction<T extends (...args: any[]) => any> = (
  func: T,
  delay: number
) => T & { cancel: () => void }

// 节流函数类型
export type ThrottleFunction<T extends (...args: any[]) => any> = (
  func: T,
  limit: number
) => T & { cancel: () => void }

// 深拷贝函数类型
export type DeepCloneFunction = <T>(obj: T) => T

// 深度合并函数类型
export type DeepMergeFunction = <T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U
) => T & U

// 管道函数类型
export type PipeFunction = <T>(...fns: Array<(arg: T) => T>) => (value: T) => T

// 组合函数类型
export type ComposeFunction = <T>(...fns: Array<(arg: T) => T>) => (value: T) => T

/**
 * 缓存类型定义
 */

// 缓存选项
export interface CacheOptions {
  maxSize?: number
  ttl?: number // 毫秒
  keyGenerator?: (...args: any[]) => string
}

// 缓存函数类型
export type CacheFunction = <T extends (...args: any[]) => any>(
  fn: T,
  options?: CacheOptions
) => T

/**
 * 事件处理类型定义
 */

// 事件处理器
export type EventHandler<T = any> = (event: T) => void

// 事件监听器
export interface EventListener<T = any> {
  id: string
  handler: EventHandler<T>
  once?: boolean
}

// 事件总线
export interface EventBus<T = any> {
  on: (event: string, handler: EventHandler<T>) => () => void
  once: (event: string, handler: EventHandler<T>) => () => void
  off: (event: string, handler: EventHandler<T>) => void
  emit: (event: string, data: T) => void
  clear: (event?: string) => void
}

/**
 * 工具函数接口定义
 */

// 工具函数集合接口
export interface Utils {
  // 验证相关
  validate: {
    required: Validator
    email: Validator<string>
    phone: Validator<string>
    idCard: Validator<string>
    minLength: (length: number) => Validator<string>
    maxLength: (length: number) => Validator<string>
    range: (min: number, max: number) => Validator<number>
    pattern: (regex: RegExp, message?: string) => Validator<string>
    compose: ValidatorComposer
  }

  // 格式化相关
  format: {
    date: DateFormatter
    number: NumberFormatter
    currency: CurrencyFormatter
    percent: (value: number, decimals?: number) => string
    fileSize: (bytes: number) => string
    duration: (seconds: number) => string
  }

  // 函数工具
  fn: {
    debounce: DebounceFunction
    throttle: ThrottleFunction
    memoize: CacheFunction
    pipe: PipeFunction
    compose: ComposeFunction
    curry: <T extends (...args: any[]) => any>(fn: T) => T
  }

  // 对象工具
  obj: {
    deepClone: DeepCloneFunction
    deepMerge: DeepMergeFunction
    pick: <T, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>
    omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>
    isEmpty: (obj: any) => boolean
    isEqual: (a: any, b: any) => boolean
  }

  // 数组工具
  arr: {
    unique: <T>(arr: T[], key?: (item: T) => any) => T[]
    groupBy: <T>(arr: T[], key: (item: T) => string) => Record<string, T[]>
    sortBy: <T>(arr: T[], key: (item: T) => any, order?: 'asc' | 'desc') => T[]
    chunk: <T>(arr: T[], size: number) => T[][]
    flatten: <T>(arr: any[]) => T[]
  }

  // 字符串工具
  str: {
    capitalize: (str: string) => string
    camelCase: (str: string) => string
    kebabCase: (str: string) => string
    snakeCase: (str: string) => string
    truncate: (str: string, length: number, suffix?: string) => string
    padStart: (str: string, length: number, padString?: string) => string
    padEnd: (str: string, length: number, padString?: string) => string
  }

  // 类型检查
  is: {
    string: (value: any) => value is string
    number: (value: any) => value is number
    boolean: (value: any) => value is boolean
    array: (value: any) => value is any[]
    object: (value: any) => value is Record<string, any>
    function: (value: any) => value is Function
    date: (value: any) => value is Date
    null: (value: any) => value is null
    undefined: (value: any) => value is undefined
    empty: (value: any) => boolean
  }
}

/**
 * 验证错误类型（扩展自通用错误）
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
  rule?: string
}

/**
 * 工具函数配置选项
 */
export interface UtilsConfig {
  validation?: {
    defaultMessages?: Record<string, string>
    customValidators?: Record<string, Validator>
  }
  format?: {
    dateFormat?: string
    numberFormat?: NumberFormatOptions
    currency?: string
    locale?: string
  }
  cache?: {
    defaultTtl?: number
    maxSize?: number
  }
}