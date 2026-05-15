<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
    <div class="flex flex-column align-items-center justify-content-center" style="height: 80vh; gap: 1rem">
        <i class="pi pi-exclamation-circle text-color-secondary" style="font-size: 4rem"></i>
        <h2 class="m-0">404 — Page not found</h2>
        <pv-button label="Go back" icon="pi pi-arrow-left" @click="router.back()" />
    </div>
</template>
