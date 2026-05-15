const salesRoutes = [
    {
        path: 'sales',
        name: 'sales',
        component: () => import('@/sales/presentation/views/sales-page.vue'),
        meta: { titleKey: 'pages.sales' }
    }
]

export default salesRoutes
