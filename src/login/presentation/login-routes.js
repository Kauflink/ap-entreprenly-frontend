export default [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/login/presentation/views/login-page.vue'),
        meta: { titleKey: 'pages.login', publicOnly: true }
    }
]
