/**
 * 字符串工具函数
 */
export class StringUtil {
  /**
   * 去除字符串两端空白字符
   */
  static trim(str: string): string {
    return str.trim()
  }

  /**
   * 去除字符串所有空白字符
   */
  static trimAll(str: string): string {
    return str.replace(/\s/g, '')
  }

  /**
   * 检查字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0
  }

  /**
   * 检查字符串是否不为空
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str)
  }

  /**
   * 字符串截断
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str
    }
    return str.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * 首字母大写
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  /**
   * 驼峰命名转下划线
   */
  static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }

  /**
   * 下划线转驼峰命名
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  /**
   * 生成随机字符串
   */
  static randomString(length: number = 8, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const chars = charset || defaultCharset
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 生成UUID v4
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 字符串脱敏
   */
  static mask(str: string, start: number = 3, end: number = 3, maskChar: string = '*'): string {
    if (str.length <= start + end) {
      return str.charAt(0) + maskChar.repeat(str.length - 2) + str.charAt(str.length - 1)
    }
    return str.substring(0, start) + maskChar.repeat(str.length - start - end) + str.substring(str.length - end)
  }

  /**
   * 手机号脱敏
   */
  static maskPhone(phone: string): string {
    return this.mask(phone, 3, 4)
  }

  /**
   * 身份证号脱敏
   */
  static maskIdCard(idCard: string): string {
    return this.mask(idCard, 4, 4)
  }

  /**
   * 邮箱脱敏
   */
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@')
    if (localPart.length <= 3) {
      return `${localPart.charAt(0)}***@${domain}`
    }
    return `${localPart.substring(0, 3)}***@${domain}`
  }

  /**
   * 提取字符串中的数字
   */
  static extractNumbers(str: string): string {
    return str.replace(/\D/g, '')
  }

  /**
   * 提取字符串中的字母
   */
  static extractLetters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '')
  }

  /**
   * 判断是否为数字字符串
   */
  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str)
  }

  /**
   * 判断是否为字母字符串
   */
  static isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str)
  }

  /**
   * 判断是否为字母数字字符串
   */
  static isAlphaNumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str)
  }

  /**
   * 判断是否为中文
   */
  static isChinese(str: string): boolean {
    return /^[\u4e00-\u9fa5]+$/.test(str)
  }

  /**
   * 计算字符串字节长度（考虑中文）
   */
  static byteLength(str: string): number {
    let length = 0
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      length += charCode > 255 ? 2 : 1
    }
    return length
  }

  /**
   * 按字节长度截断字符串
   */
  static truncateByBytes(str: string, maxBytes: number, suffix: string = '...'): string {
    if (this.byteLength(str) <= maxBytes) {
      return str
    }

    let result = ''
    let bytes = 0
    const suffixBytes = this.byteLength(suffix)
    const availableBytes = maxBytes - suffixBytes

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const charBytes = this.byteLength(char)
      
      if (bytes + charBytes > availableBytes) {
        break
      }
      
      result += char
      bytes += charBytes
    }

    return result + suffix
  }

  /**
   * HTML转义
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return str.replace(/[&<>"']/g, match => htmlEscapes[match])
  }

  /**
   * HTML反转义
   */
  static unescapeHtml(str: string): string {
    const htmlUnescapes: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    }
    return str.replace(/\u0026(?:amp|lt|gt|quot|#39);/g, match => htmlUnescapes[match])
  }

  /**
   * 判断是否为JSON字符串
   */
  static isJsonString(str: string): boolean {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  /**
   * 安全解析JSON字符串
   */
  static safeJsonParse(str: string, defaultValue: any = null): any {
    try {
      return JSON.parse(str)
    } catch {
      return defaultValue
    }
  }
}