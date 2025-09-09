# CloudBase MCP Tools 集成指南

## 📋 概述
本文档记录了如何将 Taro 项目与腾讯云 CloudBase MCP Tools 集成的完整步骤。

## 🎯 集成目标
- 实现真实云函数调用
- 替换当前的模拟数据
- 支持云端数据存储和处理

## 📝 集成步骤

### ✅ 步骤 1: 安装 CloudBase MCP 依赖（已完成）
```bash
# 安装 CloudBase MCP 工具包 - 开发依赖
pnpm add -D @cloudbase/cloudbase-mcp
```

**状态**: ✅ 已完成安装
**版本**: ^1.8.42
**位置**: devDependencies

### ✅ 步骤 2: 前端代码集成（已完成）

**状态**: ✅ 已完成 CloudBase 前端集成

#### 集成特性
- ✅ **双模式支持**: 模拟数据 + 真实云函数
- ✅ **智能回退**: 云函数失败时自动使用模拟数据
- ✅ **动态 SDK 加载**: 运行时加载 CloudBase JS SDK
- ✅ **环境检测**: 自动检测 SDK 加载状态
- ✅ **错误处理**: 完善的错误捕获和提示

#### 核心文件
- `src/services/cloudbase.ts` - 云服务集成模块
- `src/pages/index/index.tsx` - 演示页面（支持双模式切换）

#### 使用说明
```typescript
// 调用模拟云函数（开发测试）
import { getHelloFromMock } from '@/services/cloudbase';
const result = await getHelloFromMock();

// 调用真实云函数（生产环境）
import { getHelloFromCloud } from '@/services/cloudbase';
const result = await getHelloFromCloud();

// 检查 CloudBase 状态
import { isCloudBaseReady, getCloudBaseConfig } from '@/services/cloudbase';
const isReady = isCloudBaseReady();
const config = getCloudBaseConfig();
```

### 步骤 3: 创建云函数
使用 CloudBase MCP 在 IDE 中创建云函数：

```typescript
// 云函数示例: hello-cloud
export async function main(event: any, context: any) {
  const { userInfo } = event;
  
  return {
    code: 0,
    message: 'Hello from CloudBase!',
    data: {
      timestamp: Date.now(),
      userInfo,
      env: 'production'
    }
  };
}
```

### 步骤 4: 部署云函数
通过 CloudBase MCP 部署云函数到云端：
```bash
# 使用 MCP 命令部署
/cloudbase deploy hello-cloud
```

### 步骤 5: 修改前端代码
更新 `src/services/cloudbase.ts` 中的 `getHelloFromCloud` 方法：

```typescript
import cloudbase from '@cloudbase/js-sdk';

// 初始化 CloudBase
const app = cloudbase.init({
  env: 'your-env-id'
});

/**
 * 从真实云函数获取问候语
 * 集成 CloudBase MCP 后的真实实现
 */
export async function getHelloFromCloud(): Promise<string> {
  try {
    // 调用云函数
    const result = await app.callFunction({
      name: 'hello-cloud',
      data: {
        userInfo: {
          nickName: 'Taro用户',
          avatarUrl: ''
        }
      }
    });
    
    if (result.result.code === 0) {
      return result.result.message;
    } else {
      throw new Error(result.result.message || '云函数调用失败');
    }
  } catch (error) {
    console.error('云函数调用错误:', error);
    throw new Error(`云函数调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
```

### 步骤 6: 更新页面逻辑
修改 `src/pages/index/index.tsx`，添加真实云函数调用选项：

```typescript
import { getHelloFromMock, getHelloFromCloud } from '@/services/cloudbase';

// 在组件中添加真实云函数调用
const handleCallRealCloudFunction = async () => {
  setLoading(true);
  try {
    // 调用真实云函数
    const result = await getHelloFromCloud();
    setMessage(result);
  } catch (error) {
    setMessage(`真实云函数调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    setLoading(false);
  }
};
```

## 🔧 配置说明

### 环境变量配置
在项目根目录创建 `.env` 文件：
```
CLOUDBASE_ENV_ID=your-env-id
CLOUDBASE_REGION=ap-guangzhou
```

### 权限配置
确保云函数具有正确的权限设置：
- 云函数执行权限
- 数据库访问权限（如需要）
- 文件存储权限（如需要）

## 🚀 测试验证

### 本地测试
```bash
# 启动 H5 开发服务器
pnpm dev:h5

# 启动微信小程序开发
pnpm dev:weapp
```

### 云函数测试
```bash
# 使用 MCP 测试云函数
/cloudbase invoke hello-cloud --data '{"userInfo": {"nickName": "测试用户"}}'
```

## 📊 监控与调试

### 日志查看
- 使用 CloudBase 控制台查看云函数日志
- 在 Claude Code 中使用 MCP 查看实时日志

### 性能监控
- 监控云函数执行时间
- 监控 API 调用次数
- 监控错误率和响应状态

## 🔄 切换策略

### 渐进式切换
1. 保持现有模拟数据功能
2. 新增真实云函数调用选项
3. 通过配置控制使用哪个数据源
4. 逐步替换，确保稳定性

### 配置切换
```typescript
// 在配置文件中设置
const USE_REAL_CLOUD = process.env.NODE_ENV === 'production';

export async function getHelloData(): Promise<string> {
  if (USE_REAL_CLOUD) {
    return await getHelloFromCloud();
  } else {
    return await getHelloFromMock();
  }
}
```

## 🎯 下一步计划

1. **完善云函数功能**
   - 添加用户认证
   - 实现数据持久化
   - 添加更多业务逻辑

2. **优化性能**
   - 实现缓存机制
   - 优化网络请求
   - 添加错误重试

3. **扩展功能**
   - 集成数据库操作
   - 添加文件上传功能
   - 实现实时通信

## 📚 相关资源

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [Taro 官方文档](https://taro.zone/docs)
- [CloudBase MCP 文档](https://github.com/TencentCloudBase/cloudbase-mcp)

## 🆘 常见问题

### Q: 云函数调用失败怎么办？
A: 检查环境变量配置、网络连接、云函数部署状态。

### Q: 如何调试云函数？
A: 使用 CloudBase 控制台查看日志，或在本地使用模拟器调试。

### Q: 权限问题如何解决？
A: 检查云函数的 IAM 权限配置，确保具有正确的访问权限。

---
**更新时间**: 2025-09-08
**文档位置**: `docs/cloudbase-mcp-notes.md`