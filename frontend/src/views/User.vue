<template>
  <div class="user">
    <div v-if="!userStore.token" class="not-login">
      <div class="icon">👤</div>
      <div class="text">登录后查看个人信息</div>
      <van-button type="primary" round to="/login">立即登录</van-button>
    </div>

    <div v-else class="logged-in">
      <div class="header">
        <div class="avatar">{{ userStore.userInfo?.nickname?.charAt(0) || '神' }}</div>
        <div class="nickname">{{ userStore.userInfo?.nickname || '神秘用户' }}</div>
        <div class="member" v-if="userStore.isMember">
          <van-tag type="warning">会员</van-tag>
        </div>
      </div>

      <van-cell-group inset>
        <van-cell title="我的占卜记录" is-link />
        <van-cell title="我的订单" is-link />
        <van-cell title="会员中心" is-link />
        <van-cell title="设置" is-link />
      </van-cell-group>

      <div class="logout">
        <van-button block plain type="danger" @click="logout">退出登录</van-button>
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
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const active = ref(2)

onMounted(() => {
  if (userStore.token) {
    userStore.getUserInfo()
  }
})

const logout = () => {
  userStore.logout()
  showToast('已退出登录')
}
</script>

<style scoped>
.user {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.not-login {
  padding: 100px 20px;
  text-align: center;
}

.not-login .icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.not-login .text {
  font-size: 16px;
  color: #999;
  margin-bottom: 30px;
}

.logged-in .header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.logged-in .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.logged-in .nickname {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.logout {
  padding: 20px;
}
</style>
