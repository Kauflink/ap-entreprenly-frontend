<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { detectCardBrand } from '@/subscription/domain/model/billing-setup-entity.js'
import CardBrandBadge from '@/subscription/presentation/components/card-brand-badge.vue'
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js'

const props = defineProps({
    plan:         { type: Object, required: true },
    billingCycle: { type: String, required: true },
    billingSetup: { type: Object, required: true }
})

const emit = defineEmits([
    'closed',
    'fiscal-data-saved',
    'payment-method-saved',
    'payment-method-selected',
    'subscription-activated'
])

const { t } = useI18n()
const { format: formatCurrency } = useCurrencyFormatter()

function cardBrandLabel(cardBrand) {
    const normalizedBrand = String(cardBrand ?? '').trim().toLowerCase()
    return ['tarjeta', 'card'].includes(normalizedBrand)
        ? t('subscription.cardBrand.generic')
        : cardBrand
}
const activeStep = ref('plan')
const activated = ref(false)
const selectedPaymentMethodId = ref('')

const steps = [
    { id: 'plan', labelKey: 'subscription.upgrade.steps.plan' },
    { id: 'billing', labelKey: 'subscription.upgrade.steps.billing' },
    { id: 'payment', labelKey: 'subscription.upgrade.steps.payment' },
    { id: 'activation', labelKey: 'subscription.upgrade.steps.activation' }
]

const fiscalForm = reactive({
    documentType: props.billingSetup.fiscalData?.documentType ?? 'RUC',
    documentNumber: props.billingSetup.fiscalData?.documentNumber ?? '',
    businessName: props.billingSetup.fiscalData?.businessName ?? '',
    receiptEmail: props.billingSetup.fiscalData?.receiptEmail ?? '',
    fiscalAddress: props.billingSetup.fiscalData?.fiscalAddress ?? ''
})
const fiscalTouched = reactive({
    documentNumber: false,
    businessName: false,
    receiptEmail: false,
    fiscalAddress: false
})

const paymentForm = reactive({
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: ''
})
const paymentTouched = reactive({
    cardNumber: false,
    holderName: false,
    expiry: false,
    cvv: false
})

const activeIndex = computed(() =>
    steps.findIndex(step => step.id === activeStep.value)
)
const planPrice = computed(() =>
    props.billingCycle === 'monthly' ? props.plan.monthlyPrice : props.plan.annualPrice
)
const formattedPlanPrice = computed(() => formatCurrency(planPrice.value))
const planPriceSuffixKey = computed(() =>
    props.billingCycle === 'monthly'
        ? 'subscription.upgrade.plan.priceLabel.monthly'
        : 'subscription.upgrade.plan.priceLabel.annual'
)
const billingLabelKey = computed(() =>
    props.billingCycle === 'monthly'
        ? 'subscription.upgrade.plan.billingLabel.monthly'
        : 'subscription.upgrade.plan.billingLabel.annual'
)
const paymentMethods = computed(() => props.billingSetup.paymentMethods)
const defaultPaymentMethodId = computed(() =>
    paymentMethods.value.find(paymentMethod => paymentMethod.isDefault)?.id
    ?? paymentMethods.value[0]?.id
    ?? ''
)
const effectiveSelectedPaymentMethodId = computed(() => {
    const selectedId = selectedPaymentMethodId.value

    if (paymentMethods.value.some(paymentMethod => paymentMethod.id === selectedId)) {
        return selectedId
    }

    return defaultPaymentMethodId.value
})
const selectedPaymentMethod = computed(() =>
    paymentMethods.value.find(
        paymentMethod => paymentMethod.id === effectiveSelectedPaymentMethodId.value
    ) ?? null
)
const detectedPaymentCardBrand = computed(() => detectCardBrand(paymentForm.cardNumber).label)

watch(defaultPaymentMethodId, id => {
    if (!selectedPaymentMethodId.value) selectedPaymentMethodId.value = id
}, { immediate: true })

function close() {
    emit('closed')
}

function closeFromKeyboard(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    }
}

function goToStep(step) {
    const targetIndex = stepIndex(step)

    if (targetIndex <= activeIndex.value) {
        activeStep.value = step
    }
}

