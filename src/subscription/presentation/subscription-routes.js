const subscriptionRoutes = [
    {
        path: 'subscription',
        name: 'subscription',
        component: () => import('@/subscription/presentation/views/subscription-page.vue'),
        meta: { titleKey: 'pages.subscription' }
    }
]

export default subscriptionRoutes
