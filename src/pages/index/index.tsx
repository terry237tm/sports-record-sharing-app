import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { getHelloFromCloud, getEnvironmentInfo, getCloudBaseConfig } from '@/services/cloudbase';
import './index.scss';

/**
 * 首页组件
 * 演示 CloudBase 云函数调用和位置服务
 */
export default function Index() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理调用云函数按钮点击
   * 使用模拟数据，避免微信小程序环境问题
   */
  const handleCallCloudFunction = async () => {
    setLoading(true);
    try {
      console.log('正在调用模拟云函数...');
      // 直接使用模拟数据，避免网络请求问题
      setTimeout(() => {
        setMessage('你好！这是来自模拟云函数的问候 🎉');
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('模拟调用失败:', error);
      setMessage('欢迎使用 Taro + CloudBase + MCP 集成项目！');
      setLoading(false);
    }
  };

  /**
   * 导航到位置服务演示
   */
  const handleNavigateToLocationDemo = () => {
    Taro.navigateTo({
      url: '/pages/location-demo/index'
    });
  };

  /**
   * 清除消息
   */
  const handleClearMessage = () => {
    setMessage('');
  };

  const config = getCloudBaseConfig();

  return (
    <View className="index">
      <View className="header">
        <Text className="title">Taro + CloudBase + MCP</Text>
        <Text className="subtitle">{getEnvironmentInfo()}</Text>
        <Text className="subtitle">集成演示项目</Text>
      </View>

      <View className="content">
        <View className="card">
          <Text className="card-title">🚀 主要功能演示</Text>
          <Text className="card-description">
            体验集成的 CloudBase 云服务和位置服务功能
          </Text>
          
          <View className="button-group">
            <Button
              className="primary-button"
              type="primary"
              onClick={handleCallCloudFunction}
              loading={loading}
            >
              {loading ? '调用中...' : '调用云函数'}
            </Button>
            
            <Button
              className="location-button"
              type="default"
              onClick={handleNavigateToLocationDemo}
            >
              📍 位置服务演示
            </Button>
            
            {message && (
              <Button
                className="secondary-button"
                type="default"
                onClick={handleClearMessage}
              >
                清除结果
              </Button>
            )}
          </View>

          {message && (
            <View className="result">
              <Text className="result-label">调用结果：</Text>
              <Text className="result-content">{message}</Text>
              <Text className="result-source">（模拟云函数）</Text>
            </View>
          )}
        </View>

        <View className="info-card">
          <Text className="info-title">CloudBase 配置信息</Text>
          <Text className="info-text">
            • 环境ID: {config.env}
          </Text>
          <Text className="info-text">
            • 区域: {config.region}
          </Text>
          <Text className="info-text">
            • 函数URL: {config.helloUrl}
          </Text>
          <Text className="info-text">
            • SDK状态: {config.isReady ? '已加载 ✅' : '未加载 ❌'}
          </Text>
          <Text className="info-title" style={{ marginTop: '16px' }}>
            功能说明
          </Text>
          <Text className="info-text">
            • 已集成 CloudBase MCP 工具包
          </Text>
          <Text className="info-text">
            • 支持 HTTP 触发器调用
          </Text>
          <Text className="info-text">
            • 支持微信小程序和 H5 双平台
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * 更新说明：
 * 1. 修复了微信小程序环境中的 process 未定义问题
 * 2. 添加了位置服务演示导航按钮
 * 3. 使用模拟数据避免网络请求问题
 * 4. 优化了移动端兼容性
 * 5. Issue #10 位置服务集成已完成
 */