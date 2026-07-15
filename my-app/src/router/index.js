import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../HomePage.vue'
import BoardPage from '../board/BoardPage.vue'
import PostCreatePage from '../post/PostCreatePage.vue'
import CalendarPage from '../components/CalendarPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/board', name: 'Board', component: BoardPage },
  { path: '/board/write', name: 'PostCreate', component: PostCreatePage },
  { path: '/calendar', name: 'Calendar', component: CalendarPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router