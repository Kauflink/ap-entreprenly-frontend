<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <div class="coming-soon">
        <span class="material-icons coming-soon__icon">construction</span>
        <h2 class="coming-soon__title">{{ t('comingSoon.title') }}</h2>
        <p class="coming-soon__subtitle">{{ t('comingSoon.subtitle') }}</p>
    </div>
</template>

<style scoped>
.coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 60vh;
    color: var(--color-text-secondary, #666);
    text-align: center;
}
.coming-soon__icon {
    font-size: 64px;
    color: var(--color-primary, #d97706);
    opacity: 0.6;
}
.coming-soon__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary, #1a1a1a);
}
.coming-soon__subtitle {
    margin: 0;
    font-size: 1rem;
}
</style>
