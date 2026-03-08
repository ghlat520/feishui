import request from '@/utils/request'

export const userApi = {
  // 获取用户信息
  getProfile() {
    return request.get('/user/profile')
  },
  
  // 更新用户信息
  updateProfile(data) {
    return request.put('/user/profile', data)
  },
  
  // 获取订单列表
  getOrders(params) {
    return request.get('/user/orders', { params })
  },
  
  // 获取占卜记录
  getReadings(params) {
    return request.get('/user/readings', { params })
  },
  
  // 购买会员
  buyMember(days) {
    return request.post('/user/member/buy', { days })
  }
}
