const profileRoutes = [
    {
        path: 'profile',
        name: 'profile',
        component: () => import('@/profile/presentation/views/profile-page.vue'),
        meta: { title: 'Perfil' }
    }
]

export default profileRoutes
