/**
 * 常量定义文件
 * 定义项目中使用的所有枚举和常量
 * 包含运动类型、状态码、错误信息等
 */

/**
 * 运动类型枚举
 * 定义支持的所有运动类型
 */
export enum SportType {
  // 有氧运动
  RUNNING = 'running',
  WALKING = 'walking',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  HIKING = 'hiking',
  CLIMBING = 'climbing',
  
  // 球类运动
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  TENNIS = 'tennis',
  BADMINTON = 'badminton',
  TABLE_TENNIS = 'table_tennis',
  VOLLEYBALL = 'volleyball',
  BASEBALL = 'baseball',
  GOLF = 'golf',
  
  // 健身运动
  FITNESS = 'fitness',
  YOGA = 'yoga',
  PILATES = 'pilates',
  DANCE = 'dance',
  AEROBICS = 'aerobics',
  STRENGTH = 'strength',
  
  // 水上运动
  ROWING = 'rowing',
  CANOEING = 'canoeing',
  KAYAKING = 'kayaking',
  SURFING = 'surfing',
  SAILING = 'sailing',
  
  // 冬季运动
  SKIING = 'skiing',
  SNOWBOARDING = 'snowboarding',
  ICE_SKATING = 'ice_skating',
  
  // 其他运动
  SKATEBOARDING = 'skateboarding',
  ROLLER_SKATING = 'roller_skating',
  MARTIAL_ARTS = 'martial_arts',
  BOXING = 'boxing',
  FENCING = 'fencing',
  
  // 自定义运动
  CUSTOM = 'custom'
}

/**
 * 运动类型中文标签
 * 用于显示运动类型的中文名称
 */
export const SPORT_LABELS: Record<SportType, string> = {
  [SportType.RUNNING]: '跑步',
  [SportType.WALKING]: '步行',
  [SportType.CYCLING]: '骑行',
  [SportType.SWIMMING]: '游泳',
  [SportType.HIKING]: '徒步',
  [SportType.CLIMBING]: '攀岩',
  [SportType.BASKETBALL]: '篮球',
  [SportType.FOOTBALL]: '足球',
  [SportType.TENNIS]: '网球',
  [SportType.BADMINTON]: '羽毛球',
  [SportType.TABLE_TENNIS]: '乒乓球',
  [SportType.VOLLEYBALL]: '排球',
  [SportType.BASEBALL]: '棒球',
  [SportType.GOLF]: '高尔夫',
  [SportType.FITNESS]: '健身',
  [SportType.YOGA]: '瑜伽',
  [SportType.PILATES]: '普拉提',
  [SportType.DANCE]: '舞蹈',
  [SportType.AEROBICS]: '有氧运动',
  [SportType.STRENGTH]: '力量训练',
  [SportType.ROWING]: '划船',
  [SportType.CANOEING]: '皮划艇',
  [SportType.KAYAKING]: '皮划艇',
  [SportType.SURFING]: '冲浪',
  [SportType.SAILING]: '帆船',
  [SportType.SKIING]: '滑雪',
  [SportType.SNOWBOARDING]: '单板滑雪',
  [SportType.ICE_SKATING]: '滑冰',
  [SportType.SKATEBOARDING]: '滑板',
  [SportType.ROLLER_SKATING]: '轮滑',
  [SportType.MARTIAL_ARTS]: '武术',
  [SportType.BOXING]: '拳击',
  [SportType.FENCING]: '击剑',
  [SportType.CUSTOM]: '自定义'
}

/**
 * 运动分类枚举
 * 将运动类型按类别分组
 */
export enum SportCategory {
  CARDIO = 'cardio',           // 有氧运动
  BALL_SPORTS = 'ball_sports', // 球类运动
  FITNESS = 'fitness',         // 健身运动
  WATER_SPORTS = 'water_sports', // 水上运动
  WINTER_SPORTS = 'winter_sports', // 冬季运动
  OTHER = 'other',             // 其他运动
  CUSTOM = 'custom'            // 自定义
}

