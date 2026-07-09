<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useSalesStore from '@/sales/application/sales.store.js'

const { t } = useI18n()
const store = useSalesStore()

const props = defineProps({
    product: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel'])

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const displayValue      = ref('')
const isScaleConnected  = ref(false)
const isWaitingForScale = ref(false)

let scaleTimer       = null
let autoConfirmTimer = null

// Parsed numeric weight.
const weight = computed(() => {
    const value = parseFloat(displayValue.value || '0')
    return isNaN(value) ? 0 : value
})

const hasInsufficientStock = computed(() =>
    props.product ? weight.value > props.product.availableStock : false
)

const canConfirm = computed(() => weight.value > 0 && !hasInsufficientStock.value)

onMounted(() => {
    checkScaleConnection()
})

onUnmounted(() => {
    clearTimeout(scaleTimer)
    clearTimeout(autoConfirmTimer)
})

function checkScaleConnection() {
    store.getScaleStatus().then(scale => {
        if (scale && scale.connected) {
            isScaleConnected.value = true
            simulateScaleReading()
        } else {
            isScaleConnected.value = false
        }
    }).catch(() => {
        isScaleConnected.value = false
    })
}

function simulateScaleReading() {
    isWaitingForScale.value = true
    scaleTimer = setTimeout(() => {
        const randomWeight = parseFloat((Math.random() * 2.5 + 0.5).toFixed(2))
        displayValue.value = String(randomWeight)
        isWaitingForScale.value = false

        // Auto-confirm after a short delay so the user sees the registered weight.
        autoConfirmTimer = setTimeout(() => {
            if (props.product && randomWeight <= props.product.availableStock) {
                emit('confirm', randomWeight)
            }
        }, 800)
    }, 1500)
}

function onKeyPress(key) {
    if (isScaleConnected.value) return
    if (displayValue.value.length >= 6) return
    displayValue.value += key
}

function onZeroPress() {
    if (isScaleConnected.value) return
    if (displayValue.value.length >= 6) return
    displayValue.value += '0'
}

function onDotPress() {
    if (isScaleConnected.value) return
    if (displayValue.value.includes('.')) return
    displayValue.value = displayValue.value.length === 0 ? '0.' : displayValue.value + '.'
}

function onBackspace() {
    if (isScaleConnected.value) return
    displayValue.value = displayValue.value.slice(0, -1)
}

function onConfirm() {
    if (!canConfirm.value) return
    emit('confirm', weight.value)
}

function onCancel() {
    emit('cancel')
}
</script>

<template>
    <div class="modal-backdrop" @click.self="onCancel">
        <div class="modal-content">
            <header class="modal-header">
                <div class="modal-title-wrapper">
                    <h2 class="modal-title">{{ t('sales.weight-modal.title') }}</h2>
                    <p class="modal-subtitle">
                        {{ isScaleConnected
                            ? t('sales.weight-modal.subtitleAuto')
                            : t('sales.weight-modal.subtitleManual') }}
                    </p>
                </div>
                <button class="close-btn" :aria-label="t('sales.weight-modal.title')" @click="onCancel">✕</button>
            </header>

            <div class="weight-display">
                <label class="display-label">{{ t('sales.weight-modal.label') }}</label>
                <div class="display-value" :class="{ waiting: isWaitingForScale }">
                    <template v-if="isWaitingForScale">{{ t('sales.weight-modal.waiting') }}</template>
                    <template v-else>{{ displayValue || '0.000' }}</template>
                </div>
            </div>

            <template v-if="!isScaleConnected">
                <div class="keypad">
                    <button
                        v-for="key in keypadKeys"
                        :key="key"
                        class="keypad-btn"
                        @click="onKeyPress(key)"
                    >{{ key }}</button>
                    <button class="keypad-btn keypad-dot" @click="onDotPress">.</button>
                    <button class="keypad-btn keypad-zero" @click="onZeroPress">0</button>
                    <button class="keypad-btn keypad-backspace" @click="onBackspace">◀</button>
                </div>

                <button class="confirm-btn" :disabled="!canConfirm" @click="onConfirm">
                    {{ t('sales.weight-modal.confirm') }}
                </button>

                <div v-if="hasInsufficientStock" class="error-message">
                    <span class="error-icon">⊘</span>
                    {{ t('sales.weight-modal.insufficientStock') }}
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

.modal-content {
    background: var(--color-card-bg);
    border-radius: 20px;
    padding: 28px;
    width: 380px;
    max-width: 90vw;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.25s ease;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 2px 0;
    color: var(--color-text-strong);
}

.modal-subtitle {
    font-size: 12px;
    color: var(--color-text-muted);
    margin: 0;
}

.close-btn {
    background: var(--color-card-border);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease;
}

.close-btn:hover { background: var(--color-card-border); }

.weight-display { margin-bottom: 16px; }

.display-label {
    display: block;
    font-size: 13px;
    color: var(--color-text-strong);
    font-weight: 600;
    margin-bottom: 6px;
}

.display-value {
    background: var(--color-bg-page);
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-strong);
    min-height: 24px;
}

.display-value.waiting {
    color: var(--color-text-muted);
    font-style: italic;
    font-size: 14px;
}

.keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
}

.keypad-btn {
    background: var(--color-bg-page);
    border: none;
    border-radius: 12px;
    padding: 16px 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-strong);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
}

.keypad-btn:hover {
    background: var(--color-theme-btn-active-bg);
    color: var(--color-primary-hover);
}

.keypad-btn:active {
    background: var(--color-primary);
    color: #fff;
    transform: scale(0.97);
}

.keypad-backspace {
    background: var(--color-primary);
    color: #fff;
}

.keypad-backspace:hover {
    background: var(--color-primary-hover);
    color: #fff;
}

.confirm-btn {
    width: 100%;
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s ease;
}

.confirm-btn:not(:disabled):hover { background: var(--color-primary-hover); }

.confirm-btn:disabled {
    background: var(--color-primary);
    cursor: not-allowed;
    opacity: 0.7;
}

.error-message {
    margin-top: 12px;
    padding: 10px 16px;
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-danger);
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.error-icon { font-size: 14px; font-weight: bold; }
</style>
