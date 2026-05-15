<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency, formatPlanDate } from '@/subscription/presentation/subscription-ui.js'

const props = defineProps({
    currentPlan:         { type: Object, required: true },
    recommendedPlan:     { type: Object, required: true },
    selectedCycle:       { type: String, required: true },
    controlPlanSelected: { type: Boolean, default: false }
})

const emit = defineEmits([
    'billing-cycle-selected',
    'control-plan-requested',
    'renewal-requested',
    'cancellation-requested',
    'keep-plan-requested'
])

const { t, locale } = useI18n()

const selectedPrice = computed(() =>
    props.selectedCycle === 'monthly'
        ? props.recommendedPlan.monthlyPrice
        : props.recommendedPlan.annualPrice
)
const formattedCurrentPlanPrice = computed(() => formatCurrency(props.currentPlan.monthlyPrice))
const formattedSelectedPrice = computed(() => formatCurrency(selectedPrice.value))
const selectedPriceLabelKey = computed(() =>
    props.selectedCycle === 'monthly'
        ? 'subscription.overview.priceLabel.monthly'
        : 'subscription.overview.priceLabel.annual'
)
const currentPlanPriceLabelKey = computed(() =>
    props.currentPlan.monthlyPrice === 0
        ? 'subscription.overview.priceLabel.free'
        : 'subscription.overview.priceLabel.monthly'
)
const planControlCurrentPlan = computed(() =>
    ['active', 'scheduled-cancellation'].includes(props.currentPlan.status)
)
const cancellationScheduled = computed(() =>
    props.currentPlan.status === 'scheduled-cancellation'
)
const cancellationActionLabelKey = computed(() =>
    cancellationScheduled.value
        ? 'subscription.overview.keepPlanAction'
        : 'subscription.overview.cancelAction'
)
const currentPlanDescriptionParams = computed(() => ({
    date: formatPlanDate(
        props.currentPlan.currentPeriodEndDate,
        locale.value,
        t('subscription.planAction.fallbackDate')
    )
}))

function planNameKey(plan) {
    return plan.id === 'plan-free'
        ? 'subscription.plans.free.name'
        : 'subscription.plans.control.name'
}

function currentPlanBadgeLabelKey(plan) {
    return plan.id === 'plan-free'
        ? 'subscription.plans.free.badge'
        : 'subscription.plans.current.badgeLabel'
}

function statusLabelKey(plan) {
    if (plan.status === 'free') return 'subscription.plans.free.status'
    return `subscription.plans.control.statusLabel.${plan.status}`
}

function shortDescriptionKey(plan) {
    if (plan.id === 'plan-free' || plan.status === 'free') {
        return 'subscription.plans.free.shortDescription'
    }

    return `subscription.plans.control.shortDescription.${plan.status}`
}

function featureKey(plan, index) {
    if (plan.id === 'plan-free') {
        return [
            'subscription.plans.free.features.basicInventory',
            'subscription.plans.free.features.manualMovements',
            'subscription.plans.free.features.noChatbot'
        ][index] ?? plan.features[index]?.description ?? ''
    }

    return [
        'subscription.plans.control.features.unlimitedProducts',
        'subscription.plans.control.features.salesOperations',
        'subscription.plans.control.features.chatbot'
    ][index] ?? plan.features[index]?.description ?? ''
}

function requestCancellationAction() {
    if (cancellationScheduled.value) {
        emit('keep-plan-requested')
        return
    }

    emit('cancellation-requested')
}
</script>

