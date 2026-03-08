import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const isMember = ref(false)
  
  // 登录
  const login = (tokenValue) => {
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
  }
  
  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    isMember.value = false
    localStorage.removeItem('token')
  }
  
  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return
    
    try {
      const res = await userApi.getProfile()
      if (res.code === 200) {
        userInfo.value = res.data
        isMember.value = res.data.isMember
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }
  
  return {
    token,
    userInfo,
    isMember,
    login,
    logout,
    getUserInfo
  }
})
