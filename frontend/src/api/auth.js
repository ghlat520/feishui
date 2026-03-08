import request from '@/utils/request'

export const authApi = {
  // 手机号登录
  phoneLogin(data) {
    return request.post('/auth/phone-login', data)
  },
  
  // 发送验证码
  sendCode(phone) {
    return request.post('/auth/send-code', { phone })
  },
  
  // 验证token
  verify() {
    return request.get('/auth/verify')
  }
}
