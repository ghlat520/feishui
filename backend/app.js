const express = require('express')
const mongoose = require('mongoose')
const redis = require('redis')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// 路由引入
const authRoutes = require('./routes/auth')
const zodiacRoutes = require('./routes/zodiac')
const tarotRoutes = require('./routes/tarot')
const baziRoutes = require('./routes/bazi')
const payRoutes = require('./routes/pay')
const userRoutes = require('./routes/user')

// 错误处理中间件
const errorHandler = require('./middleware/errorHandler')

const app = express()

// 信任代理
app.set('trust proxy', 1)

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

// 日志
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Body解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 限流
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 100次请求
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
})
app.use('/api/', limiter)

// 静态文件
app.use('/uploads', express.static('uploads'))

// 路由
try {
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/zodiac', require('./routes/zodiac'))
  app.use('/api/tarot', require('./routes/tarot'))
  app.use('/api/bazi', require('./routes/bazi'))
  app.use('/api/pay', require('./routes/pay'))
  app.use('/api/user', require('./routes/user'))
  console.log('✅ 路由注册成功')
} catch (err) {
  console.error('❌ 路由注册失败:', err)
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 错误处理
app.use(errorHandler)

// 数据库连接
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ MongoDB连接成功')
  } catch (err) {
    console.error('❌ MongoDB连接失败:', err)
    process.exit(1)
  }
}

// Redis连接
async function connectRedis() {
  const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  })
  
  client.on('error', (err) => console.error('Redis Error:', err))
  client.on('connect', () => console.log('✅ Redis连接成功'))
  
  await client.connect()
  global.redisClient = client
}

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDB()
    
    // 连接Redis
    await connectRedis()
    
    // 启动HTTP服务
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
      console.log(`📖 环境: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('❌ 启动失败:', err)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('📴 收到SIGTERM信号，正在关闭...')
  await mongoose.connection.close()
  if (global.redisClient) {
    await global.redisClient.quit()
  }
  process.exit(0)
})

startServer()

module.exports = app
