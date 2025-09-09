import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { getHelloFromCloud, getEnvironmentInfo, getCloudBaseConfig } from '@/services/cloudbase';
import './index.scss';

/**
 * 首页组件
 * 演示 CloudBase 云函数调用（真实云函数版本）
 */
export default function Index() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理调用真实云函数按钮点击
   * 从 mock 切换到真实云函数调用
   */
  const handleCallCloudFunction = async () => {
    setLoading(true);
    try {
      // 直接调用真实云函数（HTTP 方式）
      console.log('正在调用 CloudBase 云函数...');
      const result = await getHelloFromCloud();
      console.log('云函数返回结果:', result);
      setMessage(result);
    } catch (error) {
      console.error('云函数调用失败:', error);
      setMessage(`云函数调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
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
        <Text className="title">CloudBase 云函数演示</Text>
        <Text className="subtitle">{getEnvironmentInfo()}</Text>
        <Text className="subtitle">真实云函数调用版本</Text>
      </View>

      <View className="content">
        <View className="card">
          <Text className="card-title">云函数调用演示</Text>
          <Text className="card-description">
            点击下方按钮调用真实的 CloudBase 云函数，体验云端计算能力
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
              <Text className="result-source">（真实云函数）</Text>
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
 * 1. 移除了模拟函数调用按钮
 * 2. 只保留真实云函数调用
 * 3. 按钮文案更新为"调用云函数"
 * 4. 状态显示为"真实云函数"
 * 5. 使用 HTTP 方式调用 CloudBase 云函数
 */