export default [
    {
        path: '/register',
        name: 'register',
        component: () => import('@/register/presentation/views/register-page.vue'),
        meta: { titleKey: 'pages.register', publicOnly: true }
    }
]
