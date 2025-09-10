---
issue: 4
stream: API和枚举类型
agent: general-purpose
started: 2025-09-10T07:56:08Z
status: in_progress
---

# Stream B: API和枚举类型

## Scope
- 文件: src/types/api.ts, src/types/constants.ts
- 工作: 定义API请求/响应类型和运动相关枚举

## Files
- src/types/api.ts - API请求/响应类型定义
- src/types/constants.ts - 枚举和常量定义

## Progress
- ✅ 已完成src/types/api.ts文件创建，定义了完整的API类型系统
- ✅ 已完成src/types/constants.ts文件创建，定义了所有运动相关枚举和常量
- ✅ 创建了API请求/响应类型，包括GetSportRecordsRequest, CreateSportRecordRequest等
- ✅ 定义了ApiResponse<T>, ErrorResponse, SuccessResponse等响应格式
- ✅ 创建了SportType运动类型枚举，包含跑步、骑行、游泳等30多种运动类型
- ✅ 定义了ApiStatus状态码枚举，符合RESTful规范
- ✅ 创建了ErrorCode错误码枚举，包含通用错误、认证错误、业务错误等
- ✅ 添加了API相关的工具类型，包括请求配置、拦截器、错误处理等
- ✅ 更新了src/types/index.ts，添加了api.ts和constants.ts的导出
- ✅ 所有类型定义遵循中文注释规范，符合项目要求

## 实现详情
### API类型定义 (src/types/api.ts)
- 通用API响应类型: ApiResponse<T>, ErrorResponse, SuccessResponse<T>
- 分页相关类型: PaginationRequest, PaginationResponse<T>
- 运动记录API类型: GetSportRecordsRequest, CreateSportRecordRequest等
- 用户相关API类型: LoginRequest, UpdateUserRequest等
- 分享相关API类型: ShareRequest等
- 统计和文件上传相关API类型
- API状态码枚举: ApiStatus (200, 201, 400, 401, 500等)
- 错误码枚举: ErrorCode (通用错误、认证错误、业务错误、系统错误)
- HTTP方法枚举: HttpMethod (GET, POST, PUT, DELETE等)
- 请求/响应拦截器接口
- API客户端配置接口

### 常量枚举定义 (src/types/constants.ts)
- 运动类型枚举: SportType (跑步、骑行、游泳、球类运动等30+种)
- 运动类型中文标签: SPORT_LABELS
- 运动分类枚举: SportCategory (有氧运动、球类运动、健身运动等)
- 运动类型到分类映射: SPORT_TYPE_TO_CATEGORY
- 运动强度枚举: SportIntensity (低、中、高、极高强度)
- 单位系统枚举: UnitSystem (公制/英制)
- 分享平台枚举: SharePlatform (微信、QQ、微博等)
- 天气条件枚举: WeatherCondition (晴天、多云、小雨、雪天等)
- 地面类型枚举: GroundType (沥青、混凝土、土路、沙滩等)
- 性别枚举: Gender
- 用户状态、成就类型、消息类型等枚举
- 缓存键前缀、默认配置、错误消息等常量

## 状态
状态: completed
完成时间: 2025-09-10T16:26:41Z
