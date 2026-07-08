<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const phone = ref(profile.value.phone ?? '')
const phonePattern = /^\+?[\d\s\-()]{7,20}$/
const isValid = computed(() => phonePattern.test(phone.value))

/** Submission feedback: 'idle' | 'success'. */
const status = ref('idle')

watch(() => profile.value.phone, value => {
    phone.value = value ?? ''
})

function onSubmit() {
    if (!isValid.value) return
    profileStore.updateProfile({ phone: phone.value })
    status.value = 'success'
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.phoneVerify.title') }}</h2>

        <form @submit.prevent="onSubmit">
            <div class="field">
                <label for="phone" class="field__label">
                    {{ t('profile.phoneVerify.fields.phone.label') }}
                </label>
                <div class="field__row">
                    <input
                        id="phone"
                        v-model="phone"
                        type="tel"
                        class="field__input"
                        :placeholder="t('profile.phoneVerify.fields.phone.placeholder')"
                        autocomplete="tel"
                    />
                    <button type="submit" class="btn-verify" :disabled="!isValid">
                        {{ t('profile.phoneVerify.verifyAction') }}
                    </button>
                </div>
                <p v-if="status === 'success'" class="field__success" role="status">
                    {{ t('profile.phoneVerify.feedback.success') }}
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
    padding: clamp(8px, 1.11dvh, 12px) 24px;
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 0.93dvh, 10px);
    height: 100%;
    box-sizing: border-box;
}

.card__title {
    font-weight: 800;
    font-size: clamp(13px, 1.48dvh, 16px);
    line-height: 1.3;
    color: var(--color-text-primary);
    margin: 0;
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

.field__success {
    font-size: 11px;
    color: var(--color-primary);
    margin: 4px 0 0;
    padding-left: 12px;
}
</style>
