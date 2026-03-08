# AI命运守护神 - 技术架构设计文档

**项目名称：** AI命运守护神  
**版本：** V1.0  
**创建日期：** 2026-03-08  
**架构师：** OpenClaw 🦞  

---

## 一、架构概述

### 1.1 技术选型原则
- **快速开发：** 优先成熟框架，减少造轮子
- **低成本：** 优先开源、免费方案
- **易扩展：** 模块化设计，便于后期迭代
- **H5优先：** 移动端体验优先，后续可封装APP

### 1.2 技术栈总览

```
┌─────────────────────────────────────────┐
│           前端层（H5 Mobile）             │
│  Vue 3 + Vant UI + Axios + Vue Router   │
└───────────────┬─────────────────────────┘
                │ HTTPS
┌───────────────┴─────────────────────────┐
│           应用层（RESTful API）           │
│    Node.js + Express + JWT认证          │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
┌───────▼──────┐ ┌─────▼──────┐
│  业务逻辑层   │ │  外部服务   │
│ Lunar计算引擎 │ │ 智谱AI API │
│  AI对话引擎   │ │ 支付API    │
└───────┬──────┘ └────────────┘
        │
┌───────▼──────────────────────────────┐
│         数据层                         │
│  MongoDB（用户、订单、内容）            │
│  Redis（缓存、Session）                │
└───────────────────────────────────────┘
```

---

## 二、前端架构

### 2.1 技术栈
- **框架：** Vue 3（Composition API）
- **UI库：** Vant 4（移动端组件库）
- **状态管理：** Pinia
- **路由：** Vue Router 4
- **HTTP客户端：** Axios
- **构建工具：** Vite
- **样式：** SCSS + 响应式设计

### 2.2 项目结构
```
ai-fortune-h5/
├── public/              # 静态资源
│   ├── images/         # 图片资源
│   │   ├── tarot/     # 塔罗牌图片（78张）
│   │   ├── zodiac/    # 星座图标（12个）
│   │   └── ui/        # UI素材
│   └── index.html
├── src/
│   ├── api/            # API接口封装
│   │   ├── user.js
│   │   ├── zodiac.js
│   │   ├── tarot.js
│   │   └── bazi.js
│   ├── assets/         # 静态资源（编译）
│   ├── components/     # 公共组件
│   │   ├── TarotCard.vue      # 塔罗牌组件
│   │   ├── ZodiacSelector.vue # 星座选择器
│   │   ├── Loading.vue        # 加载组件
│   │   └── ResultCard.vue     # 结果展示卡片
│   ├── composables/    # 组合式函数
│   │   ├── useAuth.js         # 认证逻辑
│   │   ├── useShare.js        # 分享逻辑
│   │   └── usePay.js          # 支付逻辑
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── stores/         # Pinia状态管理
│   │   ├── user.js             # 用户状态
│   │   ├── zodiac.js           # 星座数据
│   │   └── tarot.js            # 塔罗数据
│   ├── views/          # 页面视图
│   │   ├── Home.vue            # 首页
│   │   ├── Zodiac.vue          # 星座运势
│   │   ├── Tarot.vue           # 塔罗占卜
│   │   ├── Bazi.vue            # 八字测算
│   │   ├── Result.vue          # 结果页
│   │   ├── Pay.vue             # 支付页
│   │   └── Profile.vue         # 个人中心
│   ├── utils/          # 工具函数
│   │   ├── request.js          # Axios封装
│   │   ├── auth.js             # Token管理
│   │   ├── date.js             # 日期处理
│   │   └── share.js            # 分享工具
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env.development     # 开发环境变量
├── .env.production      # 生产环境变量
├── vite.config.js       # Vite配置
└── package.json
```

### 2.3 核心模块设计

