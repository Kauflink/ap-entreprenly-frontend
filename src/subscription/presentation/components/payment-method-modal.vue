<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { detectCardBrand } from '@/subscription/domain/model/billing-setup-entity.js'
import CardBrandBadge from '@/subscription/presentation/components/card-brand-badge.vue'

const props = defineProps({
    billingSetup: { type: Object, required: true }
})

const emit = defineEmits(['closed', 'saved', 'selected'])
const { t } = useI18n()

const addingPaymentMethod = ref(false)
const paymentMethods = computed(() => props.billingSetup.paymentMethods ?? [])
const showPaymentForm = computed(() => addingPaymentMethod.value || paymentMethods.value.length === 0)
const paymentForm = reactive({
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: ''
})
const touched = reactive({
    cardNumber: false,
    holderName: false,
    expiry: false,
    cvv: false
})

const detectedCardBrand = computed(() => detectCardBrand(paymentForm.cardNumber).label)

function close() {
    emit('closed')
}

function closeFromKeyboard(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    }
}

function showAddPaymentForm() {
    addingPaymentMethod.value = true
}

function showPaymentList() {
    addingPaymentMethod.value = false
}

function selectPaymentMethod(paymentMethodId) {
    emit('selected', paymentMethodId)
}

function save() {
    markAllTouched()

    if (formInvalid()) return

    const [expiryMonth, expiryYear] = paymentForm.expiry.split('/')

    emit('saved', {
        cardNumber: paymentForm.cardNumber,
        holderName: paymentForm.holderName,
        expiryMonth,
        expiryYear
    })
}

function markAllTouched() {
    Object.keys(touched).forEach(field => { touched[field] = true })
}

function hasFieldError(fieldName) {
    if (!touched[fieldName]) return false

    if (fieldName === 'cardNumber') {
        return !/^(?:\d[ -]?){13,19}$/.test(paymentForm.cardNumber)
    }

    if (fieldName === 'holderName') {
        return paymentForm.holderName.trim().length < 3
    }

    if (fieldName === 'expiry') {
        return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiry)
    }

    if (fieldName === 'cvv') {
        return !/^\d{3,4}$/.test(paymentForm.cvv)
    }

    return false
}

function formInvalid() {
    return ['cardNumber', 'holderName', 'expiry', 'cvv'].some(field => hasFieldError(field))
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
            aria-labelledby="payment-method-modal-title"
        >
            <button class="icon-button" type="button" :aria-label="t('subscription.modal.close')" @click="close">
                &times;
            </button>
            <p class="eyebrow">{{ t('subscription.modal.eyebrow') }}</p>
            <h2 id="payment-method-modal-title">
                {{ t(showPaymentForm ? 'subscription.paymentMethod.addTitle' : 'subscription.upgrade.payment.selectMethod') }}
            </h2>

            <template v-if="!showPaymentForm">
                <div class="payment-method-list">
                    <button
                        v-for="paymentMethod in paymentMethods"
                        :key="paymentMethod.id"
                        type="button"
                        class="payment-method-option"
                        :class="{ 'payment-method-option--selected': paymentMethod.isDefault }"
                        :aria-pressed="paymentMethod.isDefault"
                        @click="selectPaymentMethod(paymentMethod.id)"
                    >
                        <CardBrandBadge :brand="paymentMethod.cardBrand" />
                        <span>
                            <strong>
                                {{ t('subscription.upgrade.payment.cardEndingShort', {
                                    brand: paymentMethod.cardBrand,
                                    lastFour: paymentMethod.lastFour
                                }) }}
                            </strong>
                            <small>
                                {{ t('subscription.upgrade.payment.holderExpiry', {
                                    holder: paymentMethod.holderName,
                                    month: paymentMethod.expiryMonth,
                                    year: paymentMethod.expiryYear
                                }) }}
                            </small>
                        </span>
                        <em v-if="paymentMethod.isDefault">
                            {{ t('subscription.billing.paymentMethod.available') }}
                        </em>
                    </button>
                </div>

                <button class="primary-button" type="button" @click="showAddPaymentForm">
                    {{ t('subscription.paymentMethod.addTitle') }}
                </button>
            </template>

            <form v-else class="modal-form" @submit.prevent="save">
                <label>
                    <span>{{ t('subscription.upgrade.payment.cardNumber') }}</span>
                    <div class="card-number-field">
                        <input
                            v-model="paymentForm.cardNumber"
                            type="text"
                            inputmode="numeric"
                            autocomplete="cc-number"
                            placeholder="4242 4242 4242 4242"
                            :aria-invalid="hasFieldError('cardNumber')"
                            @blur="touched.cardNumber = true"
                        />
                        <CardBrandBadge :brand="detectedCardBrand" />
                    </div>
                    <small v-if="hasFieldError('cardNumber')">
                        {{ t('subscription.upgrade.payment.cardNumberError') }}
                    </small>
                </label>

                <label>
                    <span>{{ t('subscription.upgrade.payment.holder') }}</span>
                    <input
                        v-model="paymentForm.holderName"
                        type="text"
                        autocomplete="cc-name"
                        :placeholder="t('subscription.paymentMethod.holderPlaceholder')"
                        :aria-invalid="hasFieldError('holderName')"
                        @blur="touched.holderName = true"
                    />
                    <small v-if="hasFieldError('holderName')">
                        {{ t('subscription.upgrade.payment.holderError') }}
                    </small>
                </label>

                <label>
                    <span>{{ t('subscription.upgrade.payment.expiry') }}</span>
                    <input
                        v-model="paymentForm.expiry"
                        type="text"
                        inputmode="numeric"
                        autocomplete="cc-exp"
                        placeholder="12/29"
                        :aria-invalid="hasFieldError('expiry')"
                        @blur="touched.expiry = true"
                    />
                    <small v-if="hasFieldError('expiry')">
                        {{ t('subscription.upgrade.payment.expiryError') }}
                    </small>
                </label>

                <label>
                    <span>CVV</span>
                    <input
                        v-model="paymentForm.cvv"
                        type="password"
                        inputmode="numeric"
                        autocomplete="cc-csc"
                        placeholder="123"
                        :aria-invalid="hasFieldError('cvv')"
                        @blur="touched.cvv = true"
                    />
                    <small v-if="hasFieldError('cvv')">
                        {{ t('subscription.upgrade.payment.cvvError') }}
                    </small>
                </label>

                <div class="modal-actions">
                    <button v-if="paymentMethods.length > 0" class="secondary-button" type="button" @click="showPaymentList">
                        {{ t('subscription.upgrade.back') }}
                    </button>
                    <button class="primary-button" type="submit">
                        {{ t('subscription.paymentMethod.save') }}
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
    border: 1px solid #eae4e0;
    border-radius: 50%;
    background: #fbfaf8;
    color: var(--color-label-accent);
    cursor: pointer;
    font: inherit;
    font-size: 24px;
    line-height: 1;
}

