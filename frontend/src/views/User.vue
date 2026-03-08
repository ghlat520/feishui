<template>
  <div class="user">
    <div v-if="!userStore.token" class="not-login">
      <div class="icon">👤</div>
      <div class="text">登录后查看个人信息</div>
      <van-button type="primary" round size="large" to="/login">
        立即登录
      </van-button>
    </div>

    <div v-else class="logged-in">
      <div class="header">
        <div class="avatar">{{ userStore.userInfo?.nickname?.charAt(0) || '神' }}</div>
        <div class="nickname">{{ userStore.userInfo?.nickname || '神秘用户' }}</div>
        <div class="member-badge" v-if="userStore.isMember">
          <van-tag type="warning" size="large">会员</van-tag>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="value">{{ userStore.userInfo?.stats?.tarotCount || 0 }}</div>
            <div class="label">占卜次数</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ userStore.userInfo?.stats?.zodiacCount || 0 }}</div>
            <div class="label">运势查看</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ userStore.userInfo?.stats?.baziCount || 0 }}</div>
            <div class="label">八字测算</div>
          </div>
        </div>
      </div>

      <van-cell-group inset class="menu-group">
        <van-cell title="我的占卜记录" is-link @click="showReadings" />
        <van-cell title="我的订单" is-link @click="showOrders" />
        <van-cell title="会员中心" is-link @click="showMember" />
        <van-cell title="设置" is-link @click="showSettings" />
        <van-cell title="帮助与反馈" is-link @click="showHelp" />
      </van-cell-group>

      <div class="logout">
        <van-button 
          block 
          plain 
          type="danger" 
          round
          @click="handleLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>

    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="star-o" to="/tarot">占卜</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 占卜记录 -->
    <van-popup 
      v-model:show="showReadingsPopup" 
      position="bottom" 
      :style="{ height: '60%' }"
      round
    >
      <div class="popup-content">
        <div class="popup-title">我的占卜记录</div>
        <div v-if="readings.length === 0" class="empty">
          <van-empty description="暂无占卜记录" />
        </div>
        <div v-else class="readings-list">
          <div 
            v-for="reading in readings" 
            :key="reading.id"
            class="reading-item"
            @click="viewReading(reading)"
          >
            <div class="reading-question">{{ reading.question }}</div>
            <div class="reading-time">{{ formatTime(reading.createdAt) }}</div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 会员中心 -->
    <van-popup 
      v-model:show="showMemberPopup" 
      position="bottom" 
      :style="{ height: '80%' }"
      round
    >
      <div class="popup-content">
        <div class="popup-title">会员中心</div>
        
        <div class="member-cards">
          <div class="member-card" @click="buyMember(30)">
            <div class="duration">月度会员</div>
            <div class="price">¥19.9</div>
            <div class="benefits">
              <div>✓ 无限塔罗占卜</div>
              <div>✓ 无限星座运势</div>
              <div>✓ 详细解读免费</div>
            </div>
          </div>
          
          <div class="member-card recommend" @click="buyMember(365)">
            <div class="badge">推荐</div>
            <div class="duration">年度会员</div>
            <div class="price">¥199 <span class="original">¥238.8</span></div>
            <div class="benefits">
              <div>✓ 所有月度特权</div>
              <div>✓ 专属客服</div>
              <div>✓ 优先新功能</div>
            </div>
          </div>
        </div>
        
        <div class="member-notice">
          <van-icon name="info-o" /> 开通会员即表示同意《会员服务协议》
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const active = ref(2)

const showReadingsPopup = ref(false)
const showMemberPopup = ref(false)
const readings = ref([])

onMounted(() => {
  if (userStore.token) {
    userStore.getUserInfo()
  }
})

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出登录吗？',
    })
    
    userStore.logout()
    showToast('已退出登录')
  } catch (err) {
    // 用户取消
  }
}

const showReadings = () => {
  showReadingsPopup.value = true
  // TODO: 获取占卜记录
  readings.value = []
}

const showOrders = () => {
  showToast('订单功能开发中')
}

const showMember = () => {
  showMemberPopup.value = true
}

const showSettings = () => {
  showToast('设置功能开发中')
}

const showHelp = () => {
  showToast('帮助功能开发中')
}

const viewReading = (reading) => {
  router.push(`/tarot/reading/${reading.id}`)
}

const buyMember = (days) => {
  showToast(`购买${days}天会员`)
}

const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.user {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.not-login {
  padding: 120px 20px;
  text-align: center;
}

.not-login .icon {
  font-size: 100px;
  margin-bottom: 30px;
}

.not-login .text {
  font-size: 18px;
  color: #999;
  margin-bottom: 40px;
}

.logged-in .header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px 20px 40px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.logged-in .avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logged-in .nickname {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
}

.logged-in .member-badge {
  margin-bottom: 20px;
}

.logged-in .stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.logged-in .stat-item {
  text-align: center;
}

.logged-in .stat-item .value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.logged-in .stat-item .label {
  font-size: 12px;
  opacity: 0.9;
}

.menu-group {
  margin-bottom: 20px;
}

.logout {
  padding: 20px;
}

/* 弹窗内容 */
.popup-content {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.empty {
  padding: 40px 0;
}

.readings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reading-item {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
}

.reading-question {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.reading-time {
  font-size: 12px;
  color: #999;
}

/* 会员卡片 */
.member-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.member-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  position: relative;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.member-card.recommend {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.member-card .badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 12px;
}

.member-card .duration {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.member-card .price {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 15px;
}

.member-card .price .original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.member-card .benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.member-notice {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 10px 0;
}
</style>
