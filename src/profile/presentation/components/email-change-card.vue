<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AuthApi } from '@/auth/infrastructure/auth-api.js'
import useAuthStore from '@/auth/application/auth.store.js'

const { t } = useI18n()
const authApi = new AuthApi()
const authStore = useAuthStore()

const email = ref('')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValid = computed(() => emailPattern.test(email.value))

/** Submission feedback: 'idle' | 'pending' | 'success' | 'error'. */
const status = ref('idle')

function onSubmit() {
    if (!isValid.value || status.value === 'pending') return
    status.value = 'pending'
    authApi.changeEmail(email.value)
        .then(() => {
            // The JWT subject is now stale; force a fresh sign-in with the new email.
            status.value = 'success'
            email.value = ''
            setTimeout(() => authStore.logout(), 2500)
        })
        .catch(() => {
            status.value = 'error'
        })
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.emailChange.title') }}</h2>

        <form @submit.prevent="onSubmit">
            <div class="field">
                <label for="newEmail" class="field__label">
                    {{ t('profile.emailChange.fields.email.label') }}
                </label>
                <div class="field__row">
                    <input
                        id="newEmail"
                        v-model="email"
                        type="email"
                        class="field__input"
                        :placeholder="t('profile.emailChange.fields.email.placeholder')"
                        autocomplete="email"
                    />
                    <button type="submit" class="btn-verify" :disabled="!isValid || status === 'pending'">
                        {{ t('profile.emailChange.verifyAction') }}
                    </button>
                </div>
                <p v-if="status === 'success'" class="field__success" role="status">
                    {{ t('profile.emailChange.feedback.success') }}
                </p>
                <p v-if="status === 'error'" class="field__error" role="alert">
                    {{ t('profile.emailChange.feedback.error') }}
                </p>
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
    padding: clamp(6px, 0.74dvh, 10px) 24px;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.55dvh, 6px);
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.card__title {
    font-weight: 800;
    font-size: clamp(13px, 1.48dvh, 16px);
    color: var(--color-text-primary);
    margin: 0;
}

form {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
    min-height: 0;
    justify-content: center;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: 0;
}

.field__label {
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    line-height: 1;
    color: var(--color-label-accent);
    margin-bottom: 2px;
}

.field__row {
    display: flex;
    gap: 12px;
    align-items: center;
}

.field__input {
    flex: 1;
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    padding: clamp(3px, 0.46dvh, 6px) 20px;
    font-weight: 500;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.2s;
}

.field__input::placeholder {
    color: var(--color-text-secondary);
}

.field__input:focus {
    border-color: var(--color-primary);
}

.btn-verify {
    background: var(--color-primary);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(3px, 0.46dvh, 6px) 24px;
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-primary-text);
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
}

.btn-verify:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-verify:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.field__success {
    font-size: 11px;
    color: var(--color-primary);
    margin: 4px 0 0;
    padding-left: 12px;
}

.field__error {
    font-size: 11px;
    color: var(--color-danger);
    margin: 4px 0 0;
    padding-left: 12px;
}
</style>
