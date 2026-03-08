import request from '@/utils/request'

export const pointsApi = {
  // 购买积分
  buy(packageId) {
    return request.post('/points/buy', { packageId })
  },
  
  // 获取积分包列表
  getPackages() {
    return request.get('/points/packages')
  }
}
