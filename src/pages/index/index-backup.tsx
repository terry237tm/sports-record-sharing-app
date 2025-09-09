import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { getHelloFromMock, getHelloFromCloud, getEnvironmentInfo, getCloudBaseConfig } from '@/services/cloudbase';
import './index.scss';

/**
 * 首页组件
 * 演示 CloudBase MCP 集成功能
 */
export default function Index() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useRealCloud, setUseRealCloud] = useState<boolean>(false);

  /**
   * 处理调用模拟云函数按钮点击
   */
  const handleCallMockFunction = async () => {
    setLoading(true);
    try {
      const result = await getHelloFromMock();
      setMessage(result);
      setUseRealCloud(false);
    } catch (error) {
      setMessage(`调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理调用真实云函数按钮点击
   */
  const handleCallRealCloudFunction = async () => {
    setLoading(true);
    try {
      const result = await getHelloFromCloud();
      setMessage(result);
      setUseRealCloud(true);
    } catch (error) {
      setMessage(`真实云函数调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setUseRealCloud(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 清除消息
   */
  const handleClearMessage = () => {
    setMessage('');
    setUseRealCloud(false);
  };

  const config = getCloudBaseConfig();

  return (
    <View className="index">
      <View className="header">
        <Text className="title">Taro + CloudBase MCP 演示</Text>
        <Text className="subtitle">{getEnvironmentInfo()}</Text>
      </View>

      <View className="content">
        <View className="card">
          <Text className="card-title">云函数调用演示</Text>
          <Text className="card-description">
            点击下方按钮调用云函数，体验 CloudBase MCP 集成效果
          </Text>
          
          <View className="button-group">
            <Button
              className="primary-button"
              type="primary"
              onClick={handleCallMockFunction}
              loading={loading && !useRealCloud}
            >
              {loading && !useRealCloud ? '调用中...' : '调用模拟函数'}
            </Button>

            <Button
              className="secondary-button"
              type="primary"
              onClick={handleCallRealCloudFunction}
              loading={loading && useRealCloud}
            >
              {loading && useRealCloud ? '调用中...' : '调用真实云函数'}
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
              <Text className="result-source">
                {useRealCloud ? '（真实云函数）' : '（模拟数据）'}
              </Text>
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
            • SDK状态: {config.isReady ? '已加载 ✅' : '未加载 ❌'}
          </Text>
          <Text className="info-title" style={{ marginTop: '16px' }}>
            集成说明
          </Text>
          <Text className="info-text">
            • 支持模拟数据和真实云函数双模式
          </Text>
          <Text className="info-text">
            • 已集成 CloudBase MCP 工具包
          </Text>
          <Text className="info-text">
            • 支持微信小程序和 H5 双平台
          </Text>
        </View>
      </View>
    </View>
  );
}