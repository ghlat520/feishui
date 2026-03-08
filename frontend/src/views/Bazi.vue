<template>
  <div class="bazi">
    <div class="header">
      <h2>🔮 八字测算</h2>
      <p>解读你的命运密码</p>
    </div>

    <!-- 表单 -->
    <div v-if="!result" class="form-container">
      <van-cell-group inset>
        <van-field
          v-model="birthDate"
          is-link
          readonly
          label="出生日期"
          placeholder="请选择"
          @click="showDatePicker = true"
        />

        <van-field
          v-model="birthTime"
          is-link
          readonly
          label="出生时辰"
          placeholder="请选择"
          @click="showTimePicker = true"
        />

        <van-field name="radio" label="性别">
          <template #input>
            <van-radio-group v-model="gender" direction="horizontal">
              <van-radio :name="1">男</van-radio>
              <van-radio :name="2">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-btn">
        <van-button
          type="primary"
          block
          round
          :loading="loading"
          :disabled="!birthDate || !birthTime"
          @click="calculate"
        >
          开始测算
        </van-button>
      </div>
    </div>

    <!-- 测算结果 -->
    <div v-if="result" class="result-container">
      <div class="section">
        <div class="title">🎭 你的八字</div>
        <div class="bazi-info">
          <div class="row">
            <span class="label">年柱：</span>
            <span class="value">{{ result.bazi.year }}</span>
          </div>
          <div class="row">
            <span class="label">月柱：</span>
            <span class="value">{{ result.bazi.month }}</span>
          </div>
          <div class="row">
            <span class="label">日柱：</span>
            <span class="value">{{ result.bazi.day }}</span>
          </div>
          <div class="row">
            <span class="label">时柱：</span>
            <span class="value">{{ result.bazi.hour }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="title">🌟 五行分析</div>
        <div class="wuxing">
          <div
            v-for="(count, element) in result.wuxing"
            :key="element"
            class="element"
            :class="element"
          >
            <div class="name">{{ getElementName(element) }}</div>
            <div class="count">{{ count }}</div>
          </div>
        </div>
        <div class="wuxing-advice">
          {{ result.wuxingAdvice }}
        </div>
      </div>

      <div class="section">
        <div class="title">✨ 命格解读</div>
        <div class="interpretation">{{ result.freeInterpretation }}</div>
      </div>

      <!-- MVP版本：所有内容免费开放 -->
      <div class="section paid-section">
        <div class="title">📖 详细解读</div>

        <div class="detail-item">
          <div class="label">💼 事业运势</div>
          <div class="content">{{ result.detail?.career || '你的事业运势正旺，适合积极进取。建议把握机会，展现自己的能力，有望获得上级的认可和提升机会。' }}</div>
        </div>

        <div class="detail-item">
          <div class="label">💰 财运分析</div>
          <div class="content">{{ result.detail?.wealth || '财运平稳，正财为主。建议稳健理财，避免投机冒险。通过努力工作可以获得稳定的收入增长。' }}</div>
        </div>

        <div class="detail-item">
          <div class="label">💕 婚姻感情</div>
          <div class="content">{{ result.detail?.marriage || '感情运势良好，单身者有望遇到心仪对象，已婚者家庭和睦。建议多参加社交活动，增加遇见缘分的机会。' }}</div>
        </div>

        <div class="detail-item">
          <div class="label">🏥 健康运势</div>
          <div class="content">{{ result.detail?.health || '整体健康状况良好，但需注意作息规律。建议保持良好的生活习惯，适当运动，保持心情愉悦。' }}</div>
        </div>
      </div>

      <div class="action-buttons">
        <van-button
          plain
          type="primary"
          block
          round
          @click="reset"
        >
          重新测算
        </van-button>
      </div>
    </div>

    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="star-o" to="/tarot">占卜</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 时辰选择器 -->
    <van-popup v-model:show="showTimePicker" position="bottom">
      <van-picker
        :columns="timeOptions"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { baziApi } from '@/api/bazi'

const active = ref(1)
const birthDate = ref('')
const birthTime = ref('')
const gender = ref(1)
const loading = ref(false)
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const selectedDate = ref(['2000', '01', '01'])

const result = ref(null)
const readingId = ref('')

const timeOptions = [
  '子时 (23:00-01:00)',
  '丑时 (01:00-03:00)',
  '寅时 (03:00-05:00)',
  '卯时 (05:00-07:00)',
  '辰时 (07:00-09:00)',
  '巳时 (09:00-11:00)',
  '午时 (11:00-13:00)',
  '未时 (13:00-15:00)',
  '申时 (15:00-17:00)',
  '酉时 (17:00-19:00)',
  '戌时 (19:00-21:00)',
  '亥时 (21:00-23:00)'
]

const onDateConfirm = ({ selectedValues }) => {
  birthDate.value = selectedValues.join('-')
  showDatePicker.value = false
}

const onTimeConfirm = ({ selectedOptions }) => {
  birthTime.value = selectedOptions[0]?.text || ''
  showTimePicker.value = false
}

const calculate = async () => {
  if (!birthDate.value) {
    showToast('请选择出生日期')
    return
  }

  if (!birthTime.value) {
    showToast('请选择出生时辰')
    return
  }

  loading.value = true

  try {
    showLoadingToast({
      message: '正在测算...',
      forbidClick: true,
    })

    const res = await baziApi.calculate({
      birthDate: birthDate.value,
      birthTime: birthTime.value,
      gender: gender.value
    })

    closeToast()

    if (res.code === 200) {
      result.value = res.data
      readingId.value = res.data.readingId
    }
  } catch (err) {
    closeToast()
    showToast('测算失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  result.value = null
  readingId.value = ''
  birthDate.value = ''
  birthTime.value = ''
  gender.value = 1
}

const getElementName = (element) => {
  const map = {
    gold: '金',
    wood: '木',
    water: '水',
    fire: '火',
    earth: '土'
  }
  return map[element] || element
}
</script>

<style scoped>
.bazi {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.header h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.form-container {
  padding: 20px;
}

.submit-btn {
  margin-top: 20px;
}

/* 结果页面 */
.result-container {
  padding: 20px;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
}

.section .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* 八字信息 */
.bazi-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.bazi-info .row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.bazi-info .label {
  color: #999;
}

.bazi-info .value {
  font-weight: bold;
  color: #667eea;
}

/* 五行分析 */
.wuxing {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.wuxing .element {
  text-align: center;
  padding: 15px 10px;
  border-radius: 10px;
  min-width: 50px;
}

.wuxing .element.gold {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #9e9e9e;
}

.wuxing .element.wood {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
}

.wuxing .element.water {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
  color: white;
}

.wuxing .element.fire {
  background: linear-gradient(135deg, #ff8a65 0%, #ff7043 100%);
  color: white;
}

.wuxing .element.earth {
  background: linear-gradient(135deg, #a1887f 0%, #8d6e63 100%);
  color: white;
}

.wuxing .name {
  font-size: 18px;
  margin-bottom: 5px;
}

.wuxing .count {
  font-size: 24px;
  font-weight: bold;
}

.wuxing-advice {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding: 10px;
  background: #f0f5ff;
  border-radius: 8px;
}

.interpretation {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
}

/* 详细解读（免费） */
.paid-section .detail-item {
  margin-bottom: 20px;
}

.paid-section .label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.paid-section .content {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.action-buttons {
  margin-top: 20px;
}
</style>