<template>
    <section class="panel plan-overview" aria-labelledby="subscription-plan-title">
        <div class="panel__header">
            <div>
                <p class="eyebrow">{{ t('subscription.overview.eyebrow') }}</p>
                <h2 id="subscription-plan-title">{{ t('subscription.overview.title') }}</h2>
                <p class="panel__intro">
                    {{ t('subscription.overview.description') }}
                </p>
            </div>
            <span class="status-badge" :class="{ 'status-badge--warning': cancellationScheduled }">
                {{ t(statusLabelKey(currentPlan)) }}
            </span>
        </div>

        <div class="plans-grid">
            <article class="plan-card" aria-labelledby="current-plan-title">
                <div class="plan-card__heading">
                    <div>
                        <p class="card-label">{{ t(currentPlanBadgeLabelKey(currentPlan)) }}</p>
                        <h3 id="current-plan-title">{{ t(planNameKey(currentPlan)) }}</h3>
                        <p>{{ t(shortDescriptionKey(currentPlan), currentPlanDescriptionParams) }}</p>
                    </div>
                    <div
                        class="price-box"
                        :aria-label="t('subscription.overview.priceAriaLabel', {
                            price: formattedCurrentPlanPrice,
                            label: t(currentPlanPriceLabelKey)
                        })"
                    >
                        <strong>{{ formattedCurrentPlanPrice }}</strong>
                        <span>{{ t(currentPlanPriceLabelKey) }}</span>
                    </div>
                </div>

                <ul class="feature-list">
                    <li v-for="(feature, index) in currentPlan.features" :key="feature.description">
                        <span class="material-icons" aria-hidden="true">check</span>
                        <span>{{ t(featureKey(currentPlan, index)) }}</span>
                    </li>
                </ul>

                <div v-if="planControlCurrentPlan" class="plan-card__actions">
                    <button class="secondary-primary-action" type="button" @click="emit('renewal-requested')">
                        {{ t('subscription.overview.renewAction') }}
                    </button>
                    <button
                        class="secondary-outline-action"
                        type="button"
                        @click="requestCancellationAction"
                    >
                        {{ t(cancellationActionLabelKey) }}
                    </button>
                </div>
            </article>

            <article
                class="plan-card plan-card--recommended"
                :class="{ 'plan-card--selected': controlPlanSelected }"
                aria-labelledby="recommended-plan-title"
            >
                <div class="plan-card__heading">
                    <div>
                        <p class="card-label card-label--accent">
                            {{ t('subscription.plans.control.badgeLabel') }}
                        </p>
                        <h3 id="recommended-plan-title">{{ t(planNameKey(recommendedPlan)) }}</h3>
                    </div>
                    <div class="recommended-price">
                        <strong>{{ formattedSelectedPrice }}</strong>
                        <span>{{ t(selectedPriceLabelKey) }}</span>
                    </div>
                </div>

                <div
                    class="billing-toggle"
                    :class="{ 'billing-toggle--annual': selectedCycle === 'annual' }"
                    role="group"
                    :aria-label="t('subscription.overview.billingFrequencyLabel')"
                >
                    <button
                        type="button"
                        :class="{ 'billing-toggle__button--active': selectedCycle === 'monthly' }"
                        :aria-pressed="selectedCycle === 'monthly'"
                        @click="emit('billing-cycle-selected', 'monthly')"
                    >
                        {{ t('subscription.overview.monthly') }}
                    </button>
                    <button
                        type="button"
                        :class="{ 'billing-toggle__button--active': selectedCycle === 'annual' }"
                        :aria-pressed="selectedCycle === 'annual'"
                        @click="emit('billing-cycle-selected', 'annual')"
                    >
                        {{ t('subscription.overview.annual') }}
                    </button>
                </div>

                <ul class="feature-list feature-list--recommended">
                    <li v-for="(feature, index) in recommendedPlan.features" :key="feature.description">
                        <span class="material-icons" aria-hidden="true">check</span>
                        <span>{{ t(featureKey(recommendedPlan, index)) }}</span>
                    </li>
                </ul>

                <button class="primary-action" type="button" @click="emit('control-plan-requested')">
                    {{ t('subscription.overview.upgradeAction') }}
                </button>
            </article>
        </div>
    </section>
</template>

<style scoped>
.panel {
    border: 1px solid var(--color-card-border);
    border-radius: 18px;
    background: var(--color-card-bg);
    box-shadow: 0 18px 34px rgb(53 48 43 / 12%);
}

.plan-overview {
    padding: 22px 18px 18px;
}

.panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
}