/**
 * 运动类型到分类的映射
 */
export const SPORT_TYPE_TO_CATEGORY: Record<SportType, SportCategory> = {
  [SportType.RUNNING]: SportCategory.CARDIO,
  [SportType.WALKING]: SportCategory.CARDIO,
  [SportType.CYCLING]: SportCategory.CARDIO,
  [SportType.SWIMMING]: SportCategory.CARDIO,
  [SportType.HIKING]: SportCategory.CARDIO,
  [SportType.CLIMBING]: SportCategory.OTHER,
  [SportType.BASKETBALL]: SportCategory.BALL_SPORTS,
  [SportType.FOOTBALL]: SportCategory.BALL_SPORTS,
  [SportType.TENNIS]: SportCategory.BALL_SPORTS,
  [SportType.BADMINTON]: SportCategory.BALL_SPORTS,
  [SportType.TABLE_TENNIS]: SportCategory.BALL_SPORTS,
  [SportType.VOLLEYBALL]: SportCategory.BALL_SPORTS,
  [SportType.BASEBALL]: SportCategory.BALL_SPORTS,
  [SportType.GOLF]: SportCategory.BALL_SPORTS,
  [SportType.FITNESS]: SportCategory.FITNESS,
  [SportType.YOGA]: SportCategory.FITNESS,
  [SportType.PILATES]: SportCategory.FITNESS,
  [SportType.DANCE]: SportCategory.FITNESS,
  [SportType.AEROBICS]: SportCategory.FITNESS,
  [SportType.STRENGTH]: SportCategory.FITNESS,
  [SportType.ROWING]: SportCategory.WATER_SPORTS,
  [SportType.CANOEING]: SportCategory.WATER_SPORTS,
  [SportType.KAYAKING]: SportCategory.WATER_SPORTS,
  [SportType.SURFING]: SportCategory.WATER_SPORTS,
  [SportType.SAILING]: SportCategory.WATER_SPORTS,
  [SportType.SKIING]: SportCategory.WINTER_SPORTS,
  [SportType.SNOWBOARDING]: SportCategory.WINTER_SPORTS,
  [SportType.ICE_SKATING]: SportCategory.WINTER_SPORTS,
  [SportType.SKATEBOARDING]: SportCategory.OTHER,
  [SportType.ROLLER_SKATING]: SportCategory.OTHER,
  [SportType.MARTIAL_ARTS]: SportCategory.OTHER,
  [SportType.BOXING]: SportCategory.OTHER,
  [SportType.FENCING]: SportCategory.OTHER,
  [SportType.CUSTOM]: SportCategory.CUSTOM
}

/**
 * 运动强度枚举
 * 定义运动的强度等级
 */
export enum SportIntensity {
  LOW = 1,      // 低强度
  MODERATE = 2, // 中等强度
  HIGH = 3,     // 高强度
  EXTREME = 4   // 极高强度
}

/**
 * 运动强度标签
 */
export const INTENSITY_LABELS: Record<SportIntensity, string> = {
  [SportIntensity.LOW]: '低强度',
  [SportIntensity.MODERATE]: '中等强度',
  [SportIntensity.HIGH]: '高强度',
  [SportIntensity.EXTREME]: '极高强度'
}

/**
 * 运动强度描述
 */
export const INTENSITY_DESCRIPTIONS: Record<SportIntensity, string> = {
  [SportIntensity.LOW]: '轻松的运动，可以正常交谈',
  [SportIntensity.MODERATE]: '中等强度，呼吸稍微急促但仍可交谈',
  [SportIntensity.HIGH]: '高强度，呼吸急促，难以交谈',
  [SportIntensity.EXTREME]: '极高强度，最大努力程度'
}

/**
 * 单位系统枚举
 */
export enum UnitSystem {
  METRIC = 'metric',     // 公制单位（公里、米）
  IMPERIAL = 'imperial'  // 英制单位（英里、英尺）
}

/**
 * 单位标签
 */
