/**
 * CloudBase 云函数 hello
 * 返回简单的问候消息
 */

import type { APIGatewayProxyHandler } from 'aws-lambda';

/**
 * 主函数入口
 * 返回 Hello from CloudBase Function 消息
 */
export const main: APIGatewayProxyHandler = async (event, context) => {
  console.log('CloudBase Hello Function Triggered');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  try {
    // 获取当前时间戳
    const timestamp = new Date().toISOString();
    
    // 构建响应数据
    const responseData = {
      msg: 'Hello from CloudBase Function',
      timestamp: timestamp,
      env: process.env.TCB_ENV || 'development',
      version: '1.0.0'
    };

    console.log('Response Data:', responseData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Function Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// 兼容 CommonJS 模块系统
export default main;