<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    activity:     { type: Array, required: true },
    billingSetup: { type: Object, required: true },
    currentPlan:  { type: Object, required: true },
    billingCycle: { type: String, required: true }
})

const emit = defineEmits(['history-download-requested'])
const { t, locale } = useI18n()

const activityRows = computed(() =>
    [
        ...props.activity.map(item => toActivityRow(item)),
        {
            id: 'payment-method',
            title: t('subscription.history.paymentMethod.title'),
            detail: paymentMethodDetail()
        },
        {
            id: 'fiscal-data',
            title: t('subscription.history.fiscalData.title'),
            detail: fiscalDataDetail()
        }
    ]
)

function formatCurrency(priceInPen) {
    return `S/ ${Number(priceInPen ?? 0).toFixed(2)}`
}

function toLocalDate(dateValue) {
    const [year, month, day] = String(dateValue ?? '').split('-').map(value => Number(value))
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

function formatPlanDate(dateValue) {
    const date = toLocalDate(dateValue)

    if (date === null) return t('subscription.planAction.fallbackDate')

    return new Intl.DateTimeFormat(locale.value.startsWith('es') ? 'es-PE' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

function toActivityRow(item) {
    if (item.id === 'created-account') {
        return {
            id: item.id,
            title: t('subscription.activity.created-account.title'),
            detail: t('subscription.activity.created-account.detail')
        }
    }

    if (item.id === 'current-status') {
        return {
            id: item.id,
            title: t('subscription.activity.current-status.title'),
            detail: t(`subscription.activity.current-status.detail.${props.currentPlan.status}`, {
                price: formatCurrency(props.currentPlan.monthlyPrice)
            })
        }
    }

    if (item.id === 'billing') return toBillingActivityRow(item)

    return {
        id: item.id,
        title: item.title,
        detail: item.detail
    }
}

function toBillingActivityRow(item) {
    if (props.currentPlan.status === 'free') {
        return {
            id: item.id,
            title: t('subscription.activity.billing.title'),
            detail: t('subscription.activity.billing.detail.free')
        }
    }

    const cancellationScheduled = props.currentPlan.status === 'scheduled-cancellation'

    return {
        id: item.id,
        title: t('subscription.activity.billing.title'),
        detail: t(cancellationScheduled
            ? 'subscription.activity.billing.detail.accessUntil'
            : 'subscription.activity.billing.detail.renewalWithDate',
        {
            date: formatPlanDate(props.currentPlan.currentPeriodEndDate),
            cycle: props.billingCycle === 'annual'
                ? t('subscription.overview.priceLabel.annual')
                : t('subscription.overview.priceLabel.monthly')
        })
    }
}

function selectedPaymentMethod() {
    return props.billingSetup.paymentMethods.find(method => method.isDefault)
        ?? props.billingSetup.paymentMethods.at(-1)
        ?? null
}

function cardBrandLabel(cardBrand) {
    const normalizedBrand = String(cardBrand ?? '').trim().toLowerCase()
    return ['tarjeta', 'card'].includes(normalizedBrand)
        ? t('subscription.cardBrand.generic')
        : cardBrand
}

function paymentMethodDetail() {
    const paymentMethod = selectedPaymentMethod()

    if (!paymentMethod) return t('subscription.history.paymentMethod.empty')

    return t('subscription.history.paymentMethod.detail', {
        brand: cardBrandLabel(paymentMethod.cardBrand),
        lastFour: paymentMethod.lastFour
    })
}

function fiscalDataDetail() {
    const fiscalData = props.billingSetup.fiscalData

    if (fiscalData === null) return t('subscription.history.fiscalData.empty')

    return t('subscription.history.fiscalData.detail', {
        documentType: fiscalData.documentType,
        documentNumber: fiscalData.documentNumber,
        businessName: fiscalData.businessName
    })
}
</script>

<template>
    <section class="activity-panel" aria-labelledby="activity-title">
        <div class="activity-panel__heading">
            <div>
                <p class="eyebrow">{{ t('subscription.activity.eyebrow') }}</p>
                <h2 id="activity-title">{{ t('subscription.activity.title') }}</h2>
            </div>
            <button type="button" @click="emit('history-download-requested')">
                <span class="material-icons" aria-hidden="true">download</span>
                <span>{{ t('subscription.activity.downloadAction') }}</span>
            </button>
        </div>

        <div class="activity-list" role="table" :aria-label="t('subscription.activity.title')">
            <div v-for="item in activityRows" :key="item.id" class="activity-row" role="row">
                <strong role="cell">{{ item.title }}</strong>
                <span role="cell">{{ item.detail }}</span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.activity-panel {
    border: 1px solid var(--color-card-border);
    border-radius: 18px;
    background: var(--color-card-bg);
    box-shadow: 0 18px 34px rgb(53 48 43 / 10%);
    padding: 22px 18px 20px;
}

.activity-panel__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
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
    margin: 0 0 14px;
    padding: 7px 13px;
    text-transform: uppercase;
}

h2,
p {
    margin: 0;
}

h2 {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.25;
}

.activity-panel button {
    display: inline-flex;
    min-height: 52px;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--color-card-border);
    border-radius: 999px;
    background: var(--color-card-bg);
    color: var(--color-label-accent);
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    padding: 0 22px;
}

.activity-panel button:hover,
.activity-panel button:focus-visible {
    border-color: var(--color-primary);
    outline: 3px solid rgb(243 131 19 / 28%);
    outline-offset: 3px;
}

.activity-panel .material-icons {
    width: 18px;
    height: 18px;
    font-size: 18px;
}

.activity-list {
    overflow: hidden;
    border: 1px solid #f1ebe6;
    border-radius: 14px;
    margin-top: 24px;
}

.activity-row {
    display: grid;
    grid-template-columns: minmax(180px, 0.65fr) minmax(0, 1.35fr);
    gap: 18px;
    padding: 18px 16px;
}

.activity-row + .activity-row {
    border-top: 1px solid #f1ebe6;
}

.activity-row:nth-child(even) {
    background: var(--color-inner-bg);
}

.activity-row strong {
    line-height: 1.35;
}

.activity-row span {
    color: var(--color-text-muted);
    line-height: 1.45;
}

@media (max-width: 720px) {
    .activity-panel__heading,
    .activity-row {
        grid-template-columns: 1fr;
    }

    .activity-panel__heading {
        display: grid;
    }

    .activity-panel button {
        justify-content: center;
    }
}
</style>
