export default [
    {
        path: 'profile',
        name: 'profile',
        component: () => import('@/profile/presentation/views/profile-settings.vue'),
        meta: { title: 'Perfil' }
    }
]
