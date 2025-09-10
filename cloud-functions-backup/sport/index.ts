/**
 * 运动记录云函数入口文件
 */

import { main } from './src/handlers'
import { CloudFunctionEvent, CloudFunctionContext } from './src/types'
import { initCloudBase } from './src/utils/cloudbase'

// 初始化 CloudBase
initCloudBase()

// 云函数入口
exports.main = async (event: CloudFunctionEvent, context: CloudFunctionContext) => {
  try {
    // 记录请求日志
    console.log('云函数请求:', {
      action: event.action,
      userInfo: event.userInfo,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    })

    // 执行主函数
    const result = await main(event, context)
    
    // 记录响应日志
    console.log('云函数响应:', {
      action: event.action,
      code: result.code,
      message: result.message,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    })

    return result
  } catch (error) {
    console.error('云函数执行错误:', error)
    
    return {
      code: 500,
      message: '云函数执行失败',
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 用于本地测试
if (require.main === module) {
  // 本地测试代码
  const testEvent: CloudFunctionEvent = {
    action: 'getSportStatistics',
    data: { period: 'all' },
    userInfo: {
      openid: 'test-openid',
      appid: 'test-appid'
    }
  }

  const testContext: CloudFunctionContext = {
    requestId: 'test-request-id',
    environment: 'local',
    functionName: 'sport',
    functionVersion: '1.0.0',
    memoryLimitInMB: 512,
    timeLimitInMS: 30000
  }

  exports.main(testEvent, testContext).then(result => {
    console.log('本地测试结果:', result)
  }).catch(error => {
    console.error('本地测试错误:', error)
  })
}