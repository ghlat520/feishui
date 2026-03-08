import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 业务错误
    if (res.code !== 200) {
      // 只在非登录接口显示错误提示
      if (!response.config.url.includes('/auth/')) {
        showToast(res.message || '请求失败')
      }
      
      // 未登录
      if (res.code === 2001 || res.code === 2003) {
        localStorage.removeItem('token')
        // 不要立即跳转，让用户继续操作
        // window.location.href = '/login'
      }
      
      // 返回完整响应，让调用方处理
      return res
    }
    
    return res
  },
  error => {
    console.error('网络错误:', error)
    
    // 网络错误提示
    if (error.message.includes('timeout')) {
      showToast('请求超时，请稍后再试')
    } else if (error.message.includes('Network Error')) {
      showToast('网络连接失败，请检查网络')
    } else {
      showToast('网络错误，请稍后再试')
    }
    
    return Promise.reject(error)
  }
)

export default request
