import { createRouter, createWebHistory } from 'vue-router'
import salesRoutes from '@/sales/presentation/sales-routes.js'
import subscriptionRoutes from '@/subscription/presentation/subscription-routes.js'
import chatbotRoutes from '@/chatbot/presentation/chatbot-routes.js'
import profileRoutes from '@/profile/presentation/profile-routes.js'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/sales'
        },
        {
            path: '/',
            component: () => import('@/shared/presentation/components/dashboard-layout.vue'),
            children: [
                { path: 'home', name: 'home', component: () => import('@/shared/presentation/views/home.vue'), meta: { title: 'Inicio' } },
                { path: 'help', name: 'help', component: () => import('@/shared/presentation/views/ayuda.vue'), meta: { title: 'Ayuda' } },
                { path: 'products', name: 'products', component: () => import('@/shared/presentation/views/coming-soon.vue'), meta: { title: 'Productos' } },
                { path: 'lots', name: 'lots', component: () => import('@/shared/presentation/views/coming-soon.vue'), meta: { title: 'Lotes' } },
                ...salesRoutes,
                ...subscriptionRoutes,
                ...chatbotRoutes,
                ...profileRoutes
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/shared/presentation/views/page-not-found.vue')
        }
    ]
})

router.beforeEach((to) => {
    if (to.meta?.title) document.title = `${to.meta.title} | Entreprenly`
})

export default router
