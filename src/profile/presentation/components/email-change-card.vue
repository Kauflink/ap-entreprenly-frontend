<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref('')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValid = computed(() => emailPattern.test(email.value))

function onSubmit() {
    if (!isValid.value) return
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
                    <button type="submit" class="btn-verify" :disabled="!isValid">
                        {{ t('profile.emailChange.verifyAction') }}
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
}

form {
    display: flex;
    flex-direction: column;
    gap: clamp(5px, 0.74dvh, 8px);
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
    padding: clamp(5px, 0.65dvh, 7px) 20px;
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
    padding: clamp(5px, 0.65dvh, 7px) 24px;
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
</style>
