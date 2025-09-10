---
name: 页面集成与导航
about: 集成所有功能页面，构建完整的应用导航系统，实现页面间的流畅跳转和状态管理
labels: ["epic:sports-record-sharing", "phase:5", "priority:high", "type:feature", "size:large"]
title: "【Phase 5】Task 021 - 页面集成与导航"
assignees: []
---

## 🎯 任务概述
集成所有功能页面，构建完整的应用导航系统。实现页面间的流畅跳转、状态保持、参数传递等功能。包含底部导航栏、页面栈管理、导航守卫、深层链接等核心导航功能，确保用户在各个功能模块间的无缝切换体验。

## 📋 验收标准
- [ ] 底部导航栏组件实现，包含首页、记录、我的等主要入口
- [ ] 页面路由配置完成，所有页面正确注册和映射
- [ ] 页面间参数传递机制，支持复杂数据传递
- [ ] 页面状态保持功能，返回时恢复之前状态
- [ ] 导航守卫实现，权限验证和登录检查
- [ ] 深层链接支持，通过URL直接访问特定页面
- [ ] 页面切换动画效果，提供流畅的视觉过渡
- [ ] 导航历史管理，支持返回和前进操作
- [ ] 页面栈优化，防止内存泄漏和性能问题
- [ ] 跨平台导航适配，微信小程序和H5行为一致
- [ ] 导航事件处理，页面显示/隐藏生命周期管理
- [ ] 错误页面和404处理，友好的错误提示

## 🔧 技术细节

### 导航系统架构设计
```typescript
// 路由配置接口
interface RouteConfig {
  path: string;
  component: ComponentType;
  name: string;
  title: string;
  icon?: string;
  auth?: boolean;
  tabBar?: boolean;
  params?: Record<string, any>;
}

// 导航管理器
class NavigationManager {
  private routes: Map<string, RouteConfig> = new Map();
  private history: NavigationHistory[] = [];
  private currentRoute: RouteConfig | null = null;

  // 注册路由
  registerRoute(config: RouteConfig): void {
    this.routes.set(config.path, config);
  }

  // 页面跳转
  async navigate(path: string, params?: Record<string, any>): Promise<void> {
    const route = this.routes.get(path);
    if (!route) {
      throw new Error(`路由不存在: ${path}`);
    }

    // 权限检查
    if (route.auth && !this.checkAuth()) {
      await this.navigateToLogin();
      return;
    }

    // 保存当前页面状态
    await this.saveCurrentPageState();

    // 执行页面跳转
    await this.performNavigation(route, params);

    // 更新历史记录
    this.updateHistory(route, params);
  }

  // 返回上一页
  async navigateBack(delta: number = 1): Promise<void> {
    if (this.history.length <= delta) {
      await this.navigateToHome();
      return;
    }

    const targetIndex = this.history.length - 1 - delta;
    const targetHistory = this.history[targetIndex];
    
    // 恢复页面状态
    await this.restorePageState(targetHistory);
    
    // 执行返回操作
    await Taro.navigateBack({ delta });
    
    // 更新历史记录
    this.history = this.history.slice(0, targetIndex + 1);
    this.currentRoute = targetHistory.route;
  }

  // 切换到Tab页面
  async switchTab(path: string): Promise<void> {
    const route = this.routes.get(path);
    if (!route || !route.tabBar) {
      throw new Error(`无效的Tab页面: ${path}`);
    }

    await Taro.switchTab({ url: path });
    this.currentRoute = route;
  }
}
```

### 底部导航栏组件
```typescript
// 底部导航栏配置
interface TabBarConfig {
  color: string;
  selectedColor: string;
  backgroundColor: string;
  borderStyle: string;
  list: TabBarItem[];
}

interface TabBarItem {
  pagePath: string;
  text: string;
  iconPath: string;
  selectedIconPath: string;
}

// 底部导航栏组件
const TabBar: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showTabBar, setShowTabBar] = useState(true);

  const tabBarConfig: TabBarConfig = {
    color: '#666666',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/assets/icons/home.png',
        selectedIconPath: '/assets/icons/home-active.png'
      },
      {
        pagePath: '/pages/records/index',
        text: '记录',
        iconPath: '/assets/icons/record.png',
        selectedIconPath: '/assets/icons/record-active.png'
      },
      {
        pagePath: '/pages/create/index',
        text: '创建',
        iconPath: '/assets/icons/create.png',
        selectedIconPath: '/assets/icons/create-active.png'
      },
      {
        pagePath: '/pages/share/index',
        text: '分享',
        iconPath: '/assets/icons/share.png',
        selectedIconPath: '/assets/icons/share-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconPath: '/assets/icons/profile.png',
        selectedIconPath: '/assets/icons/profile-active.png'
      }
    ]
  };

  // Tab切换处理
  const handleTabClick = async (index: number) => {
    const tabItem = tabBarConfig.list[index];
    
    if (index === currentTab) {
      return; // 当前Tab，无需切换
    }

    try {
      setCurrentTab(index);
      await Taro.switchTab({ url: tabItem.pagePath });
      
      // 发送Tab切换事件
      eventCenter.trigger('tabChange', { index, path: tabItem.pagePath });
      
    } catch (error) {
      console.error('Tab切换失败:', error);
      // 恢复状态
      setCurrentTab(currentTab);
    }
  };

  return (
    <View className="tab-bar-container">
      {tabBarConfig.list.map((item, index) => (
        <View
          key={index}
          className={`tab-bar-item ${currentTab === index ? 'active' : ''}`}
          onClick={() => handleTabClick(index)}
        >
          <Image
            className="tab-bar-icon"
            src={currentTab === index ? item.selectedIconPath : item.iconPath}
            mode="aspectFit"
          />
          <Text className="tab-bar-text">{item.text}</Text>
        </View>
      ))}
    </View>
  );
};
```

