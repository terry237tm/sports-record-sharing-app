import * as cloudbase from '@cloudbase/node-sdk'
import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { errorHandler, notFoundHandler } from './middleware'
import apiRoutes from './routes'

// 加载环境变量
dotenv.config()

// 云开发应用初始化
cloudbase.init({
  env: process.env['CLOUDBASE_ENV_ID'] || cloudbase.SYMBOL_CURRENT_ENV,
  region: process.env['CLOUDBASE_REGION'] || 'ap-shanghai'
})

// Express 应用创建
const expressApp = express()

// 中间件配置
expressApp.use(cors())
expressApp.use(express.json({ limit: '10mb' }))
expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志中间件
expressApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// 健康检查接口
expressApp.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sports-record-sharing-cloud-functions',
    version: '1.0.0'
  })
})

// API 路由
expressApp.use('/api', apiRoutes)

// API 信息接口
expressApp.get('/api', (_req, res) => {
  res.json({
    message: '运动记录分享小程序云函数 API',
    version: '1.0.0',
    endpoints: [
      'GET /health - 健康检查',
      'GET /api - API 信息',
      'POST /api/users/login - 用户登录',
      'POST /api/users/register - 用户注册',
      'GET /api/users/profile - 用户资料',
      'PUT /api/users/profile - 更新用户资料',
      'POST /api/records - 创建运动记录',
      'GET /api/records - 获取运动记录列表',
      'GET /api/records/:id - 获取运动记录详情',
      'PUT /api/records/:id - 更新运动记录',
      'DELETE /api/records/:id - 删除运动记录'
    ]
  })
})

// 错误处理中间件
expressApp.use(errorHandler)

// 404 处理
expressApp.use(notFoundHandler)

// 云函数入口
export const main = async (event: any, context: any) => {
  try {
    console.log('云函数启动:', {
      event,
      context,
      timestamp: new Date().toISOString()
    })

    // 将云函数事件转换为 Express 请求
    const serverless = require('serverless-http')
    const handler = serverless(expressApp)
    
    return await handler(event, context)
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: {
          message: '云函数执行失败',
          code: 'FUNCTION_ERROR',
          timestamp: new Date().toISOString()
        }
      })
    }
  }
}

// 本地开发模式
if (process.env['NODE_ENV'] === 'development') {
  const PORT = process.env['PORT'] || 3000
  expressApp.listen(PORT, () => {
    console.log(`云函数本地开发服务器运行在端口 ${PORT}`)
    console.log(`健康检查: http://localhost:${PORT}/health`)
    console.log(`API 文档: http://localhost:${PORT}/api`)
  })
}

export default main