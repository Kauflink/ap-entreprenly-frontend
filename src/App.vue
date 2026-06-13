<script setup>
import useProfileStore from '@/profile/application/profile.store.js'

// Instantiate the profile store at the app root so it reacts to auth changes
// (loads on login, resets on logout) across the whole session.
useProfileStore()
</script>

<template>
    <pv-toast />
    <pv-confirm-dialog />
    <router-view />
</template>
