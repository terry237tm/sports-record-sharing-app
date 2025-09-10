---
name: 记录列表展示
about: 实现运动记录列表页面，展示用户的所有运动记录，支持多种展示模式、排序、筛选和搜索功能
labels: ["epic:sports-record-sharing", "phase:4", "priority:high", "type:feature", "size:large"]
title: "【Phase 4】Task 016 - 记录列表展示"
assignees: []
---

## 🎯 任务概述
实现运动记录列表页面，展示用户的所有运动记录。支持多种展示模式（列表/卡片）、排序方式（时间/类型/数据量）、筛选功能（运动类型/时间范围/数据范围）以及搜索功能。提供良好的用户体验和视觉效果。

## 📋 验收标准
- [ ] 记录列表页面UI设计实现，支持列表和卡片两种展示模式
- [ ] 运动记录数据获取和展示，包含运动类型、时长、距离、卡路里等核心数据
- [ ] 多种排序方式支持（按创建时间、运动类型、运动数据量排序）
- [ ] 筛选功能实现（运动类型筛选、时间范围筛选、数据范围筛选）
- [ ] 搜索功能支持（按运动描述、地点等关键词搜索）
- [ ] 空状态页面设计，无记录时的友好提示
- [ ] 加载状态管理，包含骨架屏和加载动画
- [ ] 错误状态处理，网络异常时的重试机制
- [ ] 响应式设计，适配不同屏幕尺寸
- [ ] 跨平台兼容性，微信小程序和H5表现一致

## 🔧 技术细节

### 记录列表组件结构
```typescript
// 记录列表页面组件
interface RecordListPageProps {
  userId: string;
  defaultViewMode?: 'list' | 'card';
  defaultSortBy?: 'time' | 'type' | 'data';
}

interface RecordListPageState {
  records: SportRecord[];
  viewMode: 'list' | 'card';
  sortBy: 'time' | 'type' | 'data';
  sortOrder: 'asc' | 'desc';
  filters: RecordFilters;
  searchQuery: string;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
}

// 筛选器接口
interface RecordFilters {
  sportType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  dataRange?: {
    minDuration?: number;
    maxDuration?: number;
    minDistance?: number;
    maxDistance?: number;
    minCalories?: number;
    maxCalories?: number;
  };
}
```

### 记录列表展示逻辑
```typescript
// 记录列表管理器
class RecordListManager {
  private records: SportRecord[] = [];
  private filteredRecords: SportRecord[] = [];
  private currentFilters: RecordFilters = {};
  private currentSearchQuery = '';
  private currentSort: { by: string; order: 'asc' | 'desc' } = { by: 'time', order: 'desc' };

  // 获取展示的记录列表
  getDisplayRecords(): SportRecord[] {
    let result = [...this.records];

    // 应用筛选
    result = this.applyFilters(result, this.currentFilters);

    // 应用搜索
    result = this.applySearch(result, this.currentSearchQuery);

    // 应用排序
    result = this.applySorting(result, this.currentSort);

    return result;
  }

  // 应用筛选器
  private applyFilters(records: SportRecord[], filters: RecordFilters): SportRecord[] {
    return records.filter(record => {
      // 运动类型筛选
      if (filters.sportType && filters.sportType.length > 0) {
        if (!filters.sportType.includes(record.sportType)) {
          return false;
        }
      }

      // 时间范围筛选
      if (filters.dateRange) {
        const recordDate = new Date(record.createdAt);
        if (recordDate < filters.dateRange.start || recordDate > filters.dateRange.end) {
          return false;
        }
      }

      // 数据范围筛选
      if (filters.dataRange) {
        const { minDuration, maxDuration, minDistance, maxDistance, minCalories, maxCalories } = filters.dataRange;
        
        if (minDuration && record.data.duration < minDuration) return false;
        if (maxDuration && record.data.duration > maxDuration) return false;
        if (minDistance && record.data.distance && record.data.distance < minDistance) return false;
        if (maxDistance && record.data.distance && record.data.distance > maxDistance) return false;
        if (minCalories && record.data.calories < minCalories) return false;
        if (maxCalories && record.data.calories > maxCalories) return false;
      }

      return true;
    });
  }

  // 应用搜索
  private applySearch(records: SportRecord[], query: string): SportRecord[] {
    if (!query.trim()) return records;

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return records.filter(record => {
      const searchableText = [
        record.sportType,
        record.description,
        record.location?.address || '',
        record.location?.city || '',
        record.location?.district || ''
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // 应用排序
  private applySorting(records: SportRecord[], sort: { by: string; order: 'asc' | 'desc' }): SportRecord[] {
    return records.sort((a, b) => {
      let compareValue = 0;

      switch (sort.by) {
        case 'time':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          compareValue = a.sportType.localeCompare(b.sportType);
          break;
        case 'data':
          // 按综合数据量排序（时长 + 距离 + 卡路里权重）
          const scoreA = a.data.duration * 1 + (a.data.distance || 0) * 100 + a.data.calories * 0.1;
          const scoreB = b.data.duration * 1 + (b.data.distance || 0) * 100 + b.data.calories * 0.1;
          compareValue = scoreA - scoreB;
          break;
        default:
          compareValue = 0;
      }

      return sort.order === 'asc' ? compareValue : -compareValue;
    });
  }
}
```

