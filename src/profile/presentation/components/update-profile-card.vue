<script setup>
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const form = reactive({
    firstName: profile.value.firstName,
    lastName: profile.value.lastName
})

watch(() => [profile.value.firstName, profile.value.lastName], ([firstName, lastName]) => {
    form.firstName = firstName
    form.lastName = lastName
})

function isValid() {
    return form.firstName.trim().length >= 2 && form.lastName.trim().length >= 2
}

function onSubmit() {
    if (!isValid()) return
    profileStore.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim()
    })
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.updateProfile.title') }}</h2>

        <form @submit.prevent="onSubmit">
            <div class="field">
                <label for="firstName" class="field__label">
                    {{ t('profile.updateProfile.fields.firstName.label') }}
                </label>
                <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    class="field__input"
                    :placeholder="t('profile.updateProfile.fields.firstName.placeholder')"
                    autocomplete="given-name"
                />
            </div>

            <div class="field">
                <label for="lastName" class="field__label">
                    {{ t('profile.updateProfile.fields.lastName.label') }}
                </label>
                <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    class="field__input"
                    :placeholder="t('profile.updateProfile.fields.lastName.placeholder')"
                    autocomplete="family-name"
                />
            </div>

            <button type="submit" class="btn-primary" :disabled="!isValid()">
                {{ t('profile.updateProfile.saveAction') }}
            </button>
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
    line-height: 1.3;
    color: var(--color-label-accent);
}

.field__input {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    padding: clamp(5px, 0.65dvh, 7px) 20px;
    font-weight: 500;
    font-size: clamp(10px, 1.11dvh, 12px);
    line-height: 1.3;
    color: var(--color-text-primary);
    width: 100%;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
}

.field__input::placeholder {
    color: var(--color-text-secondary);
}

.field__input:focus {
    border-color: var(--color-primary);
}

.btn-primary {
    margin-top: clamp(5px, 0.93dvh, 10px);
    background: var(--color-primary);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(5px, 0.74dvh, 8px) 24px;
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    line-height: 1.3;
    color: var(--color-primary-text);
    cursor: pointer;
    width: 100%;
    transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
