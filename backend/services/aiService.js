const axios = require('axios')

class AIService {
  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY
    this.baseURL = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v3/model-api'
  }
  
  /**
   * 调用智谱AI（使用Chat Completions API）
   */
  async call(prompt, temperature = 0.85, maxTokens = 800) {
    try {
      // 使用v4 Chat Completions API
      const v4BaseURL = process.env.ZHIPU_BASE_URL?.replace('/v3/model-api', '/v4') || 'https://open.bigmodel.cn/api/paas/v4'
      
      const response = await axios.post(
        `${v4BaseURL}/chat/completions`,
        {
          model: 'glm-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )
      
      if (response.data?.choices) {
        return response.data.choices[0].message.content
      }
      
      throw new Error('AI响应格式错误')
    } catch (err) {
      console.error('AI调用失败:', err.message)
      throw new Error('AI服务暂时不可用')
    }
  }
  
  /**
   * 生成星座运势
   */
  async generateZodiacFortune(zodiac, date) {
    const zodiacNames = {
      'aries': '白羊座', 'taurus': '金牛座', 'gemini': '双子座',
      'cancer': '巨蟹座', 'leo': '狮子座', 'virgo': '处女座',
      'libra': '天秤座', 'scorpio': '天蝎座', 'sagittarius': '射手座',
      'capricorn': '摩羯座', 'aquarius': '水瓶座', 'pisces': '双鱼座'
    }
    
    const prompt = `你是一位专业的占星师，请为${zodiacNames[zodiac]}生成${date}的运势。

要求：
1. 爱情、事业、财运分数（1-5，随机）
2. 总体概述（50字）
3. 积极正向语言
4. 模糊但有针对性
5. 1-2条建议

JSON格式：
{
  "love": 数字1-5,
  "career": 数字1-5,
  "money": 数字1-5,
  "summary": "概述",
  "detail": {
    "love": "爱情分析",
    "career": "事业分析",
    "money": "财运分析"
  },
  "advice": ["建议1", "建议2"]
}`
    
    try {
      const result = await this.call(prompt, 0.9, 800)
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      
      return JSON.parse(cleaned.trim())
    } catch (err) {
      console.error('生成运势失败:', err)
      return {
        love: 3, career: 3, money: 3,
        summary: '今日运势平稳，适合思考和规划。',
        detail: {
          love: '感情方面保持平常心。',
          career: '工作上保持稳健。',
          money: '财运平稳，适合保守理财。'
        },
        advice: ['保持积极心态', '注意休息']
      }
    }
  }
  
  /**
   * 生成八字性格分析
   */
  async generateBaziCharacter(bazi) {
    const prompt = `你是命理师，根据八字分析性格：

八字：${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}
五行：金${bazi.wuxing.金} 木${bazi.wuxing.木} 水${bazi.wuxing.水} 火${bazi.wuxing.火} 土${bazi.wuxing.土}

分析：
1. 性格（50-80字）
2. 事业方向（30-50字）
3. 财运特点（30-50字）
4. 开运建议（颜色、数字、方位）

JSON格式：
{
  "character": "性格分析",
  "career": "事业方向",
  "wealth": "财运特点",
  "advice": {
    "colors": ["颜色1", "颜色2"],
    "numbers": [数字1, 数字2],
    "directions": ["方位1", "方位2"]
  }
}`
    
    try {
      const result = await this.call(prompt, 0.85, 600)
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      
      return JSON.parse(cleaned.trim())
    } catch (err) {
      console.error('生成八字分析失败:', err)
      return {
        character: '你是一个性格温和、善解人意的人，有着敏锐的洞察力。',
        career: '适合从事需要创造力和沟通能力的工作。',
        wealth: '财运平稳，通过努力工作可获得稳定收入。',
        advice: {
          colors: ['蓝色', '绿色'],
          numbers: [3, 8],
          directions: ['东南', '东方']
        }
      }
    }
  }
}

module.exports = new AIService()