### 页面参数传递机制
```typescript
// 页面参数管理器
class PageParamsManager {
  private params: Map<string, any> = new Map();
  private tempParams: Map<string, any> = new Map();

  // 设置页面参数
  setParams(key: string, value: any, persistent: boolean = false): void {
    if (persistent) {
      // 持久化存储
      Taro.setStorageSync(`page_params_${key}`, value);
      this.params.set(key, value);
    } else {
      // 临时存储
      this.tempParams.set(key, value);
    }
  }

  // 获取页面参数
  getParams(key: string): any {
    // 优先获取临时参数
    if (this.tempParams.has(key)) {
      const value = this.tempParams.get(key);
      this.tempParams.delete(key); // 使用后删除
      return value;
    }

    // 获取持久化参数
    if (this.params.has(key)) {
      return this.params.get(key);
    }

    // 从存储中获取
    try {
      const stored = Taro.getStorageSync(`page_params_${key}`);
      if (stored) {
        this.params.set(key, stored);
        return stored;
      }
    } catch (error) {
      console.error('获取存储参数失败:', error);
    }

    return null;
  }

  // 清除参数
  clearParams(key?: string): void {
    if (key) {
      this.params.delete(key);
      this.tempParams.delete(key);
      try {
        Taro.removeStorageSync(`page_params_${key}`);
      } catch (error) {
        console.error('清除存储参数失败:', error);
      }
    } else {
      // 清除所有参数
      this.params.clear();
      this.tempParams.clear();
      
      // 清除所有存储的参数
      try {
        const storageInfo = Taro.getStorageInfoSync();
        storageInfo.keys.forEach(key => {
          if (key.startsWith('page_params_')) {
            Taro.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('清除所有存储参数失败:', error);
      }
    }
  }
}

// 路由跳转工具函数
export const navigateTo = async (
  url: string, 
  params?: Record<string, any>, 
  options?: NavigateOptions
): Promise<void> => {
  try {
    // 处理URL参数
    let fullUrl = url;
    const queryParams: string[] = [];

    // 添加查询参数
    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
        }
      });
      
      if (queryParams.length > 0) {
        fullUrl += (url.includes('?') ? '&' : '?') + queryParams.join('&');
      }
    }

    // 存储复杂参数
    if (options?.complexParams) {
      const paramsKey = `complex_params_${Date.now()}`;
      pageParamsManager.setParams(paramsKey, options.complexParams, options.persistent);
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + `params_key=${paramsKey}`;
    }

    // 执行跳转
    if (options?.replace) {
      await Taro.redirectTo({ url: fullUrl });
    } else if (options?.reLaunch) {
      await Taro.reLaunch({ url: fullUrl });
    } else {
      await Taro.navigateTo({ url: fullUrl });
    }

  } catch (error) {
    console.error('页面跳转失败:', error);
    throw error;
  }
};
```

## 📎 相关资源
- **依赖任务**: 018-020（历史管理相关功能）
- **并行任务**: 022-025（集成优化相关）
- **任务大小**: L (大型)
- **预估工时**: 18-22 小时

## 📝 补充说明
- 导航系统需要考虑微信小程序和H5平台的差异
- 页面状态保持需要处理复杂的数据结构
- 导航守卫需要考虑异步权限验证
- 性能优化是关键，避免不必要的页面重渲染

## 🔗 相关链接
- [Taro 路由文档](https://taro.zone/docs/router)
- [微信小程序导航API](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html)
- [项目史诗文档](../epic.md)

## 📊 进度追踪
### 当前状态: 🔄 待开始
### 开发分支: `feature/task-021-page-integration`
### 代码审查: ⏳ 待进行
### 测试结果: ⏳ 待验证

---

**所属史诗**: 🏃‍♂️ 运动记录分享小程序  
**创建时间**: 2025-09-09  
**负责人**: 待分配  
**优先级**: 🔴 高

## ⚡ 性能要求
- 页面切换时间：< 300ms（包含动画效果）
- Tab切换响应：< 200ms（用户感知无延迟）
- 深层链接解析：< 100ms（参数解析和页面加载）
- 导航历史查询：< 50ms（历史记录检索）
- 状态恢复时间：< 500ms（复杂状态恢复）

## 🔒 安全与隐私
- 路由权限验证，确保用户只能访问授权页面
- 参数传递安全检查，防止恶意参数注入
- 导航历史数据保护，避免敏感信息泄露
- 深层链接安全验证，防止未授权访问

## 📊 监控与维护
- 导航系统使用统计
- 页面访问路径分析
- 导航错误率监控
- 用户行为轨迹追踪
- 性能指标持续监控

## 🔄 持续改进
- 导航体验持续优化
- 数据分析驱动改进
- A/B测试验证效果
- 用户反馈迭代
- 创新功能探索

## 🏆 成功指标
- 导航成功率 > 99%
- 页面访问转化率提升
- 用户停留时间优化
- 功能使用满意度 > 4.0/5.0
- 系统稳定性指标 > 99.9%