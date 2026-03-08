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

      <div class="section">
        <div class="title">AI解读</div>
        <div class="interpretation">{{ reading?.interpretation }}</div>
      </div>

      <div v-if="!reading?.isPaid" class="unlock">
        <van-button type="primary" block round @click="unlock">
          解锁详细解读（9.9元）
        </van-button>
      </div>

      <div v-if="reading?.isPaid" class="paid-content">
        <div class="section">
          <div class="title">详细解读</div>
          <div class="detail">{{ reading?.detail }}</div>
        </div>
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

const unlock = async () => {
  try {
    const res = await tarotApi.unlock(reading.value._id)
    if (res.code === 200) {
      showToast('解锁成功')
      reading.value.isPaid = true
    }
  } catch (err) {
    showToast('解锁失败')
  }
}
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

.interpretation {
  color: #666;
  line-height: 1.8;
}

.unlock {
  margin-top: 20px;
}

.paid-content .detail {
  color: #666;
  line-height: 1.8;
}
</style>
