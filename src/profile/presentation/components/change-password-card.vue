<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const confirmDirty = ref(false)

const passwordsMatch = computed(() =>
    form.newPassword === form.confirmPassword
)

const mismatch = computed(() =>
    confirmDirty.value && form.newPassword !== '' && !passwordsMatch.value
)

const isValid = computed(() =>
    form.currentPassword.length >= 8
    && form.newPassword.length >= 8
    && form.confirmPassword.length > 0
    && passwordsMatch.value
)

function onConfirmInput() {
    confirmDirty.value = true
}

function onSubmit() {
    if (!isValid.value) return
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    confirmDirty.value = false
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.changePassword.title') }}</h2>

        <form @submit.prevent="onSubmit">
            <div class="field">
                <label for="currentPassword" class="field__label">
                    {{ t('profile.changePassword.fields.current.label') }}
                </label>
                <div class="field__input-wrap">
                    <input
                        id="currentPassword"
                        v-model="form.currentPassword"
                        :type="showCurrent ? 'text' : 'password'"
                        class="field__input"
                        :placeholder="t('profile.changePassword.fields.current.placeholder')"
                        autocomplete="current-password"
                    />
                    <button
                        type="button"
                        class="field__toggle"
                        :aria-label="t(showCurrent ? 'profile.changePassword.fields.current.hideLabel' : 'profile.changePassword.fields.current.showLabel')"
                        @click="showCurrent = !showCurrent"
                    >
                        <span class="material-icons">{{ showCurrent ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                </div>
            </div>

            <div class="field">
                <label for="newPassword" class="field__label">
                    {{ t('profile.changePassword.fields.new.label') }}
                </label>
                <div class="field__input-wrap">
                    <input
                        id="newPassword"
                        v-model="form.newPassword"
                        :type="showNew ? 'text' : 'password'"
                        class="field__input"
                        :placeholder="t('profile.changePassword.fields.new.placeholder')"
                        autocomplete="new-password"
                    />
                    <button
                        type="button"
                        class="field__toggle"
                        :aria-label="t(showNew ? 'profile.changePassword.fields.new.hideLabel' : 'profile.changePassword.fields.new.showLabel')"
                        @click="showNew = !showNew"
                    >
                        <span class="material-icons">{{ showNew ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                </div>
            </div>

            <div class="field">
                <label for="confirmPassword" class="field__label">
                    {{ t('profile.changePassword.fields.confirm.label') }}
                </label>
                <div class="field__input-wrap">
                    <input
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        :type="showConfirm ? 'text' : 'password'"
                        class="field__input"
                        :class="{ 'field__input--error': mismatch }"
                        :placeholder="t('profile.changePassword.fields.confirm.placeholder')"
                        autocomplete="new-password"
                        @input="onConfirmInput"
                    />
                    <button
                        type="button"
                        class="field__toggle"
                        :aria-label="t(showConfirm ? 'profile.changePassword.fields.confirm.hideLabel' : 'profile.changePassword.fields.confirm.showLabel')"
                        @click="showConfirm = !showConfirm"
                    >
                        <span class="material-icons">{{ showConfirm ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                </div>
                <p v-if="mismatch" class="field__error" role="alert">
                    {{ t('profile.changePassword.errors.mismatch') }}
                </p>
            </div>

            <button type="submit" class="btn-primary" :disabled="!isValid">
                {{ t('profile.changePassword.updateAction') }}
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
    flex: 1;
    min-height: 0;
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
    flex: 1;
    min-height: 0;
    justify-content: space-between;
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

.field__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.field__input {
    width: 100%;
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    padding: clamp(6px, 0.75dvh, 8px) 48px clamp(6px, 0.75dvh, 8px) 20px;
    font-weight: 500;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-text-primary);
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

.field__input--error {
    border-color: var(--color-danger);
}

.field__toggle {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    padding: 4px;
    border-radius: 50%;
    transition: color 0.2s;
}

.field__toggle:hover {
    color: var(--color-label-accent);
}

.field__toggle .material-icons {
    font-size: 18px;
}

.field__error {
    font-size: 11px;
    color: var(--color-danger);
    margin: 0;
    padding-left: 12px;
}

.btn-primary {
    background: var(--color-primary);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(5px, 0.74dvh, 8px) 24px;
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
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
