<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="title">💬 与塔罗师对话</div>
      <div class="subtitle">深入探讨你的问题</div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        class="message"
        :class="msg.role"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🔮' }}
        </div>
        <div class="content">
          <div class="text">{{ msg.content }}</div>
          <div class="time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>
      
      <div v-if="loading" class="message assistant loading">
        <div class="avatar">🔮</div>
        <div class="content">
          <div class="typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <van-field
        v-model="inputMessage"
        placeholder="输入你的问题..."
        :disabled="loading"
        @keyup.enter="sendMessage"
      >
        <template #button>
          <van-button 
            size="small" 
            type="primary"
            :disabled="!inputMessage.trim() || loading"
            @click="sendMessage"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { tarotApi } from '@/api/tarot'

const route = useRoute()
const messages = ref([])
const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

const readingId = ref('')

onMounted(async () => {
  readingId.value = route.params.id || route.query.readingId
  
  if (!readingId.value) {
    showToast('无效的解读ID')
    return
  }
  
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '你好！我是你的专属塔罗师。关于刚才的牌面解读，你有什么想深入了解的吗？',
    timestamp: new Date()
  })
})

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return
  
  const userMessage = inputMessage.value.trim()
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })
  
  inputMessage.value = ''
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 调用AI
  loading.value = true
  
  try {
    const res = await tarotApi.chat(readingId.value, userMessage)
    
    if (res.code === 200) {
      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date()
      })
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
    }
  } catch (err) {
    showToast('发送失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (time) => {
  const date = new Date(time)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header .title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.chat-header .subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  display: flex;
  margin-bottom: 15px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .avatar {
  margin-left: 10px;
}

.message.assistant .avatar {
  margin-right: 10px;
}

.message .content {
  max-width: 70%;
}

.message .text {
  padding: 12px 15px;
  border-radius: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message.user .text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.message.assistant .text {
  background: white;
  color: #333;
  border-bottom-left-radius: 5px;
}

.message .time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  padding: 0 5px;
}

.message.user .time {
  text-align: right;
}

/* 打字动画 */
.typing {
  display: flex;
  gap: 5px;
  padding: 5px 0;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input {
  background: white;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
}
</style>
