<template>
  <div class="zodiac">
    <van-nav-bar
      title="星座运势"
      left-arrow
      @click-left="router.back()"
    />

    <div class="header">
      <div class="date">{{ today }}</div>
      <div class="title">选择你的星座</div>
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
        <div class="date-range">{{ zodiac.date }}</div>
      </div>
    </div>

    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="star-o" to="/tarot">占卜</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 星座详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="fortune-detail">
        <div class="detail-header">
          <div class="zodiac-icon">{{ currentZodiac?.icon }}</div>
          <div class="zodiac-name">{{ currentZodiac?.name }}</div>
          <div class="zodiac-element">{{ fortune?.element }} · 守护星：{{ fortune?.ruler }}</div>
        </div>

        <div class="scores-section">
          <div class="score-item">
            <div class="label">💕 爱情</div>
            <div class="stars">
              <van-icon v-for="i in 5" :key="i" :name="i <= fortune?.scores?.love ? 'star' : 'star-o'" />
            </div>
          </div>
          <div class="score-item">
            <div class="label">💼 事业</div>
            <div class="stars">
              <van-icon v-for="i in 5" :key="i" :name="i <= fortune?.scores?.career ? 'star' : 'star-o'" />
            </div>
          </div>
          <div class="score-item">
            <div class="label">💰 财运</div>
            <div class="stars">
              <van-icon v-for="i in 5" :key="i" :name="i <= fortune?.scores?.money ? 'star' : 'star-o'" />
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="title">今日运势</div>
          <div class="summary">{{ fortune?.summary }}</div>
        </div>

        <div class="lucky-section">
          <div class="title">幸运指南</div>
          <div class="lucky-items">
            <div class="lucky-item">
              <span class="key">幸运颜色：</span>
              <span class="value">{{ fortune?.luckyItems?.color }}</span>
            </div>
            <div class="lucky-item">
              <span class="key">幸运数字：</span>
              <span class="value">{{ fortune?.luckyItems?.number }}</span>
            </div>
            <div class="lucky-item">
              <span class="key">幸运方位：</span>
              <span class="value">{{ fortune?.luckyItems?.direction }}</span>
            </div>
          </div>
        </div>

        <!-- MVP版本：所有内容免费开放，无需解锁 -->
        <div class="advice-section">
          <div class="title">今日建议</div>
          <div class="advice">{{ (fortune?.free?.advice || ['保持积极心态']).join('、') }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { zodiacApi } from '@/api/zodiac'

const router = useRouter()
const active = ref(1)

const today = computed(() => {
  const date = new Date()
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

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

const showDetail = ref(false)
const currentZodiac = ref(null)
const fortune = ref(null)

const viewFortune = async (zodiac) => {
  currentZodiac.value = zodiac
  showDetail.value = true

  try {
    showLoadingToast({
      message: '正在生成运势...',
      forbidClick: true,
    })

    const res = await zodiacApi.getDaily(zodiac.en)

    closeToast()

    if (res.code === 200) {
      fortune.value = res.data
    }
  } catch (err) {
    closeToast()
    showToast('获取运势失败')
  }
}
</script>

<style scoped>
.zodiac {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.header {
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.header .date {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.header .title {
  font-size: 24px;
  font-weight: bold;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 0 20px;
}

.zodiac-card {
  background: white;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.zodiac-card:hover {
  transform: translateY(-5px);
}

.zodiac-card .icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.zodiac-card .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.zodiac-card .date-range {
  font-size: 12px;
  color: #999;
}

/* 运势详情 */
.fortune-detail {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header .zodiac-icon {
  font-size: 60px;
  margin-bottom: 10px;
}

.detail-header .zodiac-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.detail-header .zodiac-element {
  font-size: 14px;
  color: #999;
}

.scores-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.score-item .label {
  font-size: 16px;
  color: #333;
}

.score-item .stars {
  color: #f4d03f;
  font-size: 18px;
}

.summary-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-section .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.summary-section .summary {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.lucky-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.lucky-section .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.lucky-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lucky-item {
  display: flex;
  align-items: center;
  font-size: 15px;
}

.lucky-item .key {
  color: #999;
  width: 100px;
}

.lucky-item .value {
  color: #333;
  font-weight: bold;
}

.advice-section {
  padding: 20px 0;
}

.advice-section .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.advice-section .advice {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  padding: 15px;
  background: #f0f5ff;
  border-radius: 8px;
}
</style>
