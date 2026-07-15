import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../HomePage.vue'
import BoardPage from '../board/BoardPage.vue'
import PostCreatePage from '../post/PostCreatePage.vue'
import CalendarPage from '../components/CalendarPage.vue'
import ChatbotPage from '../components/ChatbotPage.vue'
import PostEditPage from '../post/PostEditPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/board', name: 'Board', component: BoardPage },
  { path: '/board/write', name: 'PostCreate', component: PostCreatePage },
  { path: '/calendar', name: 'Calendar', component: CalendarPage },
  { path: '/chat', name: 'Chatbot', component: ChatbotPage },
  { path: '/board/:id/edit', name: 'PostEdit', component: PostEditPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router