function continueFlow() {
    if (activeStep.value === 'billing') {
        continueFromBilling()
        return
    }

    if (activeStep.value === 'payment') {
        continueFromPayment()
        return
    }

    goToNextStep()
}

function back() {
    const previousStep = steps[activeIndex.value - 1]
    if (previousStep) activeStep.value = previousStep.id
}

function activateSubscription() {
    emit('subscription-activated')
    activated.value = true
}

function selectPaymentMethod(paymentMethodId) {
    selectedPaymentMethodId.value = paymentMethodId
}

function isStepActive(step) {
    return activeStep.value === step
}

function isStepComplete(step) {
    return stepIndex(step) < activeIndex.value
}

function stepBackgroundColor(step) {
    if (isStepActive(step)) return '#FFFCF5'
    return isStepComplete(step) ? '#F2FBF5' : '#FBFAF8'
}

function stepBorderColor(step) {
    if (isStepActive(step)) return '#FDEAD3'
    return isStepComplete(step) ? '#BEE3CB' : '#ECE6E3'
}

function stepTextColor(step) {
    if (isStepActive(step)) return '#511E00'
    return isStepComplete(step) ? '#004E1D' : 'rgb(81 30 0 / 50%)'
}

function hasFiscalFieldError(fieldName) {
    if (!fiscalTouched[fieldName]) return false

    if (fieldName === 'documentNumber') return !/^\d{8,11}$/.test(fiscalForm.documentNumber)
    if (fieldName === 'businessName') return fiscalForm.businessName.trim().length === 0
    if (fieldName === 'receiptEmail') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fiscalForm.receiptEmail)
    if (fieldName === 'fiscalAddress') return fiscalForm.fiscalAddress.trim().length === 0

    return false
}

function hasPaymentFieldError(fieldName) {
    if (!paymentTouched[fieldName]) return false

    if (fieldName === 'cardNumber') return !/^(?:\d[ -]?){13,19}$/.test(paymentForm.cardNumber)
    if (fieldName === 'holderName') return paymentForm.holderName.trim().length < 3
    if (fieldName === 'expiry') return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiry)
    if (fieldName === 'cvv') return !/^\d{3,4}$/.test(paymentForm.cvv)

    return false
}

function displayCardBrand(cardBrand) {
    return cardBrandLabel(cardBrand)
}

function continueFromBilling() {
    Object.keys(fiscalTouched).forEach(field => { fiscalTouched[field] = true })

    if (['documentNumber', 'businessName', 'receiptEmail', 'fiscalAddress']
        .some(field => hasFiscalFieldError(field))) {
        return
    }

    emit('fiscal-data-saved', { ...fiscalForm })
    goToNextStep()
}

function continueFromPayment() {
    if (paymentMethods.value.length > 0) {
        emit('payment-method-selected', effectiveSelectedPaymentMethodId.value)
        goToNextStep()
        return
    }

    Object.keys(paymentTouched).forEach(field => { paymentTouched[field] = true })

    if (['cardNumber', 'holderName', 'expiry', 'cvv']
        .some(field => hasPaymentFieldError(field))) {
        return
    }

    const [expiryMonth, expiryYear] = paymentForm.expiry.split('/')

    emit('payment-method-saved', {
        cardNumber: paymentForm.cardNumber,
        holderName: paymentForm.holderName,
        expiryMonth,
        expiryYear
    })
    goToNextStep()
}

function goToNextStep() {
    const nextStep = steps[activeIndex.value + 1]
    if (nextStep) activeStep.value = nextStep.id
}

function stepIndex(step) {
    return steps.findIndex(item => item.id === step)
}

onMounted(() => document.addEventListener('keydown', closeFromKeyboard))
onBeforeUnmount(() => document.removeEventListener('keydown', closeFromKeyboard))
</script>

