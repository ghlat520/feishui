<template>
  <div class="zodiac">
    <div class="header">
      <h2>星座运势</h2>
    </div>

    <div class="zodiac-grid">
      <div 
        v-for="zodiac in zodiacs" 
        :key="zodiac.name"
        class="zodiac-card"
        @click="viewFortune(zodiac)"
      >
        <div class="icon">{{ zodiac.icon }}</div>
        <div class="name">{{ zodiac.name }}</div>
        <div class="date">{{ zodiac.date }}</div>
      </div>
    </div>

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
const active = ref(1)

const zodiacs = [
  { name: '白羊座', icon: '♈', date: '3.21-4.19', en: 'aries' },
  { name: '金牛座', icon: '♉', date: '4.20-5.20', en: 'taurus' },
  { name: '双子座', icon: '♊', date: '5.21-6.21', en: 'gemini' },
  { name: '巨蟹座', icon: '♋', date: '6.22-7.22', en: 'cancer' },
  { name: '狮子座', icon: '♌', date: '7.23-8.22', en: 'leo' },
  { name: '处女座', icon: '♍', date: '8.23-9.22', en: 'virgo' },
  { name: '天秤座', icon: '♎', date: '9.23-10.23', en: 'libra' },
  { name: '天蝎座', icon: '♏', date: '10.24-11.22', en: 'scorpio' },
  { name: '射手座', icon: '♐', date: '11.23-12.21', en: 'sagittarius' },
  { name: '摩羯座', icon: '♑', date: '12.22-1.19', en: 'capricorn' },
  { name: '水瓶座', icon: '♒', date: '1.20-2.18', en: 'aquarius' },
  { name: '双鱼座', icon: '♓', date: '2.19-3.20', en: 'pisces' }
]

const viewFortune = (zodiac) => {
  // TODO: 跳转到星座详情页
  console.log('查看运势:', zodiac)
}
</script>

<style scoped>
.zodiac {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  text-align: center;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px;
}

.zodiac-card {
  background: white;
  border-radius: 10px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.zodiac-card:hover {
  transform: translateY(-3px);
}

.zodiac-card .icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.zodiac-card .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.zodiac-card .date {
  font-size: 12px;
  color: #999;
}
</style>
