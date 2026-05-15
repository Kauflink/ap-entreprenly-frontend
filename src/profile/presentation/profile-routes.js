const profileRoutes = [
    {
        path: 'profile',
        name: 'profile',
        component: () => import('@/profile/presentation/views/profile-page.vue'),
        meta: { titleKey: 'pages.profile' }
    }
]

export default profileRoutes