.eyebrow,
.card-label {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: var(--color-inner-bg);
    color: var(--color-label-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.4px;
    line-height: 1;
    margin: 0 0 14px;
    padding: 6px 14px;
    text-transform: uppercase;
}

.card-label {
    border-radius: 0;
    background: transparent;
    color: #a17a66;
    margin-bottom: 12px;
    padding: 0;
}

.card-label--accent {
    color: var(--color-primary);
}

h2,
h3,
p {
    margin: 0;
}

h2 {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.25;
}

h3 {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
}

.panel__intro {
    max-width: 760px;
    color: var(--color-text-muted);
    line-height: 1.8;
    margin-top: 16px;
}

.status-badge {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #e7f8ed;
    color: #075f24;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.4px;
    padding: 8px 14px;
    text-transform: uppercase;
}

.status-badge--warning {
    background: #fff7e9;
    color: #511e00;
}

.plans-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 18px;
    margin-top: 28px;
}

.plan-card {
    min-height: 330px;
    border: 1px solid #e8d8ce;
    border-radius: 18px;
    padding: 22px 20px;
}

.plan-card--recommended {
    background: #fff8e9;
    border-color: #fedcac;
}

.plan-card--selected {
    outline: 3px solid rgb(243 131 19 / 38%);
    outline-offset: 2px;
}

.plan-card__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
}

.plan-card__heading p:not(.card-label),
.feature-list {
    color: #5f5f5f;
    font-size: 14px;
}

.price-box {
    display: grid;
    min-width: 68px;
    justify-items: center;
    border: 1px solid #dcd5ce;
    border-radius: 14px;
    padding: 10px 12px;
}

.price-box strong,
.recommended-price strong {
    color: #431500;
    font-size: 24px;
    line-height: 1.1;
}

.price-box span,
.recommended-price span {
    color: #6a625b;
    font-size: 12px;
}

.recommended-price {
    display: grid;
    justify-items: end;
    min-width: 88px;
}

.billing-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    border: 1px solid #d6d2ce;
    border-radius: 999px;
    background: var(--color-card-bg);
    margin-top: 24px;
    padding: 4px;
}

.billing-toggle::before {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc((100% - 8px) / 2);
    height: calc(100% - 8px);
    border-radius: 999px;
    background: #fff7e1;
    content: '';
    transition: transform 160ms ease;
}

.billing-toggle--annual::before {
    transform: translateX(100%);
}

.billing-toggle button {
    position: relative;
    z-index: 1;
    min-width: 72px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #3f2d20;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    padding: 8px 14px;
}

.billing-toggle button:focus-visible,
.primary-action:focus-visible,
.secondary-primary-action:focus-visible,
.secondary-outline-action:focus-visible {
    outline: 3px solid rgb(243 131 19 / 38%);
    outline-offset: 3px;
}

.billing-toggle__button--active {
    color: #6f2700;
}

.feature-list {
    display: grid;
    gap: 18px;
    list-style: none;
    margin: 28px 0 0;
    padding: 0;
}

.feature-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.feature-list .material-icons {
    width: 18px;
    height: 18px;
    color: var(--color-primary);
    font-size: 18px;
}

.feature-list--recommended {
    margin-top: 24px;
}

.primary-action {
    width: 100%;
    min-height: 50px;
    border: 0;
    border-radius: 999px;
    background: var(--color-primary);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    margin-top: 28px;
    padding: 0 24px;
    box-shadow: 0 14px 28px rgb(243 131 19 / 28%);
}

.plan-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 26px;
}

.secondary-primary-action,
.secondary-outline-action {
    min-height: 50px;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    padding: 0 24px;
}

.secondary-primary-action {
    border: 0;
    background: var(--color-primary);
    color: #ffffff;
    box-shadow: 0 14px 28px rgb(243 131 19 / 28%);
}

.secondary-outline-action {
    border: 1px solid var(--color-card-border);
    background: var(--color-card-bg);
    color: var(--color-label-accent);
}

.primary-action:hover {
    background: #df7107;
}

@media (max-width: 940px) {
    .panel__header,
    .plan-card__heading {
        display: grid;
    }

    .plans-grid {
        grid-template-columns: 1fr;
    }

    .status-badge,
    .recommended-price {
        justify-self: start;
    }
}
</style>
