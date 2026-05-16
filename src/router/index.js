import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import i18n from '@/i18n.js'
import salesRoutes from '@/sales/presentation/sales-routes.js'
import subscriptionRoutes from '@/subscription/presentation/subscription-routes.js'
import chatbotRoutes from '@/chatbot/presentation/chatbot-routes.js'
import profileRoutes from '@/profile/presentation/profile-routes.js'
import inventoryRoutes from "@/inventory/presentation/inventory-routes.js";
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
                { path: 'home', name: 'home', component: () => import('@/shared/presentation/views/home.vue'), meta: { titleKey: 'pages.home' } },
                { path: 'help', name: 'help', component: () => import('@/shared/presentation/views/ayuda.vue'), meta: { titleKey: 'pages.help' } },
                ...salesRoutes,
                ...subscriptionRoutes,
                ...chatbotRoutes,
                ...inventoryRoutes,
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

function applyTitle(route) {
    const key = route?.meta?.titleKey
    if (key) document.title = `${i18n.global.t(key)} | Entreprenly`
}

router.beforeEach((to) => { applyTitle(to) })

watch(i18n.global.locale, () => applyTitle(router.currentRoute.value))

export default router
