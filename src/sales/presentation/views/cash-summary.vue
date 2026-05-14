<script setup>
import { useI18n } from 'vue-i18n'
import useSalesStore from '@/sales/application/sales.store.js'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const store = useSalesStore()
const { totalDay, totalCash, totalDigital } = storeToRefs(store)
</script>

<template>
    <section class="cash-summary">
        <h2 class="cash-title">{{ t('sales.register.title') }}</h2>
        <p class="cash-subtitle">{{ t('sales.register.subtitle') }}</p>

        <div class="cash-widgets">
            <div class="cash-widget total-day">
                <p class="widget-label">
                    <span class="material-icons widget-icon">receipt</span>
                    {{ t('sales.register.totalDay') }}
                </p>
                <p class="widget-value">S/ {{ totalDay.toFixed(2) }}</p>
            </div>
            <div class="cash-widget">
                <p class="widget-label">
                    <span class="material-icons widget-icon">payments</span>
                    {{ t('sales.register.totalCash') }}
                </p>
                <p class="widget-value">S/ {{ totalCash.toFixed(2) }}</p>
            </div>
            <div class="cash-widget">
                <p class="widget-label">
                    <span class="material-icons widget-icon">point_of_sale</span>
                    {{ t('sales.register.totalDigital') }}
                </p>
                <p class="widget-value">S/ {{ totalDigital.toFixed(2) }}</p>
            </div>
        </div>
    </section>
</template>

<style scoped>
.cash-summary { display: block; margin-top: 24px; }

.cash-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 4px 0;
    color: var(--color-text-strong);
}
.cash-subtitle {
    color: var(--color-text-muted);
    margin: 0 0 16px 0;
    font-size: 15px;
}

.cash-widgets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}
.cash-widget {
    background: var(--color-card-bg);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.cash-widget.total-day {
    background: linear-gradient(to right, var(--color-primary) 0%, var(--color-text-secondary) 100%);
    color: #fff;
}
.cash-widget.total-day .widget-label,
.cash-widget.total-day .widget-value { color: #fff; }

.widget-label {
    font-size: 13px;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-muted);
}
.widget-icon { font-size: 18px; }
.widget-value {
    font-size: 28px;
    font-weight: bold;
    margin: 0;
    color: var(--color-text-strong);
}
</style>
