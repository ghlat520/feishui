import request from '@/utils/request'

export const baziApi = {
  // 八字测算
  calculate(data) {
    return request.post('/bazi/calculate', data)
  },
  
  // 获取测算详情
  getReading(id) {
    return request.get(`/bazi/${id}`)
  },
  
  // 解锁详细解读
  unlock(readingId, payMethod = 'wechat') {
    return request.post('/bazi/unlock', { readingId, payMethod })
  }
}
