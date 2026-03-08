<template>
  <div class="tarot-reading">
    <div class="header">
      <h2>塔罗解读详情</h2>
    </div>

    <div class="content">
      <div class="section">
        <div class="title">你的问题</div>
        <div class="text">{{ reading?.question }}</div>
      </div>

      <div class="section">
        <div class="title">抽到的牌</div>
        <div class="cards">
          <div v-for="(card, index) in reading?.cards" :key="index" class="card">
            <div class="card-name">{{ card.nameZh }}</div>
            <div class="card-status">{{ card.isReversed ? '逆位' : '正位' }}</div>
          </div>
        </div>
      </div>

      <!-- MVP版本：所有内容免费开放 -->
      <div class="section">
        <div class="title">AI解读</div>
        <div class="interpretation">{{ reading?.interpretation }}</div>
      </div>

      <div class="section">
        <div class="title">详细解读</div>
        <div class="detail">{{ reading?.detail || '这是一个全面的塔罗解读，涵盖了问题的各个方面。牌面显示，你目前正处于一个重要的转折点。建议保持积极心态，相信自己的直觉，勇敢面对挑战。记住，塔罗牌只是指引，真正的力量在你自己手中。' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { tarotApi } from '@/api/tarot'

const route = useRoute()
const reading = ref(null)

onMounted(async () => {
  const id = route.params.id

  try {
    const res = await tarotApi.getReading(id)
    if (res.code === 200) {
      reading.value = res.data
    }
  } catch (err) {
    showToast('加载失败')
  }
})
</script>

<style scoped>
.tarot-reading {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  text-align: center;
}

.content {
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

.section .text {
  color: #666;
  line-height: 1.6;
}

.cards {
  display: flex;
  gap: 10px;
}

.card {
  flex: 1;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.card-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.card-status {
  font-size: 12px;
  color: #999;
}

.interpretation,
.detail {
  color: #666;
  line-height: 1.8;
  text-align: justify;
}
</style>
