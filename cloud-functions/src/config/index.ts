import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export const config = {
  // 云开发配置
  cloudbase: {
    envId: process.env['CLOUDBASE_ENV_ID'] || '',
    region: process.env['CLOUDBASE_REGION'] || 'ap-shanghai'
  },

  // JWT 配置
  jwt: {
    secret: process.env['JWT_SECRET'] || 'default-secret-key',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '7d'
  },

  // 数据库配置
  database: {
    name: process.env['DB_NAME'] || 'sports_records',
    collections: {
      users: process.env['DB_COLLECTION_USERS'] || 'users',
      records: process.env['DB_COLLECTION_RECORDS'] || 'records',
      comments: process.env['DB_COLLECTION_COMMENTS'] || 'comments',
      likes: process.env['DB_COLLECTION_LIKES'] || 'likes',
      media: process.env['DB_COLLECTION_MEDIA'] || 'media'
    }
  },

  // 文件存储配置
  storage: {
    bucket: process.env['STORAGE_BUCKET'] || 'sports-records',
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB
    allowedFileTypes: (process.env['ALLOWED_FILE_TYPES'] || 'jpg,jpeg,png,gif,mp4,mov,avi').split(',')
  },

  // 小程序配置
  miniprogram: {
    appId: process.env['MINIPROGRAM_APPID'] || '',
    secret: process.env['MINIPROGRAM_SECRET'] || ''
  },

  // 安全配置
  security: {
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
    rateLimitWindow: parseInt(process.env['RATE_LIMIT_WINDOW'] || '15'), // 分钟
    rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX'] || '100')
  },

  // API 配置
  api: {
    baseUrl: process.env['API_BASE_URL'] || 'http://localhost:3000',
    timeout: parseInt(process.env['API_TIMEOUT'] || '30000')
  },

  // 日志配置
  log: {
    level: process.env['LOG_LEVEL'] || 'info',
    file: process.env['LOG_FILE'] || 'logs/app.log'
  },

  // 开发配置
  development: {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    debug: process.env['DEBUG'] === 'true',
    port: parseInt(process.env['PORT'] || '3000')
  }
}

export default config