.eyebrow {
    display: inline-flex;
    border: 1px solid #eae4e0;
    border-radius: 999px;
    background: #fbfaf8;
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

.payment-method-list {
    display: grid;
    gap: 12px;
    margin-top: 24px;
}

.payment-method-option {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: center;
    width: 100%;
    border: 1px solid #eae4e0;
    border-radius: 18px;
    background: #fbfaf8;
    color: #080604;
    cursor: pointer;
    font: inherit;
    padding: 16px;
    text-align: left;
}

.payment-method-option--selected {
    border-color: #bee3cb;
    background: #f2fbf5;
}

.payment-method-option span {
    display: grid;
    gap: 4px;
}

.payment-method-option strong {
    font-size: 14px;
    font-weight: 850;
}

.payment-method-option small {
    color: #6f625a;
    font-size: 12px;
}

.payment-method-option em {
    border-radius: 999px;
    background: #eaf7ef;
    color: #004e1d;
    font-size: 11px;
    font-style: normal;
    font-weight: 850;
    padding: 6px 10px;
    text-transform: uppercase;
}

label {
    display: grid;
    gap: 8px;
    color: var(--color-label-accent);
    font-size: 12px;
    font-weight: 850;
}

input {
    width: 100%;
    min-height: 46px;
    border: 1px solid #eae4e0;
    border-radius: 12px;
    background: #fbfaf8;
    color: #080604;
    font: inherit;
    padding: 0 14px;
}

.card-number-field {
    position: relative;
}

.card-number-field input {
    padding-right: 88px;
}

.card-number-field :deep(.card-brand-badge) {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
}

input[aria-invalid='true'] {
    border-color: #b3261e;
}

small {
    color: #b3261e;
    font-weight: 700;
}

.primary-button {
    grid-column: 1 / -1;
    width: 100%;
    min-height: 58px;
    border: 0;
    border-radius: 999px;
    background: var(--color-primary);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    padding: 0 30px;
    box-shadow: 0 14px 28px rgb(243 131 19 / 28%);
}

.payment-method-list + .primary-button {
    margin-top: 20px;
}

.modal-actions {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: auto 1fr;
    gap: 12px;
}

.modal-actions .primary-button {
    grid-column: auto;
}

.secondary-button {
    min-height: 58px;
    border: 1px solid #eae4e0;
    border-radius: 999px;
    background: #fbfaf8;
    color: var(--color-label-accent);
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    padding: 0 24px;
}

button:focus-visible,
input:focus-visible {
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

    .modal-form,
    .payment-method-option,
    .modal-actions {
        grid-template-columns: 1fr;
    }
}
</style>
