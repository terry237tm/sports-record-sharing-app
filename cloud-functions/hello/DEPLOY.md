# CloudBase 云函数部署说明

## 📋 函数信息
- **函数名**: hello
- **描述**: 返回问候消息的 CloudBase 云函数
- **运行时**: Nodejs16.13
- **入口文件**: dist/index.js
- **内存**: 128MB
- **超时**: 3秒

## 🚀 部署步骤

### ✅ 当前状态
- **云函数代码**: ✅ 已完成编写和编译
- **TypeScript 配置**: ✅ 已配置严格模式
- **HTTP 触发器**: ✅ 已在 config.json 中配置
- **前端集成**: ✅ 已更新调用逻辑

### 方法 1: 使用 CloudBase MCP 工具（推荐）

1. **在 Claude Code 中使用 MCP 命令**:
```bash
# 创建云函数（如尚未创建）
/cloudbase function:create hello

# 部署函数代码
/cloudbase function:deploy hello --code ./dist

# 获取函数信息
/cloudbase function:info hello
```

2. **配置 HTTP 触发器**:
```bash
# 创建 HTTP 触发器
/cloudbase trigger:create hello --type http --path /hello --method GET,POST
```

### 方法 2: 使用 CloudBase CLI

1. **安装 CLI**（如尚未安装）:
```bash
npm install -g @cloudbase/cli
```

2. **登录 CloudBase**:
```bash
tcb login
```

3. **部署函数**:
```bash
cd cloud-functions/hello
tcb fn deploy hello --code ./dist
```

### 方法 3: 使用 CloudBase 控制台

1. **登录控制台**: https://console.cloud.tencent.com/cloudbase
2. **进入云函数管理**
3. **创建函数**: 选择 hello 作为函数名
4. **上传代码**: 上传 dist 目录中的文件
5. **配置触发器**: 添加 HTTP 触发器，路径 /hello

## 📞 调用方式

### HTTP 触发器调用
```bash
# GET 请求
curl https://your-env-id.app.cloudbase.net/hello

# POST 请求
curl -X POST https://your-env-id.app.cloudbase.net/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

### 前端调用示例
```typescript
// 使用 fetch
const response = await fetch('https://your-env-id.app.cloudbase.net/hello');
const data = await response.json();
console.log(data.msg); // "Hello from CloudBase Function"

// 使用 CloudBase SDK
const app = cloudbase.init({ env: 'your-env-id' });
const result = await app.callFunction({
  name: 'hello',
  data: {}
});
console.log(result.result.msg);
```

## 🔧 测试验证

1. **部署完成后**，获取函数的 HTTP 触发器 URL
2. **在浏览器中访问** URL，应该返回 JSON 响应
3. **检查响应格式**:
```json
{
  "msg": "Hello from CloudBase Function",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "env": "your-env",
  "version": "1.0.0"
}
```

## 📋 环境变量配置

在 `.env` 文件中添加:
```bash
# CloudBase 云函数调用地址
TARO_APP_CLOUDBASE_HELLO_URL=https://your-env-id.app.cloudbase.net/hello
```

## 🚨 注意事项

1. **确保环境 ID 正确**: 替换 `your-env-id` 为您的实际环境 ID
2. **HTTPS 协议**: 生产环境必须使用 HTTPS
3. **CORS 配置**: 函数已配置 CORS，支持跨域调用
4. **错误处理**: 函数包含完善的错误处理机制

## 🎯 下一步

1. 部署此云函数
2. 获取 HTTP 触发器 URL
3. 更新前端配置
4. 测试真实云函数调用

**部署成功后，请在 Claude Code 中运行相应的 MCP 命令来完成部署。**