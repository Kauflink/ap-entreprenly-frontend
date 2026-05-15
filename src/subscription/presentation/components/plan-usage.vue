<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    limits:     { type: Array, required: true },
    planStatus: { type: String, required: true }
})

const { t } = useI18n()

const controlPlanAccessEnabled = computed(() =>
    ['active', 'scheduled-cancellation'].includes(props.planStatus)
)
const statusLabelKey = computed(() =>
    controlPlanAccessEnabled.value
        ? 'subscription.usage.status.control'
        : 'subscription.usage.status.free'
)

function limitLabelKey(limit) {
    return `subscription.limits.${limit.id}.label`
}

function limitAriaLabelKey(limit) {
    return `subscription.limits.${limit.id}.ariaLabel`
}

function limitValueLabelKey(limit) {
    if (limit.id === 'products') return 'subscription.usage.limitValue.products'
    if (limit.id === 'active-batches') return 'subscription.usage.limitValue.active-batches'
    if (limit.id === 'users') {
        return limit.usedValue === 1
            ? 'subscription.usage.limitValue.users-singular'
            : 'subscription.usage.limitValue.users-plural'
    }

    return 'subscription.usage.limitValue.generic'
}

function progressValue(limit) {
    if (controlPlanAccessEnabled.value && limit.maxValue <= 0) return 100
    return limit.percentageUsed
}
</script>

<template>
    <section class="usage-panel" aria-labelledby="usage-title">
        <div class="section-heading">
            <div>
                <p class="eyebrow">{{ t('subscription.usage.eyebrow') }}</p>
                <h2 id="usage-title">{{ t('subscription.usage.title') }}</h2>
            </div>
            <span class="mini-badge">{{ t(statusLabelKey) }}</span>
        </div>

        <div class="limits-list">
            <article v-for="limit in limits" :key="limit.id" class="limit-item">
                <div class="limit-item__header">
                    <h3>{{ t(limitLabelKey(limit)) }}</h3>
                    <p v-if="controlPlanAccessEnabled">
                        {{ t(limitValueLabelKey(limit), { count: limit.usedValue }) }}
                    </p>
                    <p v-else>
                        {{ t('subscription.usage.counter', { used: limit.usedValue, max: limit.maxValue }) }}
                    </p>
                </div>
                <div
                    class="progress-track"
                    role="progressbar"
                    :aria-label="t(limitAriaLabelKey(limit))"
                    :aria-valuenow="limit.usedValue"
                    aria-valuemin="0"
                    :aria-valuemax="limit.maxValue > 0 ? limit.maxValue : undefined"
                >
                    <span class="progress-fill" :style="{ width: `${progressValue(limit)}%` }"></span>
                </div>
            </article>
        </div>
    </section>
</template>

<style scoped>
.usage-panel {
    min-height: 360px;
    border: 1px solid var(--color-card-border);
    border-radius: 18px;
    background: var(--color-card-bg);
    box-shadow: 0 18px 34px rgb(53 48 43 / 10%);
    padding: 22px 18px 18px;
}

.section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
}

.eyebrow,
.mini-badge {
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

.mini-badge {
    background: #eaf7ef;
    color: #004e1d;
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

.limits-list {
    display: grid;
    gap: 16px;
    margin-top: 22px;
}

.limit-item {
    border: 1px solid var(--color-inner-bg);
    border-radius: 14px;
    padding: 16px 14px;
}

.limit-item__header {
    display: flex;
    justify-content: space-between;
    gap: 14px;
}

.limit-item h3 {
    font-size: 16px;
    font-weight: 800;
    line-height: 1.25;
}

.limit-item p {
    color: #3f342e;
    font-size: 14px;
}

.progress-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: #f4efea;
    margin-top: 12px;
}

.progress-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
}
</style>
