<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js'

const props = defineProps({
    activity:     { type: Array, required: true },
    billingSetup: { type: Object, required: true },
    currentPlan:  { type: Object, required: true },
    billingCycle: { type: String, required: true },
    downloaded:   { type: Boolean, default: false }
})

const emit = defineEmits(['closed', 'history-download-requested'])
const { t, locale } = useI18n()
const { format: formatCurrency } = useCurrencyFormatter()

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

function close() {
    emit('closed')
}

function closeFromKeyboard(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    }
}

onMounted(() => document.addEventListener('keydown', closeFromKeyboard))
onBeforeUnmount(() => document.removeEventListener('keydown', closeFromKeyboard))
</script>

<template>
    <div class="modal-layer">
        <div class="modal-backdrop" aria-hidden="true"></div>

        <section
            class="history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
        >
            <button class="icon-button" type="button" :aria-label="t('subscription.modal.close')" @click="close">
                &times;
            </button>
            <p class="eyebrow">{{ t('subscription.modal.eyebrow') }}</p>
            <h2 id="history-modal-title">{{ t('subscription.history.title') }}</h2>

            <div class="history-list" role="table" :aria-label="t('subscription.history.ariaLabel')">
                <div v-for="item in activityRows" :key="item.id" class="activity-row" role="row">
                    <strong role="cell">{{ item.title }}</strong>
                    <span role="cell">{{ item.detail }}</span>
                </div>
            </div>

            <p v-if="downloaded" class="success-message" role="status" aria-live="polite">
                {{ t('subscription.history.downloaded') }}
            </p>

            <button class="primary-button" type="button" @click="emit('history-download-requested')">
                {{ t('subscription.history.downloadAction') }}
            </button>
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

.history-modal {
    position: relative;
    width: min(620px, 100%);
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

.history-list {
    display: grid;
    gap: 12px;
    margin-top: 22px;
}

.activity-row {
    display: grid;
    gap: 8px;
    border: 1px solid var(--color-inner-bg);
    border-radius: 12px;
    background: #fffdfa;
    padding: 14px 16px;
}

.activity-row strong {
    color: #080604;
    font-size: 14px;
    line-height: 1.3;
}

.activity-row span {
    color: #716861;
    font-size: 13px;
    line-height: 1.45;
}

.success-message {
    border: 1px solid #bee3cb;
    border-radius: 12px;
    background: #f2fbf5;
    color: #004e1d;
    font-size: 13px;
    line-height: 1.45;
    margin: 14px 0 0;
    padding: 14px 16px;
}

.primary-button {
    width: 100%;
    min-height: 58px;
    border: 0;
    border-radius: 999px;
    background: var(--color-primary);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    margin-top: 16px;
    padding: 0 30px;
    box-shadow: 0 14px 28px rgb(243 131 19 / 28%);
}

button:focus-visible {
    outline: 3px solid rgb(243 131 19 / 32%);
    outline-offset: 3px;
}

@media (max-width: 640px) {
    .modal-layer {
        align-items: end;
        padding: 12px;
    }

    .history-modal {
        padding: 24px 18px;
    }
}
</style>