export const UNIT_LABELS = {
  [UnitSystem.METRIC]: {
    distance: '公里',
    distanceShort: 'km',
    speed: '公里/小时',
    speedShort: 'km/h',
    altitude: '米',
    altitudeShort: 'm'
  },
  [UnitSystem.IMPERIAL]: {
    distance: '英里',
    distanceShort: 'mi',
    speed: '英里/小时',
    speedShort: 'mph',
    altitude: '英尺',
    altitudeShort: 'ft'
  }
}

/**
 * 分享平台枚举
 */
export enum SharePlatform {
  WECHAT = 'wechat',
  WECHAT_MOMENTS = 'wechat_moments',
  QQ = 'qq',
  QZONE = 'qzone',
  WEIBO = 'weibo',
  LINK = 'link',
  IMAGE = 'image'
}

/**
 * 分享平台标签
 */
export const SHARE_PLATFORM_LABELS: Record<SharePlatform, string> = {
  [SharePlatform.WECHAT]: '微信好友',
  [SharePlatform.WECHAT_MOMENTS]: '微信朋友圈',
  [SharePlatform.QQ]: 'QQ好友',
  [SharePlatform.QZONE]: 'QQ空间',
  [SharePlatform.WEIBO]: '微博',
  [SharePlatform.LINK]: '复制链接',
  [SharePlatform.IMAGE]: '保存图片'
}

/**
 * 天气条件枚举
 */
export enum WeatherCondition {
  SUNNY = 'sunny',           // 晴天
  CLOUDY = 'cloudy',         // 多云
  OVERCAST = 'overcast',     // 阴天
  LIGHT_RAIN = 'light_rain', // 小雨
  HEAVY_RAIN = 'heavy_rain', // 大雨
  SNOW = 'snow',             // 雪
  FOG = 'fog',               // 雾
  WINDY = 'windy'            // 大风
}

/**
 * 天气条件标签
 */
export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  [WeatherCondition.SUNNY]: '晴天',
  [WeatherCondition.CLOUDY]: '多云',
  [WeatherCondition.OVERCAST]: '阴天',
  [WeatherCondition.LIGHT_RAIN]: '小雨',
  [WeatherCondition.HEAVY_RAIN]: '大雨',
  [WeatherCondition.SNOW]: '雪天',
  [WeatherCondition.FOG]: '雾天',
  [WeatherCondition.WINDY]: '大风'
}

/**
 * 地面类型枚举
 */
export enum GroundType {
  ASPHALT = 'asphalt',      // 沥青路面
  CONCRETE = 'concrete',    // 混凝土路面
  DIRT = 'dirt',            // 土路
  GRAVEL = 'gravel',        // 碎石路
  TRAIL = 'trail',          // 山路小径
  SAND = 'sand',            // 沙滩
  GRASS = 'grass',          // 草地
  TREADMILL = 'treadmill',  // 跑步机
  TRACK = 'track'           // 田径跑道
}

/**
 * 地面类型标签
 */
export const GROUND_TYPE_LABELS: Record<GroundType, string> = {
  [GroundType.ASPHALT]: '沥青路面',
  [GroundType.CONCRETE]: '混凝土路面',
  [GroundType.DIRT]: '土路',
  [GroundType.GRAVEL]: '碎石路',
  [GroundType.TRAIL]: '山路小径',
  [GroundType.SAND]: '沙滩',
  [GroundType.GRASS]: '草地',
  [GroundType.TREADMILL]: '跑步机',
  [GroundType.TRACK]: '田径跑道'
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 1,    // 男性
  FEMALE = 2,  // 女性
  UNKNOWN = 0  // 未知
}

/**
 * 性别标签
 */
export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
  [Gender.UNKNOWN]: '未知'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',     // 活跃
  INACTIVE = 'inactive', // 非活跃
  BANNED = 'banned',     // 封禁
  DELETED = 'deleted'    // 已删除
}

/**
 * 成就类型枚举
 */
