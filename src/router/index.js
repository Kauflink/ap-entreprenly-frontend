import { createRouter, createWebHistory } from 'vue-router'
import salesRoutes from '@/sales/presentation/sales-routes.js'
import subscriptionRoutes from '@/subscription/presentation/subscription-routes.js'
import chatbotRoutes from '@/chatbot/presentation/chatbot-routes.js'

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
                ...salesRoutes,
                ...subscriptionRoutes,
                ...chatbotRoutes
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
