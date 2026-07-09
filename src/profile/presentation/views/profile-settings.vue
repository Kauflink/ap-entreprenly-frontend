<script setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { preferences } = storeToRefs(profileStore)

const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' }
]

function onLanguageChange(event) {
    profileStore.updatePreferences({ language: event.target.value })
}
</script>

<template>
    <div class="settings-page">
        <header class="page-header">
            <h1 class="page-title">{{ t('profile.page.title') }}</h1>
            <p class="page-sub">{{ t('profile.page.subtitle') }}</p>
        </header>

        <div class="card">
            <h2 class="card__title">{{ t('profile.preferences.title') }}</h2>

            <div class="field">
                <label for="language" class="field__label">
                    {{ t('profile.preferences.language') }}
                </label>
                <select
                    id="language"
                    :value="preferences.language"
                    class="field__select"
                    @change="onLanguageChange"
                >
                    <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                        {{ lang.label }}
                    </option>
                </select>
                <p class="field__hint">{{ t('profile.preferences.languageHint') }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.page-title {
    margin: 0;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    font-weight: 700;
    color: var(--color-text-primary);
}

.page-sub {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
}

.card {
    background: var(--color-card-bg, #fff);
    border: 1px solid var(--color-card-border, #e5e7eb);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 480px;
}

.card__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.field__label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.field__select {
    border: 1px solid var(--color-card-border, #e5e7eb);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    background: var(--color-card-bg, #fff);
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}

.field__select:focus {
    border-color: #f97316;
}

.field__hint {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
}
</style>
