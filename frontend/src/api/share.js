import request from '@/utils/request'

export const shareApi = {
  // 分享奖励（增加免费额度）
  getReward(platform = 'wechat') {
    return request.post('/share/reward', { platform })
  },
  
  // 检查今天是否已分享
  checkStatus() {
    return request.get('/share/check')
  }
}
