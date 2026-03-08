<template>
  <div class="tarot">
    <!-- 步骤条 -->
    <van-steps :active="step" active-color="#667eea">
      <van-step>输入问题</van-step>
      <van-step>抽取塔罗牌</van-step>
      <van-step>AI解读</van-step>
    </van-steps>

    <!-- 步骤1：输入问题 -->
    <div v-if="step === 0" class="step-content">
      <div class="section">
        <div class="title">你想探索什么？</div>
        <van-field
          v-model="question"
          rows="3"
          autosize
          type="textarea"
          placeholder="例如：我最近的感情运势如何？"
          show-word-limit
          maxlength="100"
        />
      </div>

      <div class="section">
        <div class="title">选择牌阵</div>
        <van-radio-group v-model="spreadType">
          <van-cell-group inset>
            <van-cell title="单张牌" clickable @click="spreadType = 'one'">
              <template #right-icon>
                <van-radio name="one" />
              </template>
            </van-cell>
            <van-cell title="三张牌（过去/现在/未来）" clickable @click="spreadType = 'three'">
              <template #right-icon>
                <van-radio name="three" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <div class="submit-btn">
        <van-button type="primary" block round @click="nextStep">
          下一步
        </van-button>
      </div>
    </div>

    <!-- 步骤2：抽取塔罗牌 -->
    <div v-if="step === 1" class="step-content">
      <div class="cards-container">
        <div class="title">点击抽取塔罗牌</div>
        
        <div class="cards-grid">
          <div 
            v-for="(card, index) in cards" 
            :key="index"
            class="card-wrapper"
          >
            <div 
              v-if="!revealed[index]"
              class="card-back"
              @click="revealCard(index)"
            >
              <div class="pattern">🃏</div>
            </div>
            <div v-else class="card-front">
              <div class="card-icon">{{ getCardEmoji(card) }}</div>
              <div class="card-name">{{ card.nameZh }}</div>
              <div class="card-status">{{ card.isReversed ? '逆位' : '正位' }}</div>
            </div>
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
          开始解读
        </van-button>
      </div>
    </div>

    <!-- 步骤3：AI解读 -->
    <div v-if="step === 2" class="step-content">
      <div class="reading-result">
        <div class="section">
          <div class="title">AI解读</div>
          <div class="interpretation">{{ interpretation }}</div>
        </div>

        <div class="section">
          <van-button type="primary" block round @click="unlockDetail">
            解锁详细解读（9.9元）
          </van-button>
        </div>

        <div class="section">
          <van-button plain type="primary" block round @click="reset">
            重新占卜
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { tarotApi } from '@/api/tarot'

const step = ref(0)
const question = ref('')
const spreadType = ref('three')
const cards = ref([])
const revealed = ref([])
const interpretation = ref('')
const loading = ref(false)
const readingId = ref('')

const allRevealed = computed(() => {
  return revealed.value.length > 0 && revealed.value.every(r => r)
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
  
  step.value = 1
}

// 翻牌
const revealCard = async (index) => {
  if (revealed.value[index]) return
  
  // 第一次翻牌时获取塔罗牌
  if (cards.value.length === 0) {
    try {
      const res = await tarotApi.draw({
        question: question.value,
        spreadType: spreadType.value
      })
      
      if (res.code === 200) {
        cards.value = res.data.cards
        readingId.value = res.data.readingId
      }
    } catch (err) {
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
      interpretation.value = res.data.interpretation
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
  try {
    const res = await tarotApi.unlock(readingId.value)
    
    if (res.code === 200) {
      showToast('解锁成功')
      // TODO: 显示详细解读
    }
  } catch (err) {
    showToast('解锁失败')
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

// 获取卡牌emoji
const getCardEmoji = (card) => {
  const emojis = {
    '愚者': '🃏',
    '魔术师': '🎩',
    '女祭司': '🔮',
    '女皇': '👑',
    '皇帝': '⚔️',
    '恋人': '💕',
    '战车': '🏎️',
    '力量': '🦁',
    '星星': '⭐',
    '月亮': '🌙',
    '太阳': '☀️',
    '世界': '🌍'
  }
  
  return emojis[card.nameZh] || '🃏'
}
</script>

<style scoped>
.tarot {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.step-content {
  padding: 20px;
}

.section {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.section .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.submit-btn {
  margin-top: 20px;
}

/* 塔罗牌样式 */
.cards-container {
  text-align: center;
}

.cards-container .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.cards-grid {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.card-wrapper {
  width: 100px;
  height: 150px;
}

.card-back,
.card-front {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-back {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s;
}

.card-back:hover {
  transform: scale(1.05);
}

.card-back .pattern {
  font-size: 48px;
  color: white;
}

.card-front {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-front .card-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.card-front .card-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.card-front .card-status {
  font-size: 12px;
  color: #999;
}

/* 解读结果 */
.reading-result .interpretation {
  line-height: 1.8;
  color: #666;
}
</style>