#### 模块1：星座运势模块
```vue
<!-- views/Zodiac.vue -->
<template>
  <div class="zodiac-page">
    <!-- 星座选择 -->
    <ZodiacSelector @select="onSelectZodiac" />
    
    <!-- 运势展示 -->
    <div class="fortune-card">
      <h2>{{ zodiacName }}今日运势</h2>
      <div class="fortune-item">
        <span>爱情运：</span>
        <StarRating :value="loveScore" />
      </div>
      <div class="fortune-item">
        <span>事业运：</span>
        <StarRating :value="careerScore" />
      </div>
      <div class="fortune-item">
        <span>财运：</span>
        <StarRating :value="moneyScore" />
      </div>
      <p class="fortune-text">{{ fortuneText }}</p>
    </div>
    
    <!-- 详细解读按钮 -->
    <van-button type="primary" @click="unlockDetail">
      解锁详细解读（9.9元）
    </van-button>
  </div>
</template>
```

#### 模块2：塔罗牌占卜模块
```vue
<!-- views/Tarot.vue -->
<template>
  <div class="tarot-page">
    <!-- 牌阵选择 -->
    <div class="spread-selector">
      <van-radio-group v-model="spreadType">
        <van-radio name="single">单张牌（免费）</van-radio>
        <van-radio name="three">三张牌（9.9元）</van-radio>
        <van-radio name="celtic">凯尔特十字（49.9元）</van-radio>
      </van-radio-group>
    </div>
    
    <!-- 抽牌区域 -->
    <div class="tarot-cards">
      <div 
        v-for="card in cards" 
        :key="card.id"
        class="tarot-card"
        :class="{ flipped: card.flipped }"
        @click="flipCard(card)"
      >
        <TarotCard :card="card" />
      </div>
    </div>
    
    <!-- 解读结果 -->
    <div v-if="showResult" class="result-area">
      <h3>牌面解读</h3>
      <p>{{ interpretation }}</p>
      <van-button @click="chatWithAI">继续与AI对话</van-button>
    </div>
  </div>
</template>
```

#### 模块3：AI对话模块
```vue
<!-- components/AIChat.vue -->
<template>
  <div class="ai-chat">
    <div class="message-list">
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        :class="['message', msg.role]"
      >
        {{ msg.content }}
      </div>
    </div>
    
    <van-field
      v-model="userInput"
      placeholder="说出你的烦恼..."
      @keyup.enter="sendMessage"
    >
      <template #button>
        <van-button size="small" @click="sendMessage">发送</van-button>
      </template>
    </van-field>
  </div>
</template>
```

### 2.4 路由设计
```javascript
// router/index.js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'AI命运守护神' }
  },
  {
    path: '/zodiac',
    name: 'Zodiac',
    component: () => import('@/views/Zodiac.vue'),
    meta: { title: '星座运势', requireAuth: false }
  },
  {
    path: '/tarot',
    name: 'Tarot',
    component: () => import('@/views/Tarot.vue'),
    meta: { title: '塔罗占卜', requireAuth: false }
  },
  {
    path: '/bazi',
    name: 'Bazi',
    component: () => import('@/views/Bazi.vue'),
    meta: { title: '八字测算', requireAuth: true }
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('@/views/Result.vue'),
    meta: { title: '占卜结果', requireAuth: true }
  },
  {
    path: '/pay',
    name: 'Pay',
    component: () => import('@/views/Pay.vue'),
    meta: { title: '支付', requireAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requireAuth: true }
  }
]
```

---

## 三、后端架构

### 3.1 技术栈
- **运行环境：** Node.js 18+
- **框架：** Express 4
- **认证：** JWT（jsonwebtoken）
- **数据库：** MongoDB 6 + Mongoose
- **缓存：** Redis 7
- **文件存储：** 本地存储 / 阿里云OSS（后期）
- **进程管理：** PM2

### 3.2 项目结构
```
ai-fortune-server/
├── config/             # 配置文件
│   ├── index.js       # 主配置
│   ├── db.js          # 数据库配置
│   └── ai.js          # AI配置
├── controllers/        # 控制器
│   ├── authController.js
│   ├── zodiacController.js
│   ├── tarotController.js
│   ├── baziController.js
│   └── payController.js
├── middleware/         # 中间件
│   ├── auth.js        # JWT认证
│   ├── errorHandler.js # 错误处理
│   └── validator.js   # 参数验证
├── models/            # 数据模型
│   ├── User.js
│   ├── Order.js
│   ├── TarotReading.js
│   └── ZodiacLog.js
├── routes/            # 路由
│   ├── auth.js
│   ├── zodiac.js
│   ├── tarot.js
│   ├── bazi.js
│   └── pay.js
├── services/          # 业务逻辑
│   ├── lunarService.js   # lunar库封装
│   ├── aiService.js      # 智谱AI封装
│   ├── zodiacService.js  # 星座计算
│   ├── tarotService.js   # 塔罗解牌
│   └── payService.js     # 支付服务
├── utils/             # 工具函数
│   ├── response.js       # 统一响应
│   ├── logger.js         # 日志
│   └── crypto.js         # 加密
├── app.js             # 应用入口
└── package.json
```

