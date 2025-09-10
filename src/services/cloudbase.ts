/**
 * 云服务集成模块
 * 提供模拟数据和云函数调用的接口
 * 已集成 CloudBase MCP 功能
 */

/**
 * CloudBase 配置信息
 */
const CLOUDBASE_CONFIG = {
  env: process.env.CLOUDBASE_ENV || 'your-env-id',
  region: process.env.CLOUDBASE_REGION || 'ap-guangzhou',
  helloUrl: process.env.TARO_APP_CLOUDBASE_HELLO_URL || 'https://example.app.cloudbase.net/hello'
};

/**
 * 从模拟数据获取问候语
 * 当前使用本地模拟数据，用于开发和测试
 * @returns 返回问候语
 */
export async function getHelloFromMock(): Promise<string> {
  // 模拟异步请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return '你好！这是来自模拟云函数的问候 🎉';
}

/**
 * 从真实云函数获取问候语（HTTP 调用方式）
 * 使用 CloudBase HTTP 触发器调用真实云函数
 * @returns 返回云函数执行结果
 */
export async function getHelloFromCloud(): Promise<string> {
  try {
    console.log('正在调用 CloudBase 云函数:', CLOUDBASE_CONFIG.helloUrl);
    
    const response = await fetch(CLOUDBASE_CONFIG.helloUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态: ${response.status}`);
    }

    const data = await response.json();
    console.log('云函数响应:', data);

    // 返回消息或默认值
    return data.msg ?? 'No message';
    
  } catch (error) {
    console.error('云函数 HTTP 调用错误:', error);
    
    // 如果云函数调用失败，回退到模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.log('开发环境：云函数调用失败，使用模拟数据');
      return await getHelloFromMock();
    }
    
    throw new Error(`云函数调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 从真实云函数获取问候语（SDK 调用方式）
 * 使用 CloudBase SDK 调用云函数（备用方案）
 * @returns 返回云函数执行结果
 */
export async function getHelloFromCloudSDK(): Promise<string> {
  try {
    // 检查 CloudBase SDK 是否可用
    if (typeof window !== 'undefined' && (window as any).cloudbase) {
      // 使用 CloudBase JS SDK
      const cloudbase = (window as any).cloudbase;
      
      // 初始化 CloudBase
      const app = cloudbase.init({
        env: CLOUDBASE_CONFIG.env
      });
      
      // 调用云函数
      const result = await app.callFunction({
        name: 'hello',
        data: {
          userInfo: {
            nickName: 'Taro用户',
            avatarUrl: '',
            timestamp: Date.now()
          }
        }
      });
      
      if (result.result && result.result.code === 0) {
        return result.result.message || '云函数调用成功';
      } else {
        throw new Error(result.result?.message || '云函数返回错误');
      }
    } else {
      // CloudBase SDK 未加载，回退到 HTTP 调用
      console.warn('CloudBase SDK 未加载，使用 HTTP 调用');
      return await getHelloFromCloud();
    }
  } catch (error) {
    console.error('云函数 SDK 调用错误:', error);
    
    // 如果云函数调用失败，回退到 HTTP 调用或模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.log('开发环境：云函数 SDK 调用失败，使用 HTTP 调用');
      return await getHelloFromCloud();
    }
    
    throw new Error(`云函数 SDK 调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 初始化 CloudBase
 * 在应用启动时调用
 */
export function initCloudBase(): void {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined') {
    // 动态加载 CloudBase JS SDK
    const script = document.createElement('script');
    script.src = 'https://imgcache.qq.com/qcloud/cloudbase-js-sdk/1.8.0/cloudbase.full.js';
    script.onload = () => {
      console.log('CloudBase JS SDK 加载成功');
    };
    script.onerror = () => {
      console.error('CloudBase JS SDK 加载失败');
    };
    document.head.appendChild(script);
  }
}

/**
 * 检查 CloudBase 是否已初始化
 */
export function isCloudBaseReady(): boolean {
  return typeof window !== 'undefined' && (window as any).cloudbase !== undefined;
}

/**
 * 获取当前环境信息
 * @returns 返回环境信息
 */
export function getEnvironmentInfo(): string {
  if (process.env.TARO_ENV === 'weapp') {
    return '微信小程序环境';
  } else if (process.env.TARO_ENV === 'h5') {
    return 'H5 网页环境';
  }
  return '未知环境';
}

/**
 * 获取 CloudBase 配置信息
 */
export function getCloudBaseConfig() {
  return {
    ...CLOUDBASE_CONFIG,
    isReady: isCloudBaseReady()
  };
}

/**
 * 云函数调用服务
 * 提供统一的云函数调用接口
 */
export class CloudbaseService {
  /**
   * 调用云函数
   * @param name 云函数名称
   * @param data 传递给云函数的参数
   * @returns 返回云函数执行结果
   */
  async callFunction(name: string, data: any = {}): Promise<any> {
    try {
      // 检查 CloudBase SDK 是否可用
      if (typeof window !== 'undefined' && (window as any).cloudbase) {
        // 使用 CloudBase JS SDK
        const cloudbase = (window as any).cloudbase;
        
        // 初始化 CloudBase（如果还没有初始化）
        if (!this.app) {
          this.app = cloudbase.init({
            env: CLOUDBASE_CONFIG.env
          });
        }
        
        // 调用云函数
        const result = await this.app.callFunction({
          name,
          data
        });
        
        if (result.result && result.result.code === 0) {
          return {
            success: true,
            data: result.result.data,
            message: result.result.message
          };
        } else {
          return {
            success: false,
            message: result.result?.message || '云函数返回错误',
            data: null
          };
        }
      } else {
        // CloudBase SDK 未加载，使用模拟数据
        console.warn('CloudBase SDK 未加载，使用模拟数据');
        return this.getMockResponse(name, data);
      }
    } catch (error) {
      console.error('云函数调用错误:', error);
      
      // 如果云函数调用失败，使用模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境：云函数调用失败，使用模拟数据');
        return this.getMockResponse(name, data);
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : '云函数调用失败',
        data: null
      };
    }
  }
  
  private app: any = null;
  
  /**
   * 获取模拟响应数据
   * @param name 云函数名称
   * @param data 请求参数
   * @returns 模拟响应数据
   */
  private getMockResponse(name: string, _data: any): any {
    // 这里可以根据不同的云函数名称返回相应的模拟数据
    switch (name) {
      case 'loginUser':
        return {
          success: true,
          data: {
            userInfo: {
              openid: 'mock_openid_' + Date.now(),
              nickname: 'MockUser',
              avatar: '/assets/images/default-avatar.png'
            },
            session: {
              openid: 'mock_openid_' + Date.now(),
              sessionKey: 'mock_session_key',
              expiresIn: 7200,
              createTime: Date.now(),
              lastActiveTime: Date.now()
            },
            token: 'mock_jwt_token_' + Date.now(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isNewUser: false
          },
          message: '登录成功'
        };
      
      case 'getUserInfo':
        return {
          success: true,
          data: {
            openid: 'mock_openid_' + Date.now(),
            nickname: 'MockUser',
            avatar: '/assets/images/default-avatar.png',
            gender: 1,
            city: '北京',
            province: '北京',
            country: '中国',
            language: 'zh_CN'
          },
          message: '获取用户信息成功'
        };
      
      default:
        return {
          success: true,
          data: null,
          message: '模拟响应'
        };
    }
  }
}

// 创建 CloudbaseService 实例
export const cloudbaseService = new CloudbaseService();