const salesRoutes = [
    {
        path: 'sales',
        name: 'sales',
        component: () => import('@/sales/presentation/views/sales-page.vue'),
        meta: { title: 'Sales' }
    }
]

export default salesRoutes
