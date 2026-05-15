<script setup>
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { preferences } = storeToRefs(profileStore)

const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' }
]

const timezones = [
    'America/Lima (UTC-05:00)',
    'America/Bogota (UTC-05:00)',
    'America/Mexico_City (UTC-06:00)',
    'America/Sao_Paulo (UTC-03:00)',
    'Europe/Madrid (UTC+01:00)'
]

const currencies = [
    { code: 'PEN', label: 'S/ Sol (PEN)' },
    { code: 'USD', label: '$ Dollar (USD)' }
]

const form = reactive({
    language: preferences.value.language,
    timezone: preferences.value.timezone,
    theme: preferences.value.theme,
    currency: preferences.value.currency
})

watch(preferences, current => {
    form.language = current.language
    form.timezone = current.timezone
    form.theme = current.theme
    form.currency = current.currency
}, { deep: true })

function onLanguageChange(event) {
    const language = event.target.value
    form.language = language
    profileStore.updatePreferences({ language })
}

function onTimezoneChange(event) {
    const timezone = event.target.value
    form.timezone = timezone
    profileStore.updatePreferences({ timezone })
}

function onCurrencyChange(event) {
    const currency = event.target.value
    form.currency = currency
    profileStore.updatePreferences({ currency })
}

function setTheme(theme) {
    form.theme = theme
    profileStore.updatePreferences({ theme })
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.preferences.title') }}</h2>

        <form @submit.prevent>
            <div class="field">
                <label for="language" class="field__label">
                    {{ t('profile.preferences.fields.language.label') }}
                </label>
                <select
                    id="language"
                    :value="form.language"
                    class="field__select"
                    @change="onLanguageChange"
                >
                    <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                        {{ lang.label }}
                    </option>
                </select>
            </div>

            <div class="field">
                <label for="timezone" class="field__label">
                    {{ t('profile.preferences.fields.timezone.label') }}
                </label>
                <select
                    id="timezone"
                    :value="form.timezone"
                    class="field__select"
                    @change="onTimezoneChange"
                >
                    <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                </select>
            </div>

            <div class="field">
                <label for="currency" class="field__label">
                    {{ t('profile.preferences.fields.currency.label') }}
                </label>
                <select
                    id="currency"
                    :value="form.currency"
                    class="field__select"
                    @change="onCurrencyChange"
                >
                    <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.label }}</option>
                </select>
            </div>

            <div class="field">
                <span id="theme-label" class="field__label">{{ t('profile.preferences.theme.label') }}</span>
                <div class="theme-toggle" role="group" aria-labelledby="theme-label">
                    <button
                        type="button"
                        class="theme-btn"
                        :class="{ 'theme-btn--active': form.theme === 'light' }"
                        :aria-pressed="form.theme === 'light'"
                        @click="setTheme('light')"
                    >
                        {{ t('profile.preferences.theme.light') }}
                    </button>
                    <button
                        type="button"
                        class="theme-btn"
                        :class="{ 'theme-btn--active': form.theme === 'dark' }"
                        :aria-pressed="form.theme === 'dark'"
                        @click="setTheme('dark')"
                    >
                        {{ t('profile.preferences.theme.dark') }}
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(8px, 1.11dvh, 12px) 24px;
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 0.93dvh, 10px);
}

.card__title {
    font-weight: 800;
    font-size: clamp(13px, 1.48dvh, 16px);
    color: var(--color-text-primary);
    margin: 0;
    text-align: left;
}

form {
    display: flex;
    flex-direction: column;
    gap: clamp(5px, 0.74dvh, 8px);
    flex: 1;
    justify-content: center;
}

.field {
    display: flex;
    flex-direction: column;
    gap: clamp(3px, 0.55dvh, 6px);
}

.field__label {
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-label-accent);
}

.field__select {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    padding: clamp(5px, 0.65dvh, 7px) 20px;
    font-weight: 500;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-text-secondary);
    width: 100%;
    box-sizing: border-box;
    appearance: none;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}

.field__select:focus {
    border-color: var(--color-primary);
}

.theme-toggle {
    display: flex;
    gap: 12px;
}

.theme-btn {
    flex: 1;
    background: var(--color-card-bg);
    border: 1px solid var(--color-theme-btn-border);
    border-radius: 25px;
    padding: clamp(5px, 0.74dvh, 8px) 12px;
    font-family: 'Reddit Sans', sans-serif;
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    line-height: 1.3;
    color: var(--color-label-accent);
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    text-align: center;
}

.theme-btn--active {
    background: var(--color-theme-btn-active-bg);
    border-color: var(--color-theme-btn-active-border);
}

.theme-btn--inactive {
    background: var(--color-card-bg);
    border-color: var(--color-theme-btn-border);
}

.theme-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
</style>
