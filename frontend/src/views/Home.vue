<template>
  <div class="home">
    <!-- 顶部Logo -->
    <div class="header">
      <div class="logo">🦞 AI命运守护神</div>
      <div class="slogan">用AI守护你的每一个选择</div>
    </div>

    <!-- 主要功能入口 -->
    <div class="main-features">
      <div class="feature-card" @click="goTo('/tarot')">
        <div class="icon">🃏</div>
        <div class="title">塔罗占卜</div>
        <div class="desc">探索过去、现在、未来</div>
        <div class="tag">热门</div>
      </div>

      <div class="feature-card" @click="goTo('/zodiac')">
        <div class="icon">⭐</div>
        <div class="title">星座运势</div>
        <div class="desc">今日运势早知道</div>
      </div>

      <div class="feature-card" @click="goTo('/bazi')">
        <div class="icon">☯️</div>
        <div class="title">八字测算</div>
        <div class="desc">解读命运密码</div>
      </div>
    </div>

    <!-- 今日运势速览 -->
    <div class="section">
      <div class="section-title">今日运势速览</div>
      <div class="zodiac-grid">
        <div 
          v-for="zodiac in zodiacs" 
          :key="zodiac.name" 
          class="zodiac-item"
          @click="goToZodiac(zodiac.name)"
        >
          <div class="zodiac-icon">{{ zodiac.icon }}</div>
          <div class="zodiac-name">{{ zodiac.name }}</div>
        </div>
      </div>
    </div>

    <!-- 为什么选择我们 -->
    <div class="section">
      <div class="section-title">为什么选择我们？</div>
      <div class="features-list">
        <div class="feature-item">
          <div class="icon">✨</div>
          <div class="text">
            <div class="title">AI专业解读</div>
            <div class="desc">智谱GLM-4深度分析</div>
          </div>
        </div>
        <div class="feature-item">
          <div class="icon">🔒</div>
          <div class="text">
            <div class="title">隐私保护</div>
            <div class="desc">数据加密，安全可靠</div>
          </div>
        </div>
        <div class="feature-item">
          <div class="icon">💬</div>
          <div class="text">
            <div class="title">情感陪伴</div>
            <div class="desc">24小时在线，随时倾诉</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="star-o" to="/tarot">占卜</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const active = ref(0)

const zodiacs = [
  { name: '白羊座', icon: '♈' },
  { name: '金牛座', icon: '♉' },
  { name: '双子座', icon: '♊' },
  { name: '巨蟹座', icon: '♋' },
  { name: '狮子座', icon: '♌' },
  { name: '处女座', icon: '♍' },
  { name: '天秤座', icon: '♎' },
  { name: '天蝎座', icon: '♏' },
  { name: '射手座', icon: '♐' },
  { name: '摩羯座', icon: '♑' },
  { name: '水瓶座', icon: '♒' },
  { name: '双鱼座', icon: '♓' }
]

const goTo = (path) => {
  router.push(path)
}

const goToZodiac = (name) => {
  router.push(`/zodiac?name=${name}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.header {
  padding: 60px 20px 40px;
  text-align: center;
  color: white;
}

.logo {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.slogan {
  font-size: 14px;
  opacity: 0.9;
}

.main-features {
  padding: 20px;
  display: flex;
  gap: 15px;
}

.feature-card {
  flex: 1;
  background: white;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
  position: relative;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.feature-card .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.feature-card .desc {
  font-size: 12px;
  color: #999;
}

.feature-card .tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.section {
  background: white;
  margin: 20px;
  border-radius: 15px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.zodiac-item {
  text-align: center;
  cursor: pointer;
}

.zodiac-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.zodiac-name {
  font-size: 12px;
  color: #666;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-item .icon {
  font-size: 32px;
}

.feature-item .text .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 3px;
}

.feature-item .text .desc {
  font-size: 12px;
  color: #999;
}
</style>
