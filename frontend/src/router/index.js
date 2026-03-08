import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'AI命运守护神' }
  },
  {
    path: '/tarot',
    name: 'Tarot',
    component: () => import('@/views/Tarot.vue'),
    meta: { title: '塔罗占卜', requiresAuth: true }
  },
  {
    path: '/tarot/reading/:id',
    name: 'TarotReading',
    component: () => import('@/views/TarotReading.vue'),
    meta: { title: '塔罗解读', requiresAuth: true }
  },
  {
    path: '/zodiac',
    name: 'Zodiac',
    component: () => import('@/views/Zodiac.vue'),
    meta: { title: '星座运势' }
  },
  {
    path: '/bazi',
    name: 'Bazi',
    component: () => import('@/views/Bazi.vue'),
    meta: { title: '八字测算' }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/User.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'AI命运守护神'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
