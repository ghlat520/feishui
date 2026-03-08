const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

// 日志
app.use(morgan('combined'))

// Body解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'memory-db'
  })
})

// Mock模型注入
const mockModels = require('./models/mock')
require.cache[require.resolve('./models/User')] = { exports: mockModels.User }
require.cache[require.resolve('./models/Order')] = { exports: mockModels.Order }
require.cache[require.resolve('./models/TarotReading')] = { exports: mockModels.TarotReading }
require.cache[require.resolve('./models/ZodiacLog')] = { exports: mockModels.ZodiacLog }
require.cache[require.resolve('./models/BaziReading')] = { exports: mockModels.BaziReading }

// 路由
try {
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/zodiac', require('./routes/zodiac'))
  app.use('/api/tarot', require('./routes/tarot'))
  app.use('/api/bazi', require('./routes/bazi'))
  app.use('/api/pay', require('./routes/pay'))
  app.use('/api/user', require('./routes/user'))
  app.use('/api/share', require('./routes/share'))
  console.log('✅ 路由注册成功')
} catch (err) {
  console.error('❌ 路由注册失败:', err)
}

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 1003,
    message: err.message || '服务器错误'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n🦞 AI命运守护神服务器运行中`)
  console.log(`📍 端口: ${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`💾 数据库: 内存模式（测试）`)
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`)
  console.log(`🔗 访问: http://localhost:${PORT}/health`)
  console.log(`🎨 前端: http://localhost:5173\n`)
})

module.exports = app
