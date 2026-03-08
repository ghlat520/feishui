import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant组件库
import {
  Button,
  Cell,
  CellGroup,
  Field,
  Tabbar,
  TabbarItem,
  Step,
  Steps,
  Radio,
  RadioGroup,
  Toast
} from 'vant'

// Vant样式
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

// 注册Vant组件
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Field)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Step)
app.use(Steps)
app.use(Radio)
app.use(RadioGroup)
app.use(Toast)

app.use(pinia)
app.use(router)

app.mount('#app')
