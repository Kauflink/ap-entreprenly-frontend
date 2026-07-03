<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    billingSetup: { type: Object, required: true }
})

const emit = defineEmits(['payment-method-requested', 'fiscal-data-requested'])

const { t } = useI18n()

const primaryPaymentMethod = computed(() =>
    props.billingSetup.paymentMethods.find(paymentMethod => paymentMethod.isDefault)
    ?? props.billingSetup.paymentMethods.at(-1)
    ?? null
)
const fiscalData = computed(() => props.billingSetup.fiscalData)
const hasPaymentMethod = computed(() => primaryPaymentMethod.value !== null)
const hasFiscalData = computed(() => fiscalData.value !== null)
const paymentActionLabelKey = computed(() => 'subscription.billing.paymentMethod.manageAction')
const fiscalActionLabelKey = computed(() =>
    hasFiscalData.value
        ? 'subscription.billing.fiscalData.editAction'
        : 'subscription.billing.fiscalData.addAction'
)
const extraPaymentMethodCount = computed(() =>
    Math.max(props.billingSetup.paymentMethods.length - 1, 0)
)
const extraPaymentMethodLabelKey = computed(() =>
    extraPaymentMethodCount.value === 1
        ? 'subscription.billing.paymentMethod.additionalMethod'
        : 'subscription.billing.paymentMethod.additionalMethods'
)

function displayCardBrand(cardBrand) {
    const normalizedBrand = String(cardBrand ?? '').trim().toLowerCase()
    return ['tarjeta', 'card'].includes(normalizedBrand)
        ? t('subscription.cardBrand.generic')
        : cardBrand
}
</script>

<template>
    <section class="billing-panel" aria-labelledby="billing-title">
        <p class="eyebrow">{{ t('subscription.billing.eyebrow') }}</p>
        <h2 id="billing-title">{{ t('subscription.billing.title') }}</h2>

        <div class="billing-grid">
            <article class="billing-card" :class="{ 'billing-card--complete': hasPaymentMethod }">
                <div class="billing-card__body">
                    <span class="billing-card__icon" aria-hidden="true">
                        <span class="material-icons">credit_card</span>
                    </span>
                    <div>
                        <h3>{{ t('subscription.billing.paymentMethod.title') }}</h3>
                        <template v-if="primaryPaymentMethod">
                            <p>
                                {{ t('subscription.billing.paymentMethod.cardEnding', {
                                    brand: displayCardBrand(primaryPaymentMethod.cardBrand),
                                    lastFour: primaryPaymentMethod.lastFour,
                                    month: primaryPaymentMethod.expiryMonth,
                                    year: primaryPaymentMethod.expiryYear
                                }) }}
                            </p>
                            <strong class="billing-card__status">
                                {{ t('subscription.billing.paymentMethod.available') }}
                            </strong>
                            <span v-if="extraPaymentMethodCount > 0" class="billing-card__meta">
                                {{ t(extraPaymentMethodLabelKey, { count: extraPaymentMethodCount }) }}
                            </span>
                        </template>
                        <p v-else>{{ t('subscription.billing.paymentMethod.emptyDescription') }}</p>
                    </div>
                </div>
                <button type="button" @click="emit('payment-method-requested')">
                    {{ t(paymentActionLabelKey) }}
                </button>
            </article>

            <article class="billing-card" :class="{ 'billing-card--complete': hasFiscalData }">
                <div class="billing-card__body">
                    <span class="billing-card__icon" aria-hidden="true">
                        <span class="material-icons">receipt_long</span>
                    </span>
                    <div>
                        <h3>{{ t('subscription.billing.fiscalData.title') }}</h3>
                        <template v-if="fiscalData">
                            <p>{{ fiscalData.documentType }} {{ fiscalData.documentNumber }} - {{ fiscalData.businessName }}</p>
                            <strong class="billing-card__status">
                                {{ t('subscription.billing.fiscalData.complete') }}
                            </strong>
                        </template>
                        <p v-else>{{ t('subscription.billing.fiscalData.emptyDescription') }}</p>
                    </div>
                </div>
                <button type="button" @click="emit('fiscal-data-requested')">
                    {{ t(fiscalActionLabelKey) }}
                </button>
            </article>
        </div>
    </section>
</template>

<style scoped>
.billing-panel {
    min-height: 360px;
    border: 1px solid var(--color-card-border);
    border-radius: 18px;
    background: var(--color-card-bg);
    box-shadow: 0 18px 34px rgb(53 48 43 / 10%);
    padding: 22px 18px 18px;
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
    margin: 0 0 14px;
    padding: 7px 13px;
    text-transform: uppercase;
}

h2,
h3,
p {
    margin: 0;
}

h2 {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.25;
}

.billing-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 22px;
}

.billing-card {
    display: grid;
    min-height: 164px;
    border: 1px solid #eae4e0;
    border-radius: 14px;
    background: #fbfaf8;
    padding: 18px 16px 14px;
}

.billing-card--complete {
    border-color: #b9e2c8;
    background: #f3fbf5;
}

.billing-card__body {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.billing-card__icon {
    display: grid;
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    place-items: center;
    border: 1px solid #eae4e0;
    border-radius: 12px;
    background: #fbfaf8;
    color: #6f2700;
}

.billing-card__icon .material-icons {
    width: 20px;
    height: 20px;
    font-size: 20px;
}

.billing-card h3 {
    font-size: 16px;
    font-weight: 800;
    line-height: 1.3;
}

.billing-card p {
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1.6;
    margin-top: 6px;
}

.billing-card__status,
.billing-card__meta {
    display: block;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 1.1px;
    line-height: 1.35;
    margin-top: 8px;
    text-transform: uppercase;
}

.billing-card__status {
    color: var(--color-primary);
}

.billing-card__meta {
    color: var(--color-text-muted);
}

.billing-card button {
    align-self: end;
    min-height: 52px;
    border: 1px solid #eae4e0;
    border-radius: 999px;
    background: #fbfaf8;
    color: var(--color-label-accent);
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    padding: 0 18px;
}

.billing-card button:hover,
.billing-card button:focus-visible {
    border-color: var(--color-primary);
    outline: 3px solid rgb(243 131 19 / 28%);
    outline-offset: 3px;
}

@media (max-width: 760px) {
    .billing-grid {
        grid-template-columns: 1fr;
    }
}
</style>
