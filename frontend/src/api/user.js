import request from '@/utils/request'

export const userApi = {
  // 获取用户信息
  getProfile() {
    return request.get('/user/profile')
  },
  
  // 更新用户信息
  updateProfile(data) {
    return request.put('/user/profile', data)
  }
}
