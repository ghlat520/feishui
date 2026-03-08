import request from '@/utils/request'

export const zodiacApi = {
  // 获取每日运势
  getDaily(name, date) {
    const params = date ? { date } : {}
    return request.get(`/zodiac/${name}/daily`, { params })
  },
  
  // 解锁详细运势
  unlock(zodiac, date, payMethod = 'wechat') {
    return request.post('/zodiac/unlock', { zodiac, date, payMethod })
  }
}
