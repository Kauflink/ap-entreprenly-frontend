<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    hasItems:       { type: Boolean, default: false },
    selectedMethod: { type: String,  default: null  },
    showError:      { type: Boolean, default: false }
})

const emit = defineEmits(['method-selected', 'finalize-sale', 'cancel-sale'])
</script>

<template>
    <section class="card payment-card">
        <h2 class="card-title">
            <span class="title-icon">☀</span>
            {{ t('sales.payment.title') }}
        </h2>

        <div class="payment-buttons">
            <button
                class="payment-btn"
                :class="{ selected: selectedMethod === 'CASH' }"
                :disabled="!hasItems"
                @click="emit('method-selected', 'CASH')"
            >
                <span class="material-icons payment-icon">payments</span>
                <span class="payment-label">{{ t('sales.payment.cash') }}</span>
            </button>
            <button
                class="payment-btn"
                :class="{ selected: selectedMethod === 'DIGITAL' }"
                :disabled="!hasItems"
                @click="emit('method-selected', 'DIGITAL')"
            >
                <span class="material-icons payment-icon">point_of_sale</span>
                <span class="payment-label">{{ t('sales.payment.digital') }}</span>
            </button>
        </div>

        <div v-if="showError" class="payment-error">
            <span class="error-icon">⊘</span>
            {{ t('sales.payment.error') }}
        </div>
    </section>

    <button
        class="btn-finalize"
        :class="{ 'btn-finalize-inactive': !hasItems || selectedMethod === null }"
        @click="emit('finalize-sale')"
    >
        {{ t('sales.finalize') }}
    </button>
    <button class="btn-cancel" @click="emit('cancel-sale')">
        {{ t('sales.cancel') }}
    </button>
</template>

<style scoped>
.card {
    background: var(--color-card-bg);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.card-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-strong);
}
.title-icon { color: var(--color-primary); font-size: 16px; }

.payment-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.payment-btn {
    background: var(--color-inner-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 16px;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-strong);
    font-family: inherit;
    transition: all 0.2s ease;
}
.payment-btn:not(:disabled):hover { background: var(--color-theme-btn-active-bg); }
.payment-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.payment-btn.selected {
    background: var(--color-theme-btn-active-bg);
    color: var(--color-primary-hover);
    outline: 2px solid var(--color-primary);
}
.payment-icon { font-size: 40px; color: var(--color-text-strong); }
.payment-label { font-weight: 500; text-align: center; }

.payment-error {
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(237, 108, 2, 0.18);
    color: var(--color-warning);
    border-radius: 30px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}
.error-icon { font-size: 14px; font-weight: bold; }

.btn-finalize {
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 30px;
    padding: 14px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: background 0.2s ease;
}
.btn-finalize:not(.btn-finalize-inactive):hover { background: var(--color-primary-hover); }
.btn-finalize-inactive { opacity: 0.5; }

.btn-cancel {
    background: var(--color-card-bg);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-card-border);
    border-radius: 30px;
    padding: 14px;
    font-size: 15px;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: background 0.2s ease;
}
.btn-cancel:hover { background: var(--color-inner-bg); }
</style>