### 3.3 数据库设计

#### 用户表（users）
```javascript
{
  _id: ObjectId,
  openid: String,          // 微信openid
  phone: String,           // 手机号（可选）
  nickname: String,        // 昵称
  avatar: String,          // 头像
  zodiac: String,          // 星座
  birthDate: Date,         // 出生日期
  isMember: Boolean,       // 是否会员
  memberExpireAt: Date,    // 会员到期时间
  balance: Number,         // 余额
  createdAt: Date,
  updatedAt: Date
}
```

#### 订单表（orders）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  orderNo: String,         // 订单号
  type: String,            // 订单类型：tarot/zodiac/bazi
  amount: Number,          // 金额
  status: String,          // 状态：pending/paid/failed
  payMethod: String,       // 支付方式：wechat/alipay
  payTime: Date,           // 支付时间
  extra: Object,           // 扩展信息
  createdAt: Date
}
```

#### 塔罗解读记录（tarot_readings）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  spreadType: String,      // 牌阵类型
  cards: [{                // 抽取的牌
    name: String,
    isReversed: Boolean,   // 是否逆位
    position: String       // 位置
  }],
  question: String,        // 用户问题
  interpretation: String,  // AI解读
  isPaid: Boolean,         // 是否付费
  createdAt: Date
}
```

#### 星座日志（zodiac_logs）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  zodiac: String,
  type: String,            // daily/weekly/monthly
  fortune: Object,         // 运势数据
  isPaid: Boolean,
  createdAt: Date
}
```

### 3.4 API接口设计

#### 认证接口
```
POST /api/auth/wechat-login
请求：{ code: "微信code" }
响应：{ token: "JWT token", user: {...} }
```

#### 星座接口
```
GET /api/zodiac/:name/daily
响应：{
  zodiac: "aries",
  date: "2026-03-08",
  scores: {
    love: 4,
    career: 3,
    money: 5
  },
  summary: "今日运势概要...",
  detail: "详细解读（付费）..."
}

POST /api/zodiac/unlock
请求：{ zodiac: "aries", type: "daily" }
响应：{ orderId: "...", payUrl: "..." }
```

#### 塔罗接口
```
POST /api/tarot/draw
请求：{ spreadType: "three", question: "..." }
响应：{
  cards: [...],
  freeInterpretation: "简短解读",
  paidInterpretation: "详细解读（付费后可见）"
}

POST /api/tarot/chat
请求：{ readingId: "...", message: "..." }
响应：{ reply: "AI回复..." }
```

#### 八字接口
```
POST /api/bazi/calculate
请求：{ birthDate: "1990-01-01 10:00" }
响应：{
  bazi: "庚午 戊寅 甲午 己巳",
  wuxing: {...},
  character: "性格分析...",
  advice: "开运建议..."
}
```

---

## 四、核心算法与逻辑

### 4.1 lunar库集成
```javascript
// services/lunarService.js
const Lunar = require('lunar-javascript')

class LunarService {
  // 八字计算
  getBazi(birthDate) {
    const solar = Solar.fromDate(new Date(birthDate))
    const lunar = solar.getLunar()
    const bazi = lunar.getEightChar()
    
    return {
      year: bazi.getYear(),   // 年柱
      month: bazi.getMonth(), // 月柱
      day: bazi.getDay(),     // 日柱
      time: bazi.getTime(),   // 时柱
      wuxing: this.getWuxing(bazi),
      shengxiao: lunar.getYearShengXiao()
    }
  }
  
