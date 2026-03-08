<template>
  <div class="tarot">
    <van-nav-bar
      title="塔罗占卜"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <div class="quota-info">
          ✨ 无限使用
        </div>
      </template>
    </van-nav-bar>

    <!-- 步骤条 -->
    <div class="steps-container">
      <van-steps :active="step" active-color="#667eea">
        <van-step>输入问题</van-step>
        <van-step>抽取塔罗牌</van-step>
        <van-step>AI解读</van-step>
      </van-steps>
    </div>

    <!-- 步骤1：输入问题 -->
    <div v-if="step === 0" class="step-content">
      <div class="section">
        <div class="title">🔮 你想探索什么？</div>
        <van-field
          v-model="question"
          rows="3"
          autosize
          type="textarea"
          placeholder="例如：我最近的感情运势如何？我的事业发展方向是什么？"
          show-word-limit
          maxlength="100"
        />
      </div>

      <div class="section">
        <div class="title">🎴 选择牌阵</div>
        <van-radio-group v-model="spreadType">
          <van-cell-group inset>
            <van-cell 
              title="单张牌" 
              label="快速指引，适合简单问题"
              clickable 
              @click="spreadType = 'one'"
            >
              <template #right-icon>
                <van-radio name="one" />
              </template>
            </van-cell>
            <van-cell 
              title="三张牌" 
              label="过去/现在/未来，深度分析"
              clickable 
              @click="spreadType = 'three'"
            >
              <template #right-icon>
                <van-radio name="three" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <div class="submit-btn">
        <van-button 
          type="primary" 
          block 
          round 
          :disabled="!question.trim()"
          @click="nextStep"
        >
          下一步
        </van-button>
      </div>
    </div>

    <!-- 步骤2：抽取塔罗牌 -->
    <div v-if="step === 1" class="step-content">
      <div class="cards-container">
        <div class="title">✨ 点击卡牌抽取塔罗牌</div>
        <div class="subtitle">专注思考你的问题</div>
        
        <div class="cards-grid" :class="{ 'single-card': spreadType === 'one' }">
          <div 
            v-for="(card, index) in displayCards" 
            :key="index"
            class="card-wrapper"
          >
            <div 
              v-if="!revealed[index]"
              class="card-back"
              @click="revealCard(index)"
            >
              <div class="pattern">🃏</div>
              <div class="position">{{ getPositionName(index) }}</div>
            </div>
            <transition name="flip">
              <div v-if="revealed[index]" class="card-front">
                <div class="card-emoji">{{ getCardEmoji(card) }}</div>
                <div class="card-name">{{ card.nameZh }}</div>
                <div class="card-keyword">{{ card.keyword }}</div>
                <div class="card-status" :class="{ reversed: card.isReversed }">
                  {{ card.isReversed ? '逆位 ↓' : '正位 ↑' }}
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="submit-btn">
        <van-button 
          type="primary" 
          block 
          round 
          :disabled="!allRevealed"
          :loading="loading"
          @click="getReading"
        >
          {{ allRevealed ? '开始解读' : '请先抽取所有卡牌' }}
        </van-button>
      </div>
    </div>

    <!-- 步骤3：AI解读 -->
    <div v-if="step === 2" class="step-content">
      <div class="reading-result">
        <div class="section">
          <div class="title">🎯 你的问题</div>
          <div class="question-text">{{ question }}</div>
        </div>

        <div class="section">
          <div class="title">🎴 抽到的牌</div>
          <div class="cards-summary">
            <div 
              v-for="(card, index) in cards" 
              :key="index"
              class="card-summary"
            >
              <div class="card-position">{{ getPositionName(index) }}</div>
              <div class="card-info">
                <span class="name">{{ card.nameZh }}</span>
                <span class="status" :class="{ reversed: card.isReversed }">
                  {{ card.isReversed ? '逆位' : '正位' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="title">✨ AI解读</div>
          <div class="interpretation">{{ interpretation }}</div>
        </div>

        <div class="action-buttons">
          <van-button 
            plain 
            type="primary" 
            block 
            round 
            @click="startChat"
            icon="chat-o"
          >
            与塔罗师深入对话
          </van-button>
          <van-button 
            plain 
            type="warning" 
            block 
            round 
            @click="reset"
          >
            重新占卜
          </van-button>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { tarotApi } from '@/api/tarot'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const active = ref(1)

const step = ref(0)
const question = ref('')
const spreadType = ref('three')
const cards = ref([])
const revealed = ref([])
const interpretation = ref('')
const loading = ref(false)
const readingId = ref('')

// 显示的卡牌数量
const displayCards = computed(() => {
  const count = spreadType.value === 'one' ? 1 : 3
  return cards.value.slice(0, count)
})

// 所有牌是否都已翻开
const allRevealed = computed(() => {
  if (revealed.value.length === 0) return false
  const count = spreadType.value === 'one' ? 1 : 3
  return revealed.value.slice(0, count).every(r => r)
})

// 下一步
const nextStep = () => {
  if (!question.value.trim()) {
    showToast('请输入你想探索的问题')
    return
  }
  
  // 初始化翻牌状态
  const cardCount = spreadType.value === 'one' ? 1 : 3
  revealed.value = new Array(cardCount).fill(false)
  cards.value = new Array(cardCount).fill({})
  
  step.value = 1
}

// 翻牌
const revealCard = async (index) => {
  if (revealed.value[index]) return
  
  // 第一次翻牌时获取塔罗牌
  if (cards.value.every(c => !c.name)) {
    try {
      showLoadingToast({
        message: '正在抽取塔罗牌...',
        forbidClick: true,
      })
      
      const res = await tarotApi.draw({
        question: question.value,
        spreadType: spreadType.value
      })
      
      closeToast()
      
      if (res.code === 200) {
        cards.value = res.data.cards
        readingId.value = res.data.readingId
        interpretation.value = res.data.interpretation || res.data.freeInterpretation
      } else {
        // 显示错误信息
        showToast(res.message || '抽取塔罗牌失败')
        return
      }
    } catch (err) {
      closeToast()
      console.error('抽取塔罗牌失败:', err)
      showToast('抽取塔罗牌失败，请稍后再试')
      return
    }
  }
  
  revealed.value[index] = true
}

// 获取解读
const getReading = async () => {
  loading.value = true
  
  try {
    const res = await tarotApi.getReading(readingId.value)
    
    if (res.code === 200) {
      interpretation.value = res.data.interpretation || interpretation.value
      step.value = 2
    } else {
      showToast(res.message || '获取解读失败')
    }
  } catch (err) {
    console.error('获取解读失败:', err)
    showToast('获取解读失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 重新占卜
const reset = () => {
  step.value = 0
  question.value = ''
  cards.value = []
  revealed.value = []
  interpretation.value = ''
  readingId.value = ''
}

// 开始对话
const startChat = () => {
  router.push({
    path: '/chat',
    query: { readingId: readingId.value }
  })
}

// 获取位置名称
const getPositionName = (index) => {
  if (spreadType.value === 'one') return '指引'
  const positions = ['过去', '现在', '未来']
  return positions[index] || `位置${index + 1}`
}

// 获取卡牌emoji
const getCardEmoji = (card) => {
  if (card.keyword?.includes('成功')) return '✨'
  if (card.keyword?.includes('爱')) return '💕'
  if (card.keyword?.includes('智慧')) return '🔮'
  return '🃏'
}
</script>

<style scoped>
.tarot {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.quota-info {
  font-size: 14px;
  color: #667eea;
  font-weight: bold;
}

.steps-container {
  padding: 15px;
  background: white;
}

.step-content {
  padding: 20px;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
}

.section .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.submit-btn {
  margin-top: 20px;
}

/* 塔罗牌样式 */
.cards-container {
  text-align: center;
  margin-bottom: 20px;
}

.cards-container .title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.cards-container .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 25px;
}

.cards-grid {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.cards-grid.single-card {
  justify-content: center;
}

.card-wrapper {
  width: 120px;
  height: 180px;
}

.card-back,
.card-front {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.card-back {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  transition: transform 0.3s;
}

.card-back:hover {
  transform: scale(1.05);
}

.card-back .pattern {
  font-size: 60px;
  color: rgba(255, 255, 255, 0.8);
}

.card-back .position {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-top: 10px;
}

.card-front {
  background: white;
  animation: flipIn 0.5s;
}

@keyframes flipIn {
  from {
    transform: rotateY(90deg);
    opacity: 0;
  }
  to {
    transform: rotateY(0);
    opacity: 1;
  }
}

.card-front .card-emoji {
  font-size: 50px;
  margin-bottom: 10px;
}

.card-front .card-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.card-front .card-keyword {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.card-front .card-status {
  font-size: 12px;
  color: #52c41a;
  font-weight: bold;
}

.card-front .card-status.reversed {
  color: #ff4d4f;
}

/* 解读结果 */
.reading-result .question-text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.cards-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-summary {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.card-summary .card-position {
  font-weight: bold;
  color: #667eea;
  width: 60px;
}

.card-summary .card-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-summary .name {
  color: #333;
  font-weight: bold;
}

.card-summary .status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #52c41a;
  color: white;
}

.card-summary .status.reversed {
  background: #ff4d4f;
}

.interpretation {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
</style>
