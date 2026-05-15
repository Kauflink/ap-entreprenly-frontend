<script setup>
import { onMounted } from 'vue'
import useProfileStore from '@/profile/application/profile.store.js'

const profileStore = useProfileStore()

onMounted(() => {
    profileStore.loadProfile()
})
</script>

<template>
    <pv-toast />
    <pv-confirm-dialog />
    <router-view />
</template>
