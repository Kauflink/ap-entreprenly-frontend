import { createRouter, createWebHistory } from 'vue-router'
import Home from '@chatbot-bc/shared/presentation/views/home.vue'
import chatbotRoutes from '@chatbot-bc/chatbot/presentation/chatbot-routes.js'

const ayuda        = () => import('@chatbot-bc/shared/presentation/views/ayuda.vue')
const pageNotFound = () => import('@chatbot-bc/shared/presentation/views/page-not-found.vue')

const routes = [
  { path: '/home',  name: 'home',  component: Home,  meta: { title: 'Inicio' } },
  { path: '/ayuda', name: 'ayuda', component: ayuda, meta: { title: 'Ayuda'  } },
  ...chatbotRoutes.map(r => ({ ...r, path: `/${r.path}` })),
  { path: '/', redirect: '/home' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Página no encontrada' } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  document.title = `Entreprenly - ${to.meta['title'] ?? ''}`
})

export default router