### 列表展示组件
```typescript
// 记录列表项组件
const RecordListItem: React.FC<{ record: SportRecord; viewMode: 'list' | 'card' }> = ({ record, viewMode }) => {
  const sportTypeConfig = getSportTypeConfig(record.sportType);
  
  if (viewMode === 'card') {
    return (
      <View className="record-card">
        <Image 
          className="record-card-image" 
          src={record.images[0] || sportTypeConfig.defaultImage}
          mode="aspectFill"
        />
        <View className="record-card-content">
          <View className="record-card-header">
            <Text className="sport-type">{sportTypeConfig.name}</Text>
            <Text className="record-time">{formatTimeAgo(record.createdAt)}</Text>
          </View>
          <Text className="record-description" numberOfLines={2}>
            {record.description}
          </Text>
          <View className="record-stats">
            <Text className="stat-item">时长: {record.data.duration}分钟</Text>
            {record.data.distance && (
              <Text className="stat-item">距离: {record.data.distance}公里</Text>
            )}
            <Text className="stat-item">卡路里: {record.data.calories}</Text>
          </View>
          {record.location && (
            <View className="record-location">
              <Icon type="location" size="small" />
              <Text className="location-text">{record.location.address}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="record-list-item">
      <Image 
        className="record-thumbnail" 
        src={record.images[0] || sportTypeConfig.defaultImage}
        mode="aspectFill"
      />
      <View className="record-info">
        <View className="record-header">
          <Text className="sport-type">{sportTypeConfig.name}</Text>
          <Text className="record-time">{formatTimeAgo(record.createdAt)}</Text>
        </View>
        <Text className="record-description" numberOfLines={1}>
          {record.description}
        </Text>
        <View className="record-stats">
          <Text className="stat-item">{record.data.duration}分钟</Text>
          {record.data.distance && (
            <Text className="stat-item">{record.data.distance}公里</Text>
          )}
          <Text className="stat-item">{record.data.calories}卡</Text>
        </View>
      </View>
    </View>
  );
};
```

## 📎 相关资源
- **依赖任务**: 002（类型定义）、003（Redux状态管理）、004（云函数基础架构）
- **并行任务**: 017-020（历史管理相关功能）
- **任务大小**: L (大型)
- **预估工时**: 12-16 小时

## 📝 补充说明
- 列表性能优化是关键，需要支持大数据量流畅滚动
- 搜索和筛选功能需要在客户端实现，提升响应速度
- 考虑实现虚拟滚动技术优化长列表性能
- 支持手势操作和快速筛选功能

## 🔗 相关链接
- [Taro 列表组件最佳实践](https://taro.zone/docs/components/viewContainer/scroll-view)
- [React 性能优化指南](https://react.dev/learn/render-and-commit)
- [项目史诗文档](../epic.md)

## 📊 进度追踪
### 当前状态: 🔄 待开始
### 开发分支: `feature/task-016-record-list-display`
### 代码审查: ⏳ 待进行
### 测试结果: ⏳ 待验证

---

**所属史诗**: 🏃‍♂️ 运动记录分享小程序  
**创建时间**: 2025-09-09  
**负责人**: 待分配  
**优先级**: 🔴 高

## ⚡ 性能要求
- 列表渲染性能：1000条记录内滚动流畅无卡顿
- 搜索响应时间：< 300ms（本地搜索）
- 筛选响应时间：< 500ms（本地筛选）
- 排序响应时间：< 200ms（本地排序）
- 首屏加载时间：< 2秒（包含20条记录）

## 🔒 安全与隐私
- 用户数据访问权限控制，只能查看自己的记录
- 敏感信息（如精确位置）脱敏处理
- 搜索和筛选操作不泄露用户隐私
- 数据传输过程加密保护