const axios = require('axios')

class AIService {
  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY
    this.baseURL = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v3/model-api'
  }
  
  /**
   * 调用智谱AI GLM-4模型
   * @param {String} prompt - 提示词
   * @param {Object} options - 配置选项
   */
  async generate(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/glm-4/invoke`,
        {
          prompt,
          temperature: options.temperature || 0.8,
          max_tokens: options.maxTokens || 500,
          top_p: options.topP || 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )
      
      if (response.data && response.data.data && response.data.data.choices) {
        return response.data.data.choices[0].content
      }
      
      throw new Error('AI响应格式错误')
    } catch (err) {
      console.error('智谱AI调用失败:', err.message)
      throw new Error('AI服务暂时不可用')
    }
  }
  
  /**
   * 对话接口
   * @param {Array} messages - 对话历史
   */
  async chat(messages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/glm-4/invoke`,
        {
          messages,
          temperature: 0.9,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )
      
      if (response.data && response.data.data && response.data.data.choices) {
        return response.data.data.choices[0].content
      }
      
      throw new Error('AI响应格式错误')
    } catch (err) {
      console.error('智谱AI对话失败:', err.message)
      throw new Error('AI服务暂时不可用')
    }
  }
  
  /**
   * 生成星座运势
   * @param {String} zodiac - 星座名称
   * @param {String} date - 日期 YYYY-MM-DD
   */
  async generateZodiacFortune(zodiac, date) {
    const zodiacNames = {
      'aries': '白羊座', 'taurus': '金牛座', 'gemini': '双子座',
      'cancer': '巨蟹座', 'leo': '狮子座', 'virgo': '处女座',
      'libra': '天秤座', 'scorpio': '天蝎座', 'sagittarius': '射手座',
      'capricorn': '摩羯座', 'aquarius': '水瓶座', 'pisces': '双鱼座'
    }
    
    const prompt = `你是一位专业的占星师，请为${zodiacNames[zodiac]}生成${date}的运势分析。

要求：
1. 爱情、事业、财运三个维度，每个1-5分（随机生成）
2. 总体运势概述（50字左右）
3. 使用积极正向的语言
4. 模糊但有针对性（巴纳姆效应）
5. 给出1-2个具体可执行的建议

请严格按照以下JSON格式返回（不要包含markdown代码块）：
{
  "love": 随机1-5的数字,
  "career": 随机1-5的数字,
  "money": 随机1-5的数字,
  "summary": "总体运势概述",
  "detail": {
    "love": "爱情运势详细分析（30-50字）",
    "career": "事业运势详细分析（30-50字）",
    "money": "财运详细分析（30-50字）"
  },
  "advice": ["建议1", "建议2"]
}`

    try {
      const result = await this.generate(prompt, { temperature: 0.9, maxTokens: 800 })
      
      // 清理可能的markdown代码块标记
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7)
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3)
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
      cleaned = cleaned.trim()
      
      return JSON.parse(cleaned)
    } catch (err) {
      console.error('生成星座运势失败:', err)
      // 返回默认数据
      return {
        love: 3,
        career: 3,
        money: 3,
        summary: '今日运势平稳，适合思考和规划未来。',
        detail: {
          love: '感情方面保持平常心，顺其自然即可。',
          career: '工作上保持稳健，不宜冒进。',
          money: '财运平稳，适合保守理财。'
        },
        advice: ['保持积极心态', '注意休息']
      }
    }
  }
  
  /**
   * 塔罗牌解读
   * @param {Array} cards - 抽取的牌
   * @param {String} question - 用户问题
   */
  async interpretTarot(cards, question) {
    const cardsInfo = cards.map(c => 
      `${c.nameZh}${c.isReversed ? '（逆位）' : ''} - ${c.position}`
    ).join('、')
    
    const prompt = `你是一位专业的塔罗师，用户的问题是："${question}"

抽取的牌：${cardsInfo}

请给出专业、温暖、有启发性的解读：

要求：
1. 积极偏向，多说好话
2. 使用模糊语言（可能、有机会）
3. 给出具体可执行的建议
4. 长度200-300字

格式：
{
  "interpretation": "完整解读（200-300字）",
  "summary": "一句话总结（20字以内）"
}`

    try {
      const result = await this.generate(prompt, { temperature: 0.85, maxTokens: 600 })
      
      // 清理可能的markdown代码块标记
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7)
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3)
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
      cleaned = cleaned.trim()
      
      return JSON.parse(cleaned)
    } catch (err) {
      console.error('塔罗解读失败:', err)
      return {
        interpretation: '牌面显示，你正处在一个重要的转折点。过去的经历塑造了现在的你，当下需要做出重要的选择，而未来充满了无限可能。建议保持开放的心态，相信自己的直觉，勇敢地迈出下一步。',
        summary: '转折点，机遇与挑战并存'
      }
    }
  }
  
  /**
   * 生成八字性格分析
   * @param {Object} bazi - 八字信息
   */
  async generateBaziCharacter(bazi) {
    const prompt = `你是一位专业的命理师，请根据以下八字信息分析性格特点：

八字：${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}
五行：金${bazi.wuxing.金} 木${bazi.wuxing.木} 水${bazi.wuxing.水} 火${bazi.wuxing.火} 土${bazi.wuxing.土}
生肖：${bazi.shengxiao}

请分析：
1. 性格特点（50-80字）
2. 事业方向（30-50字）
3. 财运特点（30-50字）
4. 开运建议（颜色、数字、方位）

格式：
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
      const result = await this.generate(prompt, { temperature: 0.85, maxTokens: 600 })
      
      // 清理可能的markdown代码块标记
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7)
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3)
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
      cleaned = cleaned.trim()
      
      return JSON.parse(cleaned)
    } catch (err) {
      console.error('八字分析失败:', err)
      return {
        character: '你是一个性格温和、善解人意的人，有着敏锐的洞察力和丰富的想象力。',
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
