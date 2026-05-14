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

const isScaleConnected = ref(false)
const displayValue     = ref('')

let scaleTimer = null

const hasInsufficientStock = computed(() => {
    if (!props.product || !displayValue.value) return false
    return parseFloat(displayValue.value) > props.product.stockKg
})

onMounted(() => {
    checkScaleConnection()
})

onUnmounted(() => {
    clearTimeout(scaleTimer)
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
    scaleTimer = setTimeout(() => {
        displayValue.value = (Math.random() * 4 + 0.1).toFixed(3)
    }, 2000)
}

function pressDigit(digit) {
    displayValue.value += String(digit)
}

function pressDecimal() {
    if (!displayValue.value.includes('.')) {
        displayValue.value = (displayValue.value || '0') + '.'
    }
}

function pressBackspace() {
    displayValue.value = displayValue.value.slice(0, -1)
}

function onConfirm() {
    const weight = parseFloat(displayValue.value || '0')
    if (weight > 0 && !hasInsufficientStock.value) emit('confirm', weight)
}

function onCancel() {
    emit('cancel')
}
</script>

<template>
    <div class="modal-backdrop" @click.self="onCancel">
        <div class="modal-card">
            <header class="modal-header">
                <div>
                    <h2 class="modal-title">{{ t('sales.weight-modal.title') }}</h2>
                    <p class="modal-subtitle">
                        {{ isScaleConnected
                            ? t('sales.weight-modal.subtitleAuto')
                            : t('sales.weight-modal.subtitleManual') }}
                    </p>
                </div>
                <button class="close-btn" @click="onCancel">✕</button>
            </header>

            <!-- Scale connected: show waiting state -->
            <template v-if="isScaleConnected && !displayValue">
                <div class="scale-waiting">
                    <span class="material-icons scale-icon">scale</span>
                    <p class="waiting-text">{{ t('sales.weight-modal.waiting') }}</p>
                </div>
            </template>

            <!-- Manual numpad (or scale result) -->
            <template v-else>
                <div class="input-group">
                    <label class="input-label">{{ t('sales.weight-modal.label') }}</label>
                    <div class="display-field">
                        <span class="display-value">{{ displayValue || '0.000' }}</span>
                    </div>
                </div>

                <div v-if="hasInsufficientStock" class="stock-error">
                    <span class="error-icon">⊘</span>
                    {{ t('sales.weight-modal.insufficientStock') }}
                </div>

                <div class="keypad">
                    <button
                        v-for="n in [1,2,3,4,5,6,7,8,9]"
                        :key="n"
                        class="keypad-btn"
                        @click="pressDigit(n)"
                    >{{ n }}</button>

                    <button class="keypad-btn" @click="pressDecimal">.</button>
                    <button class="keypad-btn" @click="pressDigit(0)">0</button>
                    <button class="keypad-btn keypad-backspace" @click="pressBackspace">◀</button>
                </div>

                <button
                    class="btn-confirm"
                    :disabled="hasInsufficientStock || !displayValue"
                    @click="onConfirm"
                >
                    {{ t('sales.weight-modal.confirm') }}
                </button>
            </template>
        </div>
    </div>
</template>

<style scoped>
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes slideIn {
    from { transform: translateY(30px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
}

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

.modal-card {
    background: var(--color-card-bg);
    border-radius: 20px;
    padding: 28px 32px 24px;
    width: 380px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    animation: slideIn 0.25s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 4px 0;
    color: var(--color-text-strong);
}
.modal-subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-muted);
}

.close-btn {
    background: var(--color-inner-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 50%;
    width: 32px; height: 32px;
    cursor: pointer;
    font-size: 13px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.close-btn:hover { background: var(--color-card-border); }

/* Scale waiting */
.scale-waiting {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 0;
}
.scale-icon {
    font-size: 48px;
    color: var(--color-primary);
    animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
}
.waiting-text {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-muted);
    font-style: italic;
}

/* Manual mode */
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
}
.display-field {
    background: var(--color-bg-page);
    border: 1px solid var(--color-card-border);
    border-radius: 10px;
    padding: 12px 16px;
    text-align: right;
}
.display-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--color-text-strong);
    letter-spacing: 1px;
}

.stock-error {
    padding: 8px 14px;
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-danger);
    border-radius: 30px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}
.error-icon { font-size: 14px; font-weight: bold; }

.keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.keypad-btn {
    background: var(--color-bg-page);
    border: 1px solid var(--color-card-border);
    border-radius: 12px;
    padding: 14px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    color: var(--color-text-strong);
    font-family: inherit;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.keypad-btn:hover { background: var(--color-theme-btn-active-bg); }
.keypad-btn:active { background: var(--color-card-border); }

.keypad-backspace {
    background: rgba(243, 131, 19, 0.12);
    color: var(--color-primary);
    border-color: rgba(243, 131, 19, 0.3);
}
.keypad-backspace:hover { background: rgba(243, 131, 19, 0.22); }

.btn-confirm {
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: background 0.2s;
    margin-top: 4px;
}
.btn-confirm:not(:disabled):hover { background: var(--color-primary-hover); }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
