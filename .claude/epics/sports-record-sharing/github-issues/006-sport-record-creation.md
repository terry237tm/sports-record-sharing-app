---
name: 运动记录创建功能
about: 实现运动记录的创建功能，包括运动类型选择、运动数据录入、表单验证等核心功能
labels: ["epic:sports-record-sharing", "phase:2", "priority:high", "type:feature", "size:large"]
title: "【Phase 2】Task 006 - 运动记录创建功能"
assignees: []
---

## 🎯 任务概述
实现运动记录的创建功能，包括运动类型选择、运动数据录入（时长、距离、卡路里等）、运动描述等核心功能。提供用户友好的表单界面，支持多种运动类型的数据录入。

## 📋 验收标准
- [ ] 运动类型选择组件开发完成（跑步、骑行、游泳、健身等）
- [ ] 运动数据表单开发完成（时长、距离、卡路里、心率、步数）
- [ ] 运动描述文本框支持多行输入和字数限制
- [ ] 表单数据验证逻辑实现（必填项、数值范围、格式验证）
- [ ] 提交按钮状态管理（加载中、成功、失败）
- [ ] 创建成功后页面跳转和提示信息显示
- [ ] 支持草稿保存功能，防止数据丢失
- [ ] 表单重置功能，清空所有输入数据

## 🔧 技术细节

### 数据模型设计
```typescript
interface SportRecordForm {
  sportType: SportType;           // 运动类型枚举
  duration: number;              // 运动时长（分钟）
  distance?: number;             // 运动距离（公里，可选）
  calories: number;              // 消耗卡路里
  heartRate?: number;            // 心率（可选）
  steps?: number;                // 步数（可选）
  description: string;           // 运动描述
  images: string[];              // 图片URL数组
  location?: LocationData;       // 位置信息（可选）
}
```

### 表单验证规则
```typescript
const validationRules = {
  sportType: { required: true, enum: Object.values(SportType) },
  duration: { required: true, min: 1, max: 1440 }, // 1分钟到24小时
  distance: { min: 0.1, max: 200 }, // 0.1到200公里
  calories: { required: true, min: 10, max: 5000 }, // 10到5000卡路里
  heartRate: { min: 40, max: 220 }, // 正常心率范围
  steps: { min: 1, max: 100000 }, // 步数范围
  description: { maxLength: 500 }, // 最多500字符
  images: { maxCount: 9 } // 最多9张图片
}
```

### 组件结构设计
```
CreateRecordPage/
├── SportTypeSelector/     # 运动类型选择器
├── DataInputForm/        # 数据输入表单
├── DescriptionInput/     # 描述文本框
├── ImageUploadArea/      # 图片上传区域（与007任务集成）
├── LocationSelector/     # 位置选择器（与008任务集成）
└── SubmitButton/         # 提交按钮
```

### 状态管理
- 使用 Redux Toolkit 管理表单状态
- 实现表单数据的双向绑定
- 支持草稿状态的自动保存
- 错误状态的集中管理

## 📎 相关资源
- **依赖任务**: 001-005（基础架构和类型定义）
- **并行任务**: 007（图片上传）、008（位置服务）
- **任务大小**: L (大型)
- **预估工时**: 12-16 小时

## 📝 补充说明
- 表单需要支持实时验证和用户友好的错误提示
- 考虑移动端输入体验，优化键盘和输入控件
- 实现智能默认值填充（如根据运动类型预设常用值）
- 支持表单数据的本地缓存和恢复

## 🔗 相关链接
- [Taro 表单组件文档](https://taro.zone/docs/components/forms)
- [Redux Toolkit 使用指南](https://redux-toolkit.js.org/)
- [项目史诗文档](../epic.md)

## 📊 进度追踪
### 当前状态: 🔄 待开始
### 开发分支: `feature/task-006-record-creation`
### 代码审查: ⏳ 待进行
### 测试结果: ⏳ 待验证

---

**所属史诗**: 🏃‍♂️ 运动记录分享小程序  
**创建时间**: 2025-09-09  
**负责人**: 待分配  
**优先级**: 🔴 高