# AI命运守护神 - 前端H5

**技术栈：** Vue 3 + Vite + Vant 4  
**开发进度：** 30%

---

## 🎯 已完成功能

### 核心页面（6个）
- ✅ 首页（Home.vue）- 功能入口、星座速览
- ✅ 登录页（Login.vue）- 手机号登录
- ✅ 塔罗占卜页（Tarot.vue）- 输入问题、抽牌、AI解读
- ✅ 星座运势页（Zodiac.vue）- 12星座选择
- ✅ 八字测算页（Bazi.vue）- 出生日期输入
- ✅ 用户中心页（User.vue）- 个人信息、设置

### 核心配置
- ✅ 路由配置（router/index.js）- 7个路由
- ✅ 状态管理（stores/user.js）- Pinia用户状态
- ✅ API封装（api/*）- 认证、塔罗、用户API
- ✅ HTTP拦截器（utils/request.js）- 统一请求处理

---

## 🚀 启动项目

```bash
cd /home/wuying/clawd/projects/ai-fortune-h5/frontend
npm run dev
```

**访问地址：** http://localhost:5173

---

## 📂 项目结构

```
frontend/
├── src/
│   ├── api/              # API接口
│   │   ├── auth.js       # 认证API
│   │   ├── tarot.js      # 塔罗API
│   │   └── user.js       # 用户API
│   ├── stores/           # Pinia状态管理
│   │   └── user.js       # 用户状态
│   ├── router/           # 路由配置
│   │   └── index.js      # 路由定义
│   ├── utils/            # 工具函数
│   │   └── request.js    # HTTP拦截器
│   ├── views/            # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── Login.vue     # 登录
│   │   ├── Tarot.vue     # 塔罗占卜
│   │   ├── Zodiac.vue    # 星座运势
│   │   ├── Bazi.vue      # 八字测算
│   │   ├── User.vue      # 用户中心
│   │   └── TarotReading.vue # 解读详情
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── package.json          # 依赖配置
└── vite.config.js        # Vite配置
```

---

## 🎨 UI设计

### 首页
- 紫色渐变背景
- 3个主要功能卡片（塔罗、星座、八字）
- 12星座速览网格
- 底部Tabbar导航

### 塔罗占卜页
- 3步骤流程：输入问题 → 抽牌 → AI解读
- 翻牌动画效果
- AI解读展示
- 付费解锁按钮

### 登录页
- 简洁登录表单
- 手机号 + 验证码
- 测试验证码：123456

---

## 🔧 环境配置

### Vite配置
```javascript
// vite.config.js
{
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}
```

### API代理
- `/api` 请求自动转发到后端 `http://localhost:3000`

---

## 📝 待开发功能

### 核心功能
- ⏳ 星座运势详情页
- ⏳ 八字测算结果页
- ⏳ 支付流程
- ⏳ 用户订单页面

### 优化项
- ⏳ 加载动画
- ⏳ 错误边界
- ⏳ 性能优化
- ⏳ 响应式布局

---

## 🎯 下一步

1. 完善塔罗占卜交互
2. 实现星座运势详情页
3. 实现八字测算功能
4. 对接支付功能
5. 前后端联调

---

**开发进度：** 30%  
**预计完成：** 3天

🦞 OpenClaw
