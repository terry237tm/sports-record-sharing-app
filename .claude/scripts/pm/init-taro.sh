#!/bin/bash

echo "初始化 Taro + CloudBase + CCPM 项目..."
echo ""
echo ""

echo "████████╗ █████╗ ███████╗██╗  ██╗     ██████╗ ██████╗ ███╗   ███╗"
echo "╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ██╔════╝██╔═══██╗████╗ ████║"
echo "   ██║   ███████║█████╗  █████╔╝     ██║     ██║   ██║██╔████╔██║"
echo "   ██║   ██╔══██║██╔══╝  ██╔═██╗     ██║     ██║   ██║██║╚██╔╝██║"
echo "   ██║   ██║  ██║██║     ██║  ██╗    ╚██████╗╚██████╔╝██║ ╚═╝ ██║"
echo "   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝"

echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Taro + CloudBase + Claude Code Project Management         │"
echo "│ 集成开发项目管理系统                                      │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""
echo ""

echo "🚀 初始化 Taro CloudBase MCP 项目系统"
echo "======================================"
echo ""

# 检查必要工具
echo "🔍 检查依赖项..."

# 检查 Node.js
if command -v node &> /dev/null; then
  echo "  ✅ Node.js 已安装"
  node --version
else
  echo "  ❌ Node.js 未安装，请先安装 Node.js"
  exit 1
fi

# 检查 pnpm
if command -v pnpm &> /dev/null; then
  echo "  ✅ pnpm 已安装"
  pnpm --version
else
  echo "  ⚠️  pnpm 未安装，将使用 npm"
fi

# 检查 Taro CLI
if command -v taro &> /dev/null; then
  echo "  ✅ Taro CLI 已安装"
  taro --version
else
  echo "  ⚠️  Taro CLI 未安装，将通过 npx 使用"
fi

# 检查 Git
if command -v git &> /dev/null; then
  echo "  ✅ Git 已安装"
  git --version
else
  echo "  ⚠️  Git 未安装，某些功能可能受限"
fi

echo ""
echo "📦 检查项目依赖..."

# 检查 package.json 是否存在
if [ -f "package.json" ]; then
  echo "  ✅ package.json 存在"
else
  echo "  ❌ package.json 不存在，请先创建 Taro 项目"
  exit 1
fi

# 检查关键依赖
if grep -q "\"@tarojs/taro\"" package.json; then
  echo "  ✅ Taro 框架已配置"
else
  echo "  ❌ Taro 框架未配置"
fi

if grep -q "\"react\"" package.json; then
  echo "  ✅ React 已配置"
else
  echo "  ❌ React 未配置"
fi

if grep -q "\"typescript\"" package.json; then
  echo "  ✅ TypeScript 已配置"
else
  echo "  ❌ TypeScript 未配置"
fi

echo ""
echo "🏗️ 检查项目结构..."

# 检查关键目录
if [ -d "src" ]; then
  echo "  ✅ src 目录存在"
else
  echo "  ❌ src 目录不存在"
fi

if [ -d "src/pages" ]; then
  echo "  ✅ pages 目录存在"
else
  echo "  ❌ pages 目录不存在"
fi

if [ -d "src/services" ]; then
  echo "  ✅ services 目录存在"
else
  echo "  ❌ services 目录不存在"
fi

if [ -d "config" ]; then
  echo "  ✅ config 目录存在"
else
  echo "  ❌ config 目录不存在"
fi

echo ""
echo "☁️ 检查 CloudBase 集成..."

if [ -f "docs/cloudbase-mcp-notes.md" ]; then
  echo "  ✅ CloudBase MCP 文档已存在"
else
  echo "  ⚠️  CloudBase MCP 文档不存在"
fi

if [ -f "src/services/cloudbase.ts" ]; then
  echo "  ✅ CloudBase 服务文件已存在"
else
  echo "  ⚠️  CloudBase 服务文件不存在"
fi

echo ""
echo "🤖 检查 CCPM 集成..."

if [ -d ".claude" ]; then
  echo "  ✅ .claude 目录存在"
else
  echo "  ❌ .claude 目录不存在"
fi

if [ -f ".claude/settings.local.json" ]; then
  echo "  ✅ CCPM 设置文件存在"
else
  echo "  ❌ CCPM 设置文件不存在"
fi

echo ""
echo "📝 检查项目配置..."

if [ -f "tsconfig.json" ]; then
  echo "  ✅ TypeScript 配置存在"
else
  echo "  ❌ TypeScript 配置不存在"
fi

if [ -f ".editorconfig" ]; then
  echo "  ✅ EditorConfig 存在"
else
  echo "  ❌ EditorConfig 不存在"
fi

if [ -f ".gitignore" ]; then
  echo "  ✅ GitIgnore 存在"
else
  echo "  ❌ GitIgnore 不存在"
fi

echo ""
echo "🎉 初始化完成！"
echo "==============="
echo ""
echo "📋 下一步操作："
echo "1. 运行 'pnpm dev:h5' 启动 H5 开发服务器"
echo "2. 运行 'pnpm dev:weapp' 启动微信小程序开发"
echo "3. 查看 'docs/cloudbase-mcp-notes.md' 了解 CloudBase 集成"
echo "4. 查看 'COMMANDS.md' 了解 CCPM 项目管理命令"
echo ""
echo "🔍 常用 CCPM 命令："
echo "• /pm:help - 显示项目管理帮助"
echo "• /pm:status - 查看项目状态"
echo "• /context:create - 创建项目上下文"
echo "• /pm:epic-create - 创建新功能史诗"
echo ""
echo "Happy coding! 🚀"}    

# 使脚本可执行
chmod +x ".claude/scripts/pm/init-taro.sh" 2>/dev/null || true

exit 0