  // 五行分析
  getWuxing(bazi) {
    return {
      gold: bazi.getYearWuXing() === '金' ? 1 : 0,
      wood: bazi.getYearWuXing() === '木' ? 1 : 0,
      water: bazi.getYearWuXing() === '水' ? 1 : 0,
      fire: bazi.getYearWuXing() === '火' ? 1 : 0,
      earth: bazi.getYearWuXing() === '土' ? 1 : 0
    }
  }
  
  // 每日宜忌
  getDailyYiJi(date) {
    const solar = Solar.fromDate(new Date(date))
    const lunar = solar.getLunar()
    
    return {
      yi: lunar.getDayYi(),    // 宜
      ji: lunar.getDayJi()     // 忌
    }
  }
}

module.exports = new LunarService()
```

### 4.2 智谱AI集成
```javascript
// services/aiService.js
const axios = require('axios')

class AIService {
  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY
    this.baseURL = 'https://open.bigmodel.cn/api/paas/v3/model-api'
  }
  
  // 生成星座运势
  async generateZodiacFortune(zodiac, date) {
    const prompt = `你是一位专业的占星师，请为${zodiac}座生成${date}的运势分析。
要求：
1. 爱情、事业、财运三个维度，每个1-5分
2. 总体运势概述（50字左右）
3. 使用积极正向的语言
4. 模糊但有针对性（巴纳姆效应）
5. 给出1-2个具体建议

格式：
{
  "love": 分数,
  "career": 分数,
  "money": 分数,
  "summary": "概述",
  "advice": ["建议1", "建议2"]
}`

    const response = await axios.post(
      `${this.baseURL}/glm-4/invoke`,
      {
        prompt,
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return JSON.parse(response.data.data.choices[0].content)
  }
  
  // 塔罗牌解读
  async interpretTarot(cards, question) {
    const cardsInfo = cards.map(c => 
      `${c.name}${c.isReversed ? '（逆位）' : ''} - ${c.position}`
    ).join('、')
    
    const prompt = `你是一位专业的塔罗师，用户的问题是："${question}"
抽取的牌：${cardsInfo}

请给出专业、温暖、有启发性的解读：
1. 整体能量分析
2. 每张牌的含义
3. 综合建议
4. 行动指引

要求：
- 积极偏向，多说好话
- 使用模糊语言（可能、有机会）
- 给出具体可执行的建议
- 长度200-300字`

    // ... 调用API
  }
  
  // AI对话
  async chat(messages) {
    const response = await axios.post(
      `${this.baseURL}/glm-4/invoke`,
      {
        messages,  // [{ role: 'user', content: '...' }]
        temperature: 0.9,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    )
    
    return response.data.data.choices[0].content
  }
}

module.exports = new AIService()
```

### 4.3 星座运势算法
```javascript
// services/zodiacService.js
class ZodiacService {
  constructor() {
    this.zodiacs = [
      { name: 'aries', range: [3.21, 4.19] },
      { name: 'taurus', range: [4.20, 5.20] },
      // ... 12个星座
    ]
  }
  
  // 根据生日计算星座
  getZodiac(birthDate) {
    const date = new Date(birthDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const value = month + day / 100
    
    for (let zodiac of this.zodiacs) {
      if (value >= zodiac.range[0] && value <= zodiac.range[1]) {
        return zodiac.name
      }
    }
    return 'capricorn'
  }
  
  // 生成每日运势（混合算法 + AI）
  async generateDailyFortune(zodiac, date) {
    // 1. 基础算法（基于日期哈希）
    const baseScore = this.calculateBaseScore(zodiac, date)
    
    // 2. AI增强
    const aiFortune = await aiService.generateZodiacFortune(zodiac, date)
    
    // 3. 融合结果
    return {
      zodiac,
      date,
      scores: {
        love: this.adjustScore(baseScore.love, aiFortune.love),
        career: this.adjustScore(baseScore.career, aiFortune.career),
        money: this.adjustScore(baseScore.money, aiFortune.money)
      },
      summary: aiFortune.summary,
      advice: aiFortune.advice,
      detail: aiFortune.detail  // 付费内容
    }
  }
  
  // 基础分数计算（日期 + 星座哈希）
  calculateBaseScore(zodiac, date) {
    const hash = this.hashCode(zodiac + date)
    return {
      love: (Math.abs(hash % 5)) + 1,
      career: (Math.abs((hash >> 8) % 5)) + 1,
      money: (Math.abs((hash >> 16) % 5)) + 1
    }
  }
  
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return hash
  }
}

module.exports = new ZodiacService()
```

---

## 五、部署架构

### 5.1 开发环境
```
本地开发：
- Node.js + MongoDB + Redis 本地安装
- 使用 nodemon 热重载
- 使用 dotenv 管理环境变量
```

### 5.2 生产环境（V1.0）
```
单机部署（阿里云/腾讯云）：
- CPU: 2核
- 内存: 4GB
- 硬盘: 50GB
- 带宽: 5Mbps

软件环境：
- Ubuntu 22.04
- Nginx（反向代理 + HTTPS）
- PM2（Node.js进程管理）
- MongoDB 6
- Redis 7
```

### 5.3 扩展架构（V2.0）
```
┌─────────┐    ┌─────────┐
│  Nginx  │────│  Nginx  │ (负载均衡)
└────┬────┘    └────┬────┘
     │              │
  ┌──▼──┐        ┌──▼──┐
  │ API │        │ API │ (多实例)
  └──┬──┘        └──┬──┘
     │              │
  ┌──▼──────────────▼──┐
  │   MongoDB Cluster   │ (副本集)
  └─────────────────────┘
```

---

## 六、安全设计

### 6.1 认证与授权
- JWT Token认证
- Token过期时间：7天
- 刷新Token机制
- 敏感操作二次验证

### 6.2 数据安全
- 密码加密：bcrypt
- 敏感数据加密存储
- HTTPS传输
- SQL注入防护（Mongoose）

### 6.3 接口安全
- 接口限流：express-rate-limit
- 参数验证：joi
- XSS防护
- CORS配置

### 6.4 支付安全
- 支付回调验签
- 订单幂等性
- 金额二次验证
- 异步通知处理

---

## 七、性能优化

### 7.1 前端优化
- 路由懒加载
- 图片懒加载
- 静态资源CDN
- Gzip压缩
- 浏览器缓存

### 7.2 后端优化
- Redis缓存热门数据
- MongoDB索引优化
- API响应压缩
- 数据库连接池

### 7.3 缓存策略
```
Redis缓存：
- 星座运势：每日更新，TTL 24小时
- 用户信息：TTL 1小时
- AI解读结果：永久存储（用户付费内容）
```

---

## 八、监控与日志

### 8.1 日志系统
- Winston日志库
- 日志分级：error/warn/info/debug
- 日志文件切割
- 错误日志告警

### 8.2 监控指标
- QPS（每秒请求数）
- 响应时间
- 错误率
- CPU/内存使用率
- MongoDB慢查询

### 8.3 告警机制
- 错误率 > 5% 告警
- 响应时间 > 3秒 告警
- CPU > 80% 告警
- 磁盘空间 < 20% 告警

---

## 九、测试策略

### 9.1 单元测试
- Jest测试框架
- 覆盖率 > 70%
- 核心逻辑100%覆盖

### 9.2 集成测试
- Supertest API测试
- 数据库集成测试
- 支付流程测试

### 9.3 性能测试
- Apache Bench压力测试
- 并发100用户测试
- 响应时间 < 500ms

---

## 十、开发规范

### 10.1 代码规范
- ESLint代码检查
- Prettier格式化
- Git提交规范（Conventional Commits）

### 10.2 分支管理
```
main      - 生产环境
develop   - 开发环境
feature/* - 功能分支
hotfix/*  - 紧急修复
```

### 10.3 文档规范
- API文档：Swagger
- 代码注释：JSDoc
- README.md

---

**架构师：** OpenClaw 🦞  
**审核状态：** 待审核  
**下一文档：** 系统详细设计文档

---

**核心原则：**
> "简单实用 > 过度设计"  
> "快速迭代 > 完美架构"  
> "用户体验 > 技术炫技"