export enum AchievementType {
  DISTANCE = 'distance',     // 距离成就
  DURATION = 'duration',     // 时长成就
  FREQUENCY = 'frequency',   // 频次成就
  CONSECUTIVE = 'consecutive', // 连续成就
  SPECIAL = 'special'        // 特殊成就
}

/**
 * 成就状态枚举
 */
export enum AchievementStatus {
  LOCKED = 'locked',      // 未解锁
  UNLOCKED = 'unlocked',  // 已解锁
  CLAIMED = 'claimed'     // 已领取
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  SYSTEM = 'system',    // 系统消息
  FRIEND = 'friend',    // 好友消息
  SHARE = 'share',      // 分享消息
  LIKE = 'like',        // 点赞消息
  COMMENT = 'comment',  // 评论消息
  FOLLOW = 'follow'     // 关注消息
}

/**
 * 消息状态枚举
 */
export enum MessageStatus {
  UNREAD = 'unread',    // 未读
  READ = 'read',        // 已读
  DELETED = 'deleted'   // 已删除
}

/**
 * 通用状态枚举
 */
export enum CommonStatus {
  DISABLED = 0,  // 禁用
  ENABLED = 1    // 启用
}

/**
 * 数据同步状态枚举
 */
export enum SyncStatus {
  UNSYNCED = 'unsynced',    // 未同步
  SYNCING = 'syncing',      // 同步中
  SYNCED = 'synced',        // 已同步
  FAILED = 'failed'         // 同步失败
}

/**
 * 缓存键前缀
 */
export const CACHE_KEY_PREFIX = {
  USER: 'user_',
  RECORD: 'record_',
  STATISTICS: 'stats_',
  SHARE: 'share_',
  CONFIG: 'config_'
}

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  // 分页默认参数
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // 运动记录默认参数
  MIN_DURATION: 60, // 最少运动时长（秒）
  MAX_DURATION: 86400, // 最多运动时长（24小时，秒）
  MIN_DISTANCE: 0.1, // 最少运动距离（公里）
  MAX_DISTANCE: 1000, // 最多运动距离（公里）
  
  // 文件上传限制
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
  
  // 缓存时间（秒）
  CACHE_DURATION: {
    USER_INFO: 3600, // 1小时
    RECORD_LIST: 300, // 5分钟
    STATISTICS: 1800, // 30分钟
    CONFIG: 86400 // 24小时
  },
  
  // API配置
  API_TIMEOUT: 30000, // 30秒
  API_RETRY_COUNT: 3,
  API_RETRY_DELAY: 1000 // 1秒
}

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  // 通用错误
  UNKNOWN_ERROR: '未知错误',
  NETWORK_ERROR: '网络连接失败',
  TIMEOUT_ERROR: '请求超时',
  
  // 验证错误
  INVALID_PARAMS: '参数错误',
  MISSING_PARAMS: '缺少必要参数',
  INVALID_DATE: '日期格式错误',
  INVALID_NUMBER: '数字格式错误',
  
  // 业务错误
  RECORD_NOT_FOUND: '运动记录不存在',
  RECORD_CREATE_FAILED: '创建运动记录失败',
  RECORD_UPDATE_FAILED: '更新运动记录失败',
  RECORD_DELETE_FAILED: '删除运动记录失败',
  
  // 用户错误
  USER_NOT_FOUND: '用户不存在',
  USER_UPDATE_FAILED: '更新用户信息失败',
  LOGIN_FAILED: '登录失败',
  
  // 文件错误
  FILE_TOO_LARGE: '文件过大',
  FILE_TYPE_NOT_SUPPORTED: '不支持的文件类型',
  UPLOAD_FAILED: '上传失败',
  
  // 权限错误
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '无权限访问',
  TOKEN_EXPIRED: '登录已过期',
  
  // 系统错误
  DATABASE_ERROR: '数据库错误',
  SERVICE_UNAVAILABLE: '服务暂不可用',
  RATE_LIMIT_EXCEEDED: '操作过于频繁，请稍后再试'
}