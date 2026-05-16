<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import useProfileStore from '@/profile/application/profile.store.js'

const profileStore = useProfileStore()
const route = useRoute()

watch(
    () => route.meta.publicOnly,
    publicOnly => {
        if (!publicOnly) profileStore.loadProfile()
    },
    { immediate: true }
)
</script>

<template>
    <pv-toast />
    <pv-confirm-dialog />
    <router-view />
</template>
