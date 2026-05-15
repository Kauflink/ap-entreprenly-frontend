<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    mode:         { type: String, required: true },
    currentPlan:  { type: Object, required: true },
    billingCycle: { type: String, required: true }
})

const emit = defineEmits(['closed', 'cancellation-confirmed', 'keep-plan-confirmed'])
const { t, locale } = useI18n()

function toLocalDate(dateValue) {
    const [year, month, day] = String(dateValue ?? '').split('-').map(value => Number(value))
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

function formatPlanDate(dateValue, currentLocale, fallback) {
    const date = dateValue instanceof Date ? dateValue : toLocalDate(dateValue)

    if (date === null) return fallback

    return new Intl.DateTimeFormat(String(currentLocale ?? 'en').startsWith('es') ? 'es-PE' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

function addMonthsPreservingMonthEnd(date, months) {
    const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + months, 1)
    const originalMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const targetMonthLastDay = new Date(
        targetMonthStart.getFullYear(),
        targetMonthStart.getMonth() + 1,
        0
    ).getDate()
    const targetDay = date.getDate() === originalMonthLastDay
        ? targetMonthLastDay
        : Math.min(date.getDate(), targetMonthLastDay)

    return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), targetDay)
}

const titleKey = computed(() => {
    switch (props.mode) {
        case 'renew': return 'subscription.planAction.renew.title'
        case 'cancel': return 'subscription.planAction.cancel.title'
        case 'cancel-success': return 'subscription.planAction.cancelSuccess.title'
        case 'keep': return 'subscription.planAction.keep.title'
        default: return 'subscription.planAction.renew.title'
    }
})
const cardTitleKey = computed(() => {
    switch (props.mode) {
        case 'renew': return 'subscription.planAction.renew.cardTitle'
        case 'cancel': return 'subscription.planAction.cancel.cardTitle'
        case 'cancel-success': return 'subscription.planAction.cancelSuccess.cardTitle'
        case 'keep': return 'subscription.planAction.keep.cardTitle'
        default: return 'subscription.planAction.renew.cardTitle'
    }
})
const cardDescriptionKey = computed(() => {
    switch (props.mode) {
        case 'renew': return 'subscription.planAction.renew.cardDescription'
        case 'cancel': return 'subscription.planAction.cancel.cardDescription'
        case 'cancel-success': return 'subscription.planAction.cancelSuccess.cardDescription'
        case 'keep': return 'subscription.planAction.keep.cardDescription'
        default: return 'subscription.planAction.renew.cardDescription'
    }
})
const primaryLabelKey = computed(() => {
    switch (props.mode) {
        case 'renew':
        case 'cancel-success':
            return 'subscription.planAction.understood'
        case 'cancel':
            return 'subscription.planAction.confirmCancellation'
        case 'keep':
            return 'subscription.planAction.keepPlan'
        default:
            return 'subscription.planAction.understood'
    }
})
const currentPeriodEndLabel = computed(() =>
    formatPlanDate(
        props.currentPlan.currentPeriodEndDate,
        locale.value,
        t('subscription.planAction.fallbackDate')
    )
)
const renewedPeriodEndLabel = computed(() =>
    formatPlanDate(renewedPeriodEndDate.value, locale.value, t('subscription.planAction.fallbackDate'))
)
const renewedPeriodEndDate = computed(() => {
    const currentPeriodEndDate = toLocalDate(props.currentPlan.currentPeriodEndDate)

    if (currentPeriodEndDate === null) return null

    return props.billingCycle === 'annual'
        ? addMonthsPreservingMonthEnd(currentPeriodEndDate, 12)
        : addMonthsPreservingMonthEnd(currentPeriodEndDate, 1)
})
const cardDescriptionParams = computed(() => ({
    date: props.mode === 'renew' ? renewedPeriodEndLabel.value : currentPeriodEndLabel.value
}))

function close() {
    emit('closed')
}

function closeFromKeyboard(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    }
}

function confirmPrimaryAction() {
    switch (props.mode) {
        case 'cancel':
            emit('cancellation-confirmed')
            return
        case 'keep':
            emit('keep-plan-confirmed')
            return
        case 'renew':
        case 'cancel-success':
            close()
            return
        default:
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
            class="plan-action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-action-modal-title"
        >
            <button class="icon-button" type="button" :aria-label="t('subscription.modal.close')" @click="close">
                &times;
            </button>
            <p class="eyebrow">{{ t('subscription.modal.eyebrow') }}</p>
            <h2 id="plan-action-modal-title">{{ t(titleKey) }}</h2>

            <article class="message-card">
                <div>
                    <h3>{{ t(cardTitleKey) }}</h3>
                    <p>{{ t(cardDescriptionKey, cardDescriptionParams) }}</p>
                </div>
                <button class="primary-button" type="button" @click="confirmPrimaryAction">
                    {{ t(primaryLabelKey) }}
                </button>
            </article>
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

.plan-action-modal {
    position: relative;
    width: min(640px, 100%);
    border-radius: 28px;
    background: #ffffff;
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
    border: 1px solid #eadbd0;
    border-radius: 50%;
    background: #ffffff;
    color: #5a260f;
    cursor: pointer;
    font: inherit;
    font-size: 24px;
    line-height: 1;
}

.eyebrow {
    display: inline-flex;
    border-radius: 999px;
    background: #f0e8e3;
    color: #5a260f;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.4px;
    line-height: 1;
    margin: 0 0 18px;
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
    line-height: 1.14;
    padding-right: 48px;
}

h3 {
    font-size: 16px;
    font-weight: 850;
    line-height: 1.3;
}

.message-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 154px;
    border: 1px solid #eadbd0;
    border-radius: 18px;
    margin-top: 24px;
    padding: 24px;
}

.message-card p {
    max-width: 520px;
    color: #716861;
    font-size: 14px;
    line-height: 1.55;
    margin-top: 14px;
}

.primary-button {
    flex: 0 0 auto;
    min-height: 58px;
    border: 0;
    border-radius: 999px;
    background: #f38313;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 850;
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

    .plan-action-modal {
        padding: 24px 18px;
    }

    .message-card {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
