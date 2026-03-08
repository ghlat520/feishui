# AI命运守护神 🌟

> 基于AI的情感陪伴型玄学娱乐产品

## 项目简介

AI命运守护神是一款H5 Web应用，通过星座、塔罗牌、八字等传统玄学元素，为用户提供情绪价值和心理安慰。

**核心价值：**
- 🌈 确定性安慰（缓解焦虑）
- 💜 情感宣泄（倾诉出口）
- ✨ 娱乐希望（生活仪式感）

## 技术栈

### 前端
- Vue 3 + Vite
- Vant 4 (移动端UI)
- Pinia (状态管理)
- Axios (HTTP客户端)

### 后端
- Node.js + Express
- MongoDB + Mongoose
- Redis (缓存)
- JWT (认证)

### 核心依赖
- **lunar-javascript** - 农历/八字计算核心库
- **智谱AI API** - AI对话与内容生成

## 项目结构

```
ai-fortune-h5/
├── PRD.md                      # 产品需求文档
├── TECH_ARCHITECTURE.md        # 技术架构设计
├── SYSTEM_DESIGN.md            # 系统详细设计
├── REVIEW.md                   # 文档审核报告
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── components/        # 组件
│   │   ├── views/             # 页面
│   │   ├── stores/            # 状态管理
│   │   └── utils/             # 工具函数
│   └── package.json
├── backend/                    # 后端项目
│   ├── config/                # 配置
│   ├── controllers/           # 控制器
│   ├── models/                # 数据模型
│   ├── routes/                # 路由
│   ├── services/              # 业务逻辑
│   └── package.json
└── README.md
```

## 功能模块

### 1. 星座运势 ⭐⭐⭐⭐⭐
- 12星座每日/每周/每月运势
- 爱情、事业、财运三维度
- AI生成个性化解读

### 2. 塔罗占卜 ⭐⭐⭐⭐⭐
- 78张精美塔罗牌UI
- 三种牌阵（单张/三张/凯尔特十字）
- AI智能解牌

### 3. AI聊天陪伴 ⭐⭐⭐⭐
- 情感倾诉与陪伴
- 基于占卜结果的深度对话

### 4. 八字测算 ⭐⭐⭐
- 生辰八字计算
- 五行分析
- 性格特点解读

## 快速开始

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问: http://localhost:5173

### 后端启动

```bash
cd backend
npm install
npm run dev
```

API地址: http://localhost:3000

### 环境变量配置

后端 `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-fortune
REDIS_URI=redis://localhost:6379
JWT_SECRET=your-secret-key
ZHIPU_API_KEY=your-zhipu-api-key
```

## API文档

主要接口：

### 认证
- `POST /api/auth/wechat-login` - 微信登录

### 星座
- `GET /api/zodiac/:name/daily` - 获取每日运势
- `POST /api/zodiac/unlock` - 解锁详细解读

### 塔罗
- `POST /api/tarot/draw` - 抽取塔罗牌
- `POST /api/tarot/unlock` - 解锁详细解读
- `POST /api/tarot/chat` - AI对话

### 八字
- `POST /api/bazi/calculate` - 计算八字

## 商业模式

- **免费引流**：基础星座运势、单张塔罗牌
- **低价转化**：详细解读 9.9-49.9元
- **高价服务**：会员订阅 19.9元/月
- **增值服务**：开运商城（佣金）

## 合规说明

⚠️ **重要声明**

本产品定位为**娱乐产品**，非迷信工具。

- 所有结果仅供参考，不构成任何承诺
- 请勿沉迷，理性对待
- 仅供娱乐，请勿迷信

## 开源协议

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

- 作者：OpenClaw 🦞
- 邮箱：openclaw@clawd.ai
- 项目地址：[GitHub](https://github.com/openclaw/ai-fortune-h5)

---

**核心洞察：**
> "AI命运守护神卖的不是'预知未来'，而是'确定性安慰 + 情感宣泄 + 娱乐希望'"
