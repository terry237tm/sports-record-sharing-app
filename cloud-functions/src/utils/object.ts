/**
 * 对象工具函数
 */
export class ObjectUtil {
  /**
   * 深拷贝
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 浅拷贝
   */
  static shallowClone<T>(obj: T): T {
    return { ...obj }
  }

  /**
   * 合并对象（浅合并）
   */
  static merge<T extends object, U extends object>(target: T, source: U): T & U {
    return { ...target, ...source }
  }

  /**
   * 深度合并对象
   */
  static deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    const result = this.deepClone(target) as any
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (this.isObject(source[key]) && this.isObject(result[key])) {
          result[key] = this.deepMerge(result[key], source[key])
        } else {
          result[key] = this.deepClone(source[key])
        }
      }
    }
    
    return result
  }

  /**
   * 检查是否为对象
   */
  static isObject(obj: any): obj is object {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  }

  /**
   * 检查对象是否为空
   */
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0
  }

  /**
   * 获取对象的所有键
   */
  static keys(obj: object): string[] {
    return Object.keys(obj)
  }

  /**
   * 获取对象的所有值
   */
  static values(obj: object): any[] {
    return Object.values(obj)
  }

  /**
   * 获取对象的所有键值对
   */
  static entries(obj: object): [string, any][] {
    return Object.entries(obj)
  }

  /**
   * 检查对象是否包含指定键
   */
  static hasKey(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }

  /**
   * 安全获取对象属性值
   */
  static get(obj: object, path: string, defaultValue?: any): any {
    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
      if (result && this.hasKey(result, key)) {
        result = result[key]
      } else {
        return defaultValue
      }
    }

    return result
  }

  /**
   * 安全设置对象属性值
   */
  static set(obj: object, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj as any

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!this.hasKey(current, key) || !this.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 安全删除对象属性
   */
  static unset(obj: object, path: string): boolean {
    const keys = path.split('.')
    let current = obj as any

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!this.hasKey(current, key) || !this.isObject(current[key])) {
        return false
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]
    if (this.hasKey(current, lastKey)) {
      delete current[lastKey]
      return true
    }

    return false
  }

  /**
   * 获取对象指定路径的值，如果不存在则创建
   */
  static ensurePath(obj: object, path: string, defaultValue: any = {}): any {
    const value = this.get(obj, path)
    if (value === undefined) {
      this.set(obj, path, defaultValue)
      return defaultValue
    }
    return value
  }

  /**
   * 过滤对象属性
   */
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (this.hasKey(obj, key as string)) {
        result[key] = obj[key]
      }
    })
    return result
  }

  /**
   * 排除对象属性
   */
  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  }

  /**
   * 转换对象键名
   */
  static mapKeys(obj: object, mapper: (key: string) => string): object {
    const result = {}
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        const newKey = mapper(key)
        result[newKey] = obj[key]
      }
    }
    return result
  }

  /**
   * 转换对象值
   */
  static mapValues(obj: object, mapper: (value: any, key: string) => any): object {
    const result = {}
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        result[key] = mapper(obj[key], key)
      }
    }
    return result
  }

  /**
   * 过滤对象属性
   */
  static filter(obj: object, predicate: (value: any, key: string) => boolean): object {
    const result = {}
    for (const key in obj) {
      if (this.hasKey(obj, key) && predicate(obj[key], key)) {
        result[key] = obj[key]
      }
    }
    return result
  }

  /**
   * 遍历对象
   */
  static forEach(obj: object, callback: (value: any, key: string) => void): void {
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        callback(obj[key], key)
      }
    }
  }

  /**
   * 检查两个对象是否相等（浅比较）
   */
  static isEqualShallow(a: object, b: object): boolean {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) {
      return false
    }
    
    for (const key of keysA) {
      if (!this.hasKey(b, key) || a[key] !== b[key]) {
        return false
      }
    }
    
    return true
  }

  /**
   * 检查两个对象是否相等（深比较）
   */
  static isEqualDeep(a: any, b: any): boolean {
    if (a === b) return true
    
    if (a === null || b === null) return false
    if (a === undefined || b === undefined) return false
    
    if (typeof a !== typeof b) return false
    
    if (typeof a !== 'object') return a === b
    
    if (Array.isArray(a) !== Array.isArray(b)) return false
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!this.isEqualDeep(a[i], b[i])) return false
      }
      return true
    }
    
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!this.hasKey(b, key)) return false
      if (!this.isEqualDeep(a[key], b[key])) return false
    }
    
    return true
  }

  /**
   * 扁平化对象
   */
  static flatten(obj: object, prefix: string = '', result: any = {}): any {
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        
        if (this.isObject(value) && !Array.isArray(value) && Object.keys(value).length > 0) {
          this.flatten(value, newKey, result)
        } else {
          result[newKey] = value
        }
      }
    }
    return result
  }

  /**
   * 反扁平化对象
   */
  static unflatten(obj: object): any {
    const result = {}
    
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        this.set(result, key, obj[key])
      }
    }
    
    return result
  }

  /**
   * 获取对象的深度
   */
  static getDepth(obj: any): number {
    if (!this.isObject(obj) && !Array.isArray(obj)) {
      return 0
    }
    
    let maxDepth = 0
    for (const key in obj) {
      if (this.hasKey(obj, key)) {
        const depth = this.getDepth(obj[key])
        maxDepth = Math.max(maxDepth, depth)
      }
    }
    
    return maxDepth + 1
  }

  /**
   * 安全转换为字符串
   */
  static safeStringify(obj: any, space: number = 2): string {
    try {
      return JSON.stringify(obj, null, space)
    } catch (error) {
      return String(obj)
    }
  }

  /**
   * 安全解析JSON
   */
  static safeParse(str: string, defaultValue: any = null): any {
    try {
      return JSON.parse(str)
    } catch (error) {
      return defaultValue
    }
  }

  /**
   * 创建对象的快照（只读副本）
   */
  static snapshot<T extends object>(obj: T): Readonly<T> {
    return Object.freeze(this.deepClone(obj))
  }

  /**
   * 比较两个对象的差异
   */
  static diff(oldObj: any, newObj: any): any {
    const diff = {}
    
    // 检查新增和修改的属性
    for (const key in newObj) {
      if (this.hasKey(newObj, key)) {
        if (!this.hasKey(oldObj, key)) {
          diff[key] = { type: 'added', value: newObj[key] }
        } else if (!this.isEqualDeep(oldObj[key], newObj[key])) {
          diff[key] = { type: 'modified', oldValue: oldObj[key], newValue: newObj[key] }
        }
      }
    }
    
    // 检查删除的属性
    for (const key in oldObj) {
      if (this.hasKey(oldObj, key) && !this.hasKey(newObj, key)) {
        diff[key] = { type: 'deleted', value: oldObj[key] }
      }
    }
    
    return diff
  }

  /**
   * 应用差异到对象
   */
  static applyDiff(obj: any, diff: any): any {
    const result = this.deepClone(obj)
    
    for (const key in diff) {
      if (this.hasKey(diff, key)) {
        const change = diff[key]
        
        switch (change.type) {
          case 'added':
          case 'modified':
            result[key] = change.value || change.newValue
            break
          case 'deleted':
            delete result[key]
            break
        }
      }
    }
    
    return result
  }
}