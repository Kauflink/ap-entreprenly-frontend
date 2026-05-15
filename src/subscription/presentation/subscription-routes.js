const subscriptionRoutes = [
    {
        path: 'subscription',
        name: 'subscription',
        component: () => import('@/subscription/presentation/views/subscription-page.vue'),
        meta: { title: 'Subscription' }
    }
]

export default subscriptionRoutes
