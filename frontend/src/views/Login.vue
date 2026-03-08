<template>
  <div class="login">
    <div class="header">
      <div class="logo">🦞 AI命运守护神</div>
      <div class="slogan">登录开启你的命运之旅</div>
    </div>

    <div class="form-container">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
        />
        
        <van-field
          v-model="code"
          type="digit"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-btn">
        <van-button 
          type="primary" 
          block 
          round 
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </van-button>
      </div>

      <div class="tips">
        <p>测试验证码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)

// 发送验证码
const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    const res = await authApi.sendCode(phone.value)
    showToast('验证码已发送')
    
    // 倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    console.error('发送验证码失败:', err)
  }
}

// 登录
const handleLogin = async () => {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }

  if (!code.value || code.value.length !== 6) {
    showToast('请输入验证码')
    return
  }

  loading.value = true

  try {
    const res = await authApi.phoneLogin({
      phone: phone.value,
      code: code.value
    })

    if (res.code === 200) {
      userStore.login(res.data.token)
      showToast('登录成功')
      
      // 跳转到之前的页面或首页
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    }
  } catch (err) {
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  padding: 80px 20px 60px;
  text-align: center;
  color: white;
}

.logo {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.slogan {
  font-size: 14px;
  opacity: 0.9;
}

.form-container {
  padding: 0 20px;
}

.submit-btn {
  margin-top: 30px;
}

.tips {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
