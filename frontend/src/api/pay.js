import request from '@/utils/request'

export const payApi = {
  // 创建支付订单
  create(orderId, payMethod = 'wechat') {
    return request.post('/pay/create', { orderId, payMethod })
  },
  
  // 模拟支付成功（测试环境）
  mockSuccess(orderId) {
    return request.post('/pay/mock-success', { orderId })
  },
  
  // 查询订单状态
  getStatus(orderId) {
    return request.get(`/pay/status/${orderId}`)
  }
}
