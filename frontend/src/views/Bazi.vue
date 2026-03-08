<template>
  <div class="bazi">
    <div class="header">
      <h2>八字测算</h2>
      <p>解读你的命运密码</p>
    </div>

    <div class="form-container">
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
          @click="calculate"
        >
          开始测算
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
import { showToast } from 'vant'

const active = ref(1)
const birthDate = ref('')
const birthTime = ref('')
const gender = ref(1)
const loading = ref(false)
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const selectedDate = ref(['2000', '01', '01'])

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

const calculate = () => {
  if (!birthDate.value) {
    showToast('请选择出生日期')
    return
  }

  if (!birthTime.value) {
    showToast('请选择出生时辰')
    return
  }

  loading.value = true

  setTimeout(() => {
    showToast('功能开发中，敬请期待')
    loading.value = false
  }, 1000)
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
  font-size: 24px;
  margin-bottom: 10px;
}

.header p {
  font-size: 14px;
  opacity: 0.9;
}

.form-container {
  padding: 20px;
}

.submit-btn {
  margin-top: 30px;
}
</style>
