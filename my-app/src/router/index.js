import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '../board/BoardPage.vue'
import PostCreatePage from '../post/PostCreatePage.vue'

const routes = [
  { path: '/', redirect: '/board' },
  { path: '/board', name: 'Board', component: BoardPage },
  { path: '/board/write', name: 'PostCreate', component: PostCreatePage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router