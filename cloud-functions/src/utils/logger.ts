import * as fs from 'fs'
import * as path from 'path'
import { DateUtil } from './index'

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  logDir: string
  maxFileSize: number // 最大文件大小（字节）
  maxFiles: number // 最大文件数量
  enableColors: boolean
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: any
  stack?: string
  userId?: string
  requestId?: string
  ip?: string
  userAgent?: string
}

/**
 * 日志格式化器
 */
export class LogFormatter {
  /**
   * 格式化为 JSON 格式
   */
  static formatJson(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  /**
   * 格式化为可读格式
   */
  static formatReadable(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const stackStr = entry.stack ? `\nStack: ${entry.stack}` : ''
    return `[${entry.timestamp}] [${entry.level}] ${entry.message}${contextStr}${stackStr}`
  }

  /**
   * 格式化为控制台带颜色输出
   */
  static formatColored(entry: LogEntry): string {
    const colors = {
      DEBUG: '\x1b[36m', // 青色
      INFO: '\x1b[32m',  // 绿色
      WARN: '\x1b[33m',  // 黄色
      ERROR: '\x1b[31m', // 红色
      FATAL: '\x1b[35m'  // 紫色
    }
    const reset = '\x1b[0m'
    
    const color = colors[entry.level as keyof typeof colors] || ''
    const formatted = this.formatReadable(entry)
    return `${color}${formatted}${reset}`
  }
}

/**
 * 日志文件管理器
 */
export class LogFileManager {
  private logDir: string
  private maxFileSize: number
  private maxFiles: number

  constructor(logDir: string, maxFileSize: number, maxFiles: number) {
    this.logDir = logDir
    this.maxFileSize = maxFileSize
    this.maxFiles = maxFiles
    this.ensureLogDirectory()
  }

  /**
   * 确保日志目录存在
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  /**
   * 获取日志文件路径
   */
  private getLogFilePath(level: string): string {
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    return path.join(this.logDir, `${level}-${date}.log`)
  }

  /**
   * 写入日志文件
   */
  writeLog(level: string, content: string): void {
    try {
      const logFile = this.getLogFilePath(level)
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] ${content}\n`
      
      // 检查文件大小并轮换
      this.rotateLogFile(logFile)
      
      fs.appendFileSync(logFile, logEntry, 'utf8')
    } catch (error) {
      console.error('写入日志文件失败:', error)
    }
  }

  /**
   * 轮换日志文件
   */
  private rotateLogFile(logFile: string): void {
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile)
        if (stats.size >= this.maxFileSize) {
          const backupFile = `${logFile}.${Date.now()}`
          fs.renameSync(logFile, backupFile)
          this.cleanupOldFiles()
        }
      }
    } catch (error) {
      console.error('轮换日志文件失败:', error)
    }
  }

  /**
   * 清理旧日志文件
   */
  private cleanupOldFiles(): void {
    try {
      const files = fs.readdirSync(this.logDir)
      const logFiles = files.filter(file => file.endsWith('.log'))
      
      if (logFiles.length > this.maxFiles) {
        // 按修改时间排序，删除最旧的文件
        logFiles.sort((a, b) => {
          const aPath = path.join(this.logDir, a)
          const bPath = path.join(this.logDir, b)
          return fs.statSync(aPath).mtime.getTime() - fs.statSync(bPath).mtime.getTime()
        })
        
        const filesToDelete = logFiles.slice(0, logFiles.length - this.maxFiles)
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(path.join(this.logDir, file))
          } catch (error) {
            console.error(`删除日志文件失败: ${file}`, error)
          }
        })
      }
    } catch (error) {
      console.error('清理旧日志文件失败:', error)
    }
  }
}

/**
 * 高级日志记录器
 */
export class AdvancedLogger {
  private config: LoggerConfig
  private fileManager?: LogFileManager
  private requestId: string

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      logDir: 'logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      enableColors: true,
      ...config
    }

    if (this.config.enableFile) {
      this.fileManager = new LogFileManager(
        this.config.logDir,
        this.config.maxFileSize,
        this.config.maxFiles
      )
    }

    this.requestId = this.generateRequestId()
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 设置请求ID
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(level: LogLevel, message: string, context?: any): LogEntry {
    const levelName = LogLevel[level]
    return {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      context,
      requestId: this.requestId
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  /**
   * 写入日志
   */
  private writeLog(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, message, context)
    
    // 控制台输出
    if (this.config.enableConsole) {
      const formatted = this.config.enableColors 
        ? LogFormatter.formatColored(entry)
        : LogFormatter.formatReadable(entry)
      
      if (level >= LogLevel.ERROR) {
        console.error(formatted)
      } else if (level === LogLevel.WARN) {
        console.warn(formatted)
      } else {
        console.log(formatted)
      }
    }

    // 文件输出
    if (this.config.enableFile && this.fileManager) {
      const formatted = LogFormatter.formatJson(entry)
      this.fileManager.writeLog(LogLevel[level], formatted)
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, context?: any): void {
    this.writeLog(LogLevel.DEBUG, message, context)
  }

  /**
   * 信息日志
   */
  info(message: string, context?: any): void {
    this.writeLog(LogLevel.INFO, message, context)
  }

  /**
   * 警告日志
   */
  warn(message: string, context?: any): void {
    this.writeLog(LogLevel.WARN, message, context)
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error | any, context?: any): void {
    const logContext = {
      ...context,
      ...(error && {
        error: error.message || error,
        stack: error.stack
      })
    }
    this.writeLog(LogLevel.ERROR, message, logContext)
  }

  /**
   * 致命错误日志
   */
  fatal(message: string, error?: Error | any, context?: any): void {
    const logContext = {
      ...context,
      ...(error && {
        error: error.message || error,
        stack: error.stack
      })
    }
    this.writeLog(LogLevel.FATAL, message, logContext)
  }

  /**
   * 记录请求信息
   */
  logRequest(req: any): void {
    this.info('HTTP 请求', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.userId || 'anonymous'
    })
  }

  /**
   * 记录响应信息
   */
  logResponse(req: any, res: any, responseTime: number): void {
    this.info('HTTP 响应', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.userId || 'anonymous'
    })
  }

  /**
   * 记录数据库操作
   */
  logDatabase(operation: string, collection: string, query?: any, duration?: number): void {
    this.info('数据库操作', {
      operation,
      collection,
      query,
      duration: duration ? `${duration}ms` : undefined
    })
  }

  /**
   * 记录性能指标
   */
  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info('性能指标', {
      metric,
      value,
      unit
    })
  }
}

/**
 * 全局日志实例
 */
export const logger = new AdvancedLogger({
  level: process.env['LOG_LEVEL'] ? parseInt(process.env['LOG_LEVEL']) : LogLevel.INFO,
  enableConsole: true,
  enableFile: process.env['ENABLE_FILE_LOG'] === 'true',
  logDir: process.env['LOG_DIR'] || 'logs',
  enableColors: process.env['NODE_ENV'] !== 'production'
})

/**
 * 简化的日志接口（向后兼容）
 */
export class Logger {
  static info(message: string, ...args: any[]): void {
    logger.info(message, ...args)
  }

  static error(message: string, ...args: any[]): void {
    logger.error(message, ...args)
  }

  static warn(message: string, ...args: any[]): void {
    logger.warn(message, ...args)
  }

  static debug(message: string, ...args: any[]): void {
    logger.debug(message, ...args)
  }
}