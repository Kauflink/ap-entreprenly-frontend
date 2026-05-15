<script setup>
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    fiscalData: { type: Object, default: null }
})

const emit = defineEmits(['closed', 'saved'])
const { t } = useI18n()

const fiscalForm = reactive({
    documentType: props.fiscalData?.documentType ?? 'RUC',
    documentNumber: props.fiscalData?.documentNumber ?? '',
    businessName: props.fiscalData?.businessName ?? '',
    receiptEmail: props.fiscalData?.receiptEmail ?? '',
    fiscalAddress: props.fiscalData?.fiscalAddress ?? ''
})
const touched = reactive({
    documentNumber: false,
    businessName: false,
    receiptEmail: false,
    fiscalAddress: false
})

function close() {
    emit('closed')
}

function closeFromKeyboard(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    }
}

function save() {
    markAllTouched()

    if (formInvalid()) return

    emit('saved', { ...fiscalForm })
}

function markAllTouched() {
    Object.keys(touched).forEach(field => { touched[field] = true })
}

function hasFieldError(fieldName) {
    if (!touched[fieldName]) return false

    if (fieldName === 'documentNumber') {
        return !/^\d{8,11}$/.test(fiscalForm.documentNumber)
    }

    if (fieldName === 'businessName') {
        return fiscalForm.businessName.trim().length === 0
    }

    if (fieldName === 'receiptEmail') {
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fiscalForm.receiptEmail)
    }

    if (fieldName === 'fiscalAddress') {
        return fiscalForm.fiscalAddress.trim().length === 0
    }

    return false
}

function formInvalid() {
    return ['documentNumber', 'businessName', 'receiptEmail', 'fiscalAddress']
        .some(field => hasFieldError(field))
}

onMounted(() => document.addEventListener('keydown', closeFromKeyboard))
onBeforeUnmount(() => document.removeEventListener('keydown', closeFromKeyboard))
</script>

<template>
    <div class="modal-layer">
        <div class="modal-backdrop" aria-hidden="true"></div>

        <section
            class="billing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-data-modal-title"
        >
            <button class="icon-button" type="button" :aria-label="t('subscription.modal.close')" @click="close">
                &times;
            </button>
            <p class="eyebrow">{{ t('subscription.modal.eyebrow') }}</p>
            <h2 id="billing-data-modal-title">{{ t('subscription.billingData.title') }}</h2>

            <form class="modal-form" @submit.prevent="save">
                <label>
                    <span>{{ t('subscription.upgrade.billing.documentType') }}</span>
                    <select v-model="fiscalForm.documentType">
                        <option value="RUC">RUC</option>
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                    </select>
                </label>

                <label>
                    <span>{{ t('subscription.upgrade.billing.documentNumber') }}</span>
                    <input
                        v-model="fiscalForm.documentNumber"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        :aria-invalid="hasFieldError('documentNumber')"
                        @blur="touched.documentNumber = true"
                    />
                    <small v-if="hasFieldError('documentNumber')">
                        {{ t('subscription.upgrade.billing.documentNumberError') }}
                    </small>
                </label>

                <label>
                    <span>{{ t('subscription.upgrade.billing.businessName') }}</span>
                    <input
                        v-model="fiscalForm.businessName"
                        type="text"
                        autocomplete="organization"
                        :aria-invalid="hasFieldError('businessName')"
                        @blur="touched.businessName = true"
                    />
                    <small v-if="hasFieldError('businessName')">
                        {{ t('subscription.upgrade.billing.businessNameError') }}
                    </small>
                </label>

                <label>
                    <span>{{ t('subscription.upgrade.billing.receiptEmail') }}</span>
                    <input
                        v-model="fiscalForm.receiptEmail"
                        type="email"
                        autocomplete="email"
                        :aria-invalid="hasFieldError('receiptEmail')"
                        @blur="touched.receiptEmail = true"
                    />
                    <small v-if="hasFieldError('receiptEmail')">
                        {{ t('subscription.upgrade.billing.receiptEmailError') }}
                    </small>
                </label>

                <label class="field-wide">
                    <span>{{ t('subscription.upgrade.billing.fiscalAddress') }}</span>
                    <input
                        v-model="fiscalForm.fiscalAddress"
                        type="text"
                        autocomplete="street-address"
                        :aria-invalid="hasFieldError('fiscalAddress')"
                        @blur="touched.fiscalAddress = true"
                    />
                    <small v-if="hasFieldError('fiscalAddress')">
                        {{ t('subscription.upgrade.billing.fiscalAddressError') }}
                    </small>
                </label>

                <div class="modal-actions">
                    <button class="secondary-button" type="button" @click="close">
                        {{ t('subscription.billingData.cancel') }}
                    </button>
                    <button class="primary-button" type="submit">
                        {{ t('subscription.billingData.save') }}
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<style scoped>
.modal-layer {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 24px;
}

.modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 30%);
    backdrop-filter: blur(8px);
}

.billing-modal {
    position: relative;
    width: min(660px, 100%);
    border-radius: 28px;
    background: var(--color-card-bg);
    box-shadow: 0 28px 64px rgb(45 39 34 / 22%);
    padding: 30px;
}

.icon-button {
    position: absolute;
    top: 24px;
    right: 24px;
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border: 1px solid var(--color-inner-bg);
    border-radius: 50%;
    background: var(--color-card-bg);
    color: var(--color-label-accent);
    cursor: pointer;
    font: inherit;
    font-size: 24px;
    line-height: 1;
}

.eyebrow {
    display: inline-flex;
    border-radius: 999px;
    background: var(--color-inner-bg);
    color: var(--color-label-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.4px;
    line-height: 1;
    margin: 0 0 16px;
    padding: 7px 14px;
    text-transform: uppercase;
}

h2 {
    color: #080604;
    font-size: 28px;
    font-weight: 850;
    line-height: 1.16;
    margin: 0;
    padding-right: 48px;
}

.modal-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 26px;
}

label {
    display: grid;
    gap: 8px;
    color: var(--color-label-accent);
    font-size: 12px;
    font-weight: 850;
}

.field-wide,
.modal-actions {
    grid-column: 1 / -1;
}

input,
select {
    min-height: 46px;
    border: 1px solid var(--color-inner-bg);
    border-radius: 12px;
    background: #fffdfa;
    color: #080604;
    font: inherit;
    padding: 0 14px;
}

input[aria-invalid='true'] {
    border-color: #b3261e;
}

small {
    color: #b3261e;
    font-weight: 700;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}

.primary-button,
.secondary-button {
    min-height: 52px;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    padding: 0 28px;
}

.primary-button {
    border: 0;
    background: var(--color-primary);
    color: #ffffff;
    box-shadow: 0 14px 28px rgb(243 131 19 / 28%);
}

.secondary-button {
    border: 1px solid var(--color-card-border);
    background: var(--color-card-bg);
    color: var(--color-label-accent);
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
    outline: 3px solid rgb(243 131 19 / 32%);
    outline-offset: 3px;
}

@media (max-width: 640px) {
    .modal-layer {
        align-items: end;
        padding: 12px;
    }

    .billing-modal {
        padding: 24px 18px;
    }

    .modal-form {
        grid-template-columns: 1fr;
    }

    .modal-actions {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
