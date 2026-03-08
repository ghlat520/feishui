<template>
  <div class="tarot">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="塔罗占卜"
      left-arrow
      @click-left="router.back()"
    />

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

      <div class="tips">
        <van-icon name="info-o" /> AI将根据你的问题进行专业解读
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

        <div v-if="!isPaid" class="section unlock-section">
          <div class="unlock-preview">
            <van-icon name="lock" /> 解锁详细解读，获得更深入的分析
          </div>
          <van-button 
            type="primary" 
            block 
            round 
            :loading="unlockLoading"
            @click="unlockDetail"
          >
            解锁详细解读（9.9元）
          </van-button>
        </div>

        <div v-if="isPaid" class="section paid-section">
          <div class="title">📖 详细解读</div>
          <div class="detail-content">{{ detailInterpretation }}</div>
          
          <div class="advice-section">
            <div class="title">💡 AI建议</div>
            <div class="advice-list">
              <div v-for="(item, index) in advice" :key="index" class="advice-item">
                <van-icon name="success" /> {{ item }}
              </div>
            </div>
          </div>
          
          <div class="chat-entry">
            <van-button 
              type="primary" 
              plain
              block 
              round
              icon="chat-o"
              @click="startChat"
            >
              与塔罗师深入对话
            </van-button>
          </div>
        </div>

        <div class="action-buttons">
          <van-button 
            plain 
            type="primary" 
            block 
            round 
            @click="reset"
          >
            重新占卜
          </van-button>
          <van-button 
            plain 
            type="default" 
            block 
            round 
            @click="share"
          >
            分享给朋友
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { tarotApi } from '@/api/tarot'
import { payApi } from '@/api/pay'

const router = useRouter()
const active = ref(1)

const step = ref(0)
const question = ref('')
const spreadType = ref('three')
const cards = ref([])
const revealed = ref([])
const interpretation = ref('')
const loading = ref(false)
const readingId = ref('')
const isPaid = ref(false)
const unlockLoading = ref(false)
const detailInterpretation = ref('')
const advice = ref([])

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
        interpretation.value = res.data.freeInterpretation
      }
    } catch (err) {
      closeToast()
      showToast('抽取塔罗牌失败')
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
      isPaid.value = res.data.isPaid || false
      
      if (isPaid.value) {
        detailInterpretation.value = res.data.detailInterpretation
        advice.value = res.data.advice || []
      }
      
      step.value = 2
    }
  } catch (err) {
    showToast('获取解读失败')
  } finally {
    loading.value = false
  }
}

// 解锁详细解读
const unlockDetail = async () => {
  unlockLoading.value = true
  
  try {
    const res = await tarotApi.unlock(readingId.value)
    
    if (res.code === 200 && res.data.mockPaySuccess) {
      // 模拟支付成功
      await payApi.mockSuccess(res.data.orderId)
      
      showToast('解锁成功')
      
      // 重新获取解读
      const readingRes = await tarotApi.getReading(readingId.value)
      if (readingRes.code === 200) {
        isPaid.value = true
        detailInterpretation.value = readingRes.data.detailInterpretation
        advice.value = readingRes.data.advice || []
      }
    }
  } catch (err) {
    showToast('解锁失败')
  } finally {
    unlockLoading.value = false
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
  isPaid.value = false
  detailInterpretation.value = ''
  advice.value = []
}

// 分享
const share = () => {
  showToast('分享功能开发中')
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
  const emojiMap = {
    '愚者': '🃏', '魔术师': '🎩', '女祭司': '🔮', '女皇': '👑',
    '皇帝': '⚔️', '恋人': '💕', '战车': '🏎️', '力量': '🦁',
    '星星': '⭐', '月亮': '🌙', '太阳': '☀️', '世界': '🌍'
  }
  
  // 从card.keyword提取主要词汇
  if (card.keyword?.includes('成功')) return '✨'
  if (card.keyword?.includes('爱')) return '💕'
  if (card.keyword?.includes('智慧')) return '🔮'
  
  return emojiMap[card.nameZh] || '🃏'
}
</script>

<style scoped>
.tarot {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
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

.tips {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
  color: #666;
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

.unlock-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.unlock-preview {
  font-size: 14px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.paid-section .detail-content {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
  margin-bottom: 20px;
}

.advice-section {
  margin-top: 20px;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.advice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f0f5ff;
  border-radius: 8px;
  color: #666;
}

.chat-entry {
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
</style>
