const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 使用Mock模型（内存数据库）
console.log('⚠️  使用内存数据库（测试模式）')
const mockModels = require('./models/mock')

// 路由（使用Mock模型）
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

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 1003,
    message: err.message || '服务器错误'
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n🦞 AI命运守护神服务器运行中`)
  console.log(`📍 端口: ${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`)
})

module.exports = app