<template>
    <div class="modal-layer">
        <div class="modal-backdrop" aria-hidden="true"></div>

        <section
            class="upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
        >
            <button class="icon-button" type="button" :aria-label="t('subscription.modal.close')" @click="close">
                &times;
            </button>
            <p class="eyebrow">{{ t('subscription.modal.eyebrow') }}</p>

            <template v-if="activated">
                <h2 id="upgrade-modal-title">{{ t('subscription.upgrade.activated.title') }}</h2>
                <div class="success-card">
                    <div>
                        <h3>{{ t('subscription.upgrade.activated.cardTitle') }}</h3>
                        <p>{{ t('subscription.upgrade.activated.cardDescription') }}</p>
                    </div>
                    <button class="primary-button" type="button" @click="close">
                        {{ t('subscription.upgrade.activated.understood') }}
                    </button>
                </div>
            </template>

            <template v-else>
                <h2 id="upgrade-modal-title">{{ t('subscription.upgrade.title') }}</h2>

                <nav class="step-tabs" :aria-label="t('subscription.upgrade.navAriaLabel')">
                    <button
                        v-for="step in steps"
                        :key="step.id"
                        type="button"
                        :class="{
                            'step-tab--active': isStepActive(step.id),
                            'step-tab--complete': isStepComplete(step.id)
                        }"
                        :style="{
                            backgroundColor: stepBackgroundColor(step.id),
                            borderColor: stepBorderColor(step.id),
                            color: stepTextColor(step.id)
                        }"
                        :aria-current="isStepActive(step.id) ? 'step' : undefined"
                        :disabled="!isStepActive(step.id) && !isStepComplete(step.id)"
                        @click="goToStep(step.id)"
                    >
                        {{ t(step.labelKey) }}
                    </button>
                </nav>

                <template v-if="activeStep === 'plan'">
                    <p class="helper-text">
                        {{ t('subscription.upgrade.plan.helper') }}
                    </p>
                    <article class="summary-card">
                        <div>
                            <h3>{{ plan.name }}</h3>
                            <p>{{ t(billingLabelKey) }}</p>
                        </div>
                        <strong>{{ formattedPlanPrice }}{{ t(planPriceSuffixKey) }}</strong>
                    </article>
                    <div class="modal-actions modal-actions--end">
                        <button class="primary-button" type="button" @click="continueFlow">
                            {{ t('subscription.upgrade.continue') }}
                        </button>
                    </div>
                </template>

                <form v-else-if="activeStep === 'billing'" class="billing-form" @submit.prevent="continueFlow">
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
                            :aria-invalid="hasFiscalFieldError('documentNumber')"
                            @blur="fiscalTouched.documentNumber = true"
                        />
                        <small v-if="hasFiscalFieldError('documentNumber')">
                            {{ t('subscription.upgrade.billing.documentNumberError') }}
                        </small>
                    </label>

                    <label>
                        <span>{{ t('subscription.upgrade.billing.businessName') }}</span>
                        <input
                            v-model="fiscalForm.businessName"
                            type="text"
                            autocomplete="organization"
                            :aria-invalid="hasFiscalFieldError('businessName')"
                            @blur="fiscalTouched.businessName = true"
                        />
                        <small v-if="hasFiscalFieldError('businessName')">
                            {{ t('subscription.upgrade.billing.businessNameError') }}
                        </small>
                    </label>

                    <label>
                        <span>{{ t('subscription.upgrade.billing.receiptEmail') }}</span>
                        <input
                            v-model="fiscalForm.receiptEmail"
                            type="email"
                            autocomplete="email"
                            :aria-invalid="hasFiscalFieldError('receiptEmail')"
                            @blur="fiscalTouched.receiptEmail = true"
                        />
                        <small v-if="hasFiscalFieldError('receiptEmail')">
                            {{ t('subscription.upgrade.billing.receiptEmailError') }}
                        </small>
                    </label>

                    <label class="field-wide">
                        <span>{{ t('subscription.upgrade.billing.fiscalAddress') }}</span>
                        <input
                            v-model="fiscalForm.fiscalAddress"
                            type="text"
                            autocomplete="street-address"
                            :aria-invalid="hasFiscalFieldError('fiscalAddress')"
                            @blur="fiscalTouched.fiscalAddress = true"
                        />
                        <small v-if="hasFiscalFieldError('fiscalAddress')">
                            {{ t('subscription.upgrade.billing.fiscalAddressError') }}
                        </small>
                    </label>

                    <div class="modal-actions">
                        <button class="secondary-button" type="button" @click="back">
                            {{ t('subscription.upgrade.back') }}
                        </button>
                        <button class="primary-button" type="submit">
                            {{ t('subscription.upgrade.continue') }}
                        </button>
                    </div>
                </form>

                <template v-else-if="activeStep === 'payment'">
                    <template v-if="paymentMethods.length > 0">
                        <div class="stack">
                            <article
                                v-if="paymentMethods.length === 1 && selectedPaymentMethod"
                                class="summary-card summary-card--plain"
                            >
                                <div>
                                    <CardBrandBadge :brand="selectedPaymentMethod.cardBrand" />
                                    <h3>{{ t('subscription.upgrade.payment.registeredCard') }}</h3>
                                    <p>
                                        {{ t('subscription.upgrade.payment.cardEnding', {
                                            brand: displayCardBrand(selectedPaymentMethod.cardBrand),
                                            lastFour: selectedPaymentMethod.lastFour,
                                            month: selectedPaymentMethod.expiryMonth,
                                            year: selectedPaymentMethod.expiryYear
                                        }) }}
                                    </p>
                                </div>
                            </article>

                            <fieldset v-else class="payment-options">
                                <legend>{{ t('subscription.upgrade.payment.selectMethod') }}</legend>
                                <label
                                    v-for="paymentMethod in paymentMethods"
                                    :key="paymentMethod.id"
                                    class="payment-option"
                                    :class="{
                                        'payment-option--selected': effectiveSelectedPaymentMethodId === paymentMethod.id
                                    }"
                                >
                                    <input
                                        type="radio"
                                        name="upgradePaymentMethod"
                                        :value="paymentMethod.id"
                                        :checked="effectiveSelectedPaymentMethodId === paymentMethod.id"
                                        @change="selectPaymentMethod(paymentMethod.id)"
                                    />
                                    <CardBrandBadge :brand="paymentMethod.cardBrand" />
                                    <span>
                                        <strong>
                                            {{ t('subscription.upgrade.payment.cardEndingShort', {
                                                brand: displayCardBrand(paymentMethod.cardBrand),
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
                                </label>
                            </fieldset>

                            <article class="summary-card summary-card--plain">
                                <h3>{{ t('subscription.upgrade.payment.totalCharge') }}</h3>
                                <strong>{{ formattedPlanPrice }}</strong>
                            </article>
                        </div>
                        <div class="modal-actions">
                            <button class="secondary-button" type="button" @click="back">
                                {{ t('subscription.upgrade.back') }}
                            </button>
                            <button class="primary-button" type="button" @click="continueFlow">
                                {{ t('subscription.upgrade.continue') }}
                            </button>
                        </div>
                    </template>

                    <form v-else class="billing-form" @submit.prevent="continueFlow">
                        <label>
                            <span>{{ t('subscription.upgrade.payment.cardNumber') }}</span>
                            <div class="card-number-field">
                                <input
                                    v-model="paymentForm.cardNumber"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="cc-number"
                                    placeholder="4242 4242 4242 4242"
                                    :aria-invalid="hasPaymentFieldError('cardNumber')"
                                    @blur="paymentTouched.cardNumber = true"
                                />
                                <CardBrandBadge :brand="detectedPaymentCardBrand" />
                            </div>
                            <small v-if="hasPaymentFieldError('cardNumber')">
                                {{ t('subscription.upgrade.payment.cardNumberError') }}
                            </small>
                        </label>

                        <label>
                            <span>{{ t('subscription.upgrade.payment.holder') }}</span>
                            <input
                                v-model="paymentForm.holderName"
                                type="text"
                                autocomplete="cc-name"
                                :aria-invalid="hasPaymentFieldError('holderName')"
                                @blur="paymentTouched.holderName = true"
                            />
                            <small v-if="hasPaymentFieldError('holderName')">
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
                                :aria-invalid="hasPaymentFieldError('expiry')"
                                @blur="paymentTouched.expiry = true"
                            />
                            <small v-if="hasPaymentFieldError('expiry')">
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
                                :aria-invalid="hasPaymentFieldError('cvv')"
                                @blur="paymentTouched.cvv = true"
                            />
                            <small v-if="hasPaymentFieldError('cvv')">
                                {{ t('subscription.upgrade.payment.cvvError') }}
                            </small>
                        </label>

                        <article class="summary-card summary-card--plain field-wide">
                            <h3>{{ t('subscription.upgrade.payment.totalCharge') }}</h3>
                            <strong>{{ formattedPlanPrice }}</strong>
                        </article>

                        <div class="modal-actions">
                            <button class="secondary-button" type="button" @click="back">
                                {{ t('subscription.upgrade.back') }}
                            </button>
                            <button class="primary-button" type="submit">
                                {{ t('subscription.upgrade.continue') }}
                            </button>
                        </div>
                    </form>
                </template>

                <template v-else-if="activeStep === 'activation'">
                    <article class="ready-card">
                        <h3>{{ t('subscription.upgrade.activation.readyTitle') }}</h3>
                        <p>{{ t('subscription.upgrade.activation.readyDescription') }}</p>
                    </article>
                    <div class="modal-actions">
                        <button class="secondary-button" type="button" @click="back">
                            {{ t('subscription.upgrade.back') }}
                        </button>
                        <button class="primary-button" type="button" @click="activateSubscription">
                            {{ t('subscription.upgrade.activation.payAndActivate') }}
                        </button>
                    </div>
                </template>
            </template>
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

.upgrade-modal {
    position: relative;
    width: min(680px, 100%);
    max-height: calc(100dvh - 48px);
    overflow-y: auto;
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

h2,
h3,
p {
    margin: 0;
}

h2 {
    color: #080604;
    font-size: 28px;
    font-weight: 850;
    line-height: 1.16;
    padding-right: 48px;
}

h3 {
    font-size: 16px;
    font-weight: 850;
    line-height: 1.3;
}

.helper-text {
    color: #6e645d;
    font-size: 13px;
    line-height: 1.6;
    margin-top: 28px;
}

.step-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 28px;
}

.step-tabs button {
    min-height: 44px;
    border: 1px solid #ece6e3;
    border-radius: 12px;
    background: #fbfaf8;
    color: rgb(81 30 0 / 50%);
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 1.2px;
    text-transform: uppercase;
}

.step-tabs button:disabled {
    cursor: default;
    opacity: 1;
}

.summary-card,
.ready-card,
.success-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border: 1px solid var(--color-inner-bg);
    border-radius: 18px;
    margin-top: 18px;
    padding: 22px;
}

.summary-card strong {
    color: var(--color-label-accent);
    font-size: 24px;
    white-space: nowrap;
}

.summary-card p,
.ready-card p,
.success-card p {
    color: #716861;
    font-size: 14px;
    line-height: 1.5;
    margin-top: 7px;
}

.summary-card--plain {
    margin-top: 0;
}

.ready-card {
    display: block;
    border-color: #b9e2c8;
    background: #f2fbf6;
    margin-top: 24px;
    min-height: 118px;
}

.success-card {
    margin-top: 24px;
}

.billing-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 24px;
}

label {
    display: grid;
    gap: 8px;
    color: var(--color-label-accent);
    font-size: 12px;
    font-weight: 850;
}

.field-wide {
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

.card-number-field {
    position: relative;
}

.card-number-field input {
    width: 100%;
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

.stack {
    display: grid;
    gap: 18px;
    margin-top: 24px;
}

.payment-options {
    display: grid;
    gap: 10px;
    border: 0;
    margin: 0;
    padding: 0;
}

.payment-options legend {
    color: var(--color-label-accent);
    font-size: 12px;
    font-weight: 850;
    margin-bottom: 6px;
}

.payment-option {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--color-inner-bg);
    border-radius: 16px;
    background: #fffdfa;
    color: #080604;
    cursor: pointer;
    padding: 14px 16px;
}

.payment-option--selected {
    border-color: #bee3cb;
    background: #f2fbf5;
}

.payment-option small {
    color: #716861;
}

.modal-actions {
    display: flex;
    grid-column: 1 / -1;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

.modal-actions--end {
    justify-content: flex-end;
}

.primary-button,
.secondary-button {
    min-height: 50px;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    padding: 0 26px;
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

    .upgrade-modal {
        padding: 24px 18px;
    }

    .step-tabs,
    .billing-form {
        grid-template-columns: 1fr;
    }

    .summary-card,
    .success-card,
    .modal-actions {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
