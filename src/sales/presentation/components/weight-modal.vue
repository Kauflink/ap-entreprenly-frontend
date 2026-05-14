<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    product: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel'])

const mode    = ref('scale') // 'scale' | 'manual'
const display = ref('')

let scaleTimer = null

onMounted(() => {
    scaleTimer = setTimeout(() => { mode.value = 'manual' }, 3000)
})

onUnmounted(() => {
    clearTimeout(scaleTimer)
})

function switchToManual() {
    clearTimeout(scaleTimer)
    mode.value = 'manual'
}

function pressDigit(digit) {
    display.value += String(digit)
}

function pressDecimal() {
    if (!display.value.includes('.')) {
        display.value = (display.value || '0') + '.'
    }
}

function pressBackspace() {
    display.value = display.value.slice(0, -1)
}

function onConfirm() {
    const weight = parseFloat(display.value || '0')
    if (weight > 0) emit('confirm', weight)
}

function onCancel() {
    emit('cancel')
}
</script>

<template>
    <div class="modal-backdrop" @click.self="onCancel">
        <div class="modal-card">
            <button class="close-btn" @click="onCancel">✕</button>

            <h2 class="modal-title">{{ t('sales.modal.weight.title') }}</h2>

            <!-- Scale waiting mode -->
            <template v-if="mode === 'scale'">
                <p class="modal-subtitle">{{ t('sales.modal.weight.subtitleScale') }}</p>
                <div class="scale-input-wrap">
                    <input
                        class="scale-input"
                        :placeholder="t('sales.modal.weight.scalePlaceholder')"
                        disabled
                    />
                </div>
                <button class="btn-manual-link" @click="switchToManual">
                    {{ t('sales.modal.weight.enterManually') }}
                </button>
            </template>

            <!-- Manual numpad mode -->
            <template v-else>
                <p class="modal-subtitle">{{ t('sales.modal.weight.subtitleManual') }}</p>

                <div class="input-group">
                    <label class="input-label">{{ t('sales.modal.weight.label') }}</label>
                    <div class="display-field">
                        <span class="display-value">{{ display || '0.000' }}</span>
                    </div>
                </div>

                <div class="numpad">
                    <button
                        v-for="n in [1,2,3,4,5,6,7,8,9]"
                        :key="n"
                        class="numpad-btn"
                        @click="pressDigit(n)"
                    >{{ n }}</button>

                    <button class="numpad-btn" @click="pressDecimal">.</button>
                    <button class="numpad-btn" @click="pressDigit(0)">0</button>
                </div>

                <div class="numpad numpad-single">
                    <button class="numpad-btn numpad-back" @click="pressBackspace">
                        <span class="material-icons" style="font-size:18px">backspace</span>
                    </button>
                </div>

                <button class="btn-confirm" @click="onConfirm">
                    {{ t('sales.modal.weight.confirm') }}
                </button>
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
}

.modal-card {
    background: var(--color-card-bg);
    border-radius: 20px;
    padding: 28px 32px 24px;
    width: 380px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.close-btn {
    position: absolute;
    top: 14px; right: 14px;
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
}
.close-btn:hover { background: var(--color-card-border); }

.modal-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: var(--color-text-strong);
    padding-right: 32px;
}
.modal-subtitle {
    margin: -8px 0 0;
    font-size: 13px;
    color: var(--color-text-muted);
}

/* Scale mode */
.scale-input-wrap { margin-top: 4px; }
.scale-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--color-card-border);
    border-radius: 10px;
    background: var(--color-inner-bg);
    color: var(--color-text-muted);
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    cursor: not-allowed;
}
.scale-input::placeholder { color: var(--color-text-muted); font-style: italic; }

.btn-manual-link {
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    text-decoration: underline;
    padding: 0;
    align-self: center;
}

/* Manual mode */
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
}
.display-field {
    background: var(--color-inner-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 10px;
    padding: 12px 16px;
    text-align: right;
}
.display-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-strong);
    letter-spacing: 1px;
}

.numpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}
.numpad-single {
    grid-template-columns: 1fr;
}

.numpad-btn {
    background: var(--color-inner-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 10px;
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
.numpad-btn:hover { background: var(--color-theme-btn-active-bg); }
.numpad-btn:active { background: var(--color-card-border); }

.numpad-back {
    background: rgba(243, 131, 19, 0.12);
    color: var(--color-primary);
    border-color: rgba(243, 131, 19, 0.3);
}
.numpad-back:hover { background: rgba(243, 131, 19, 0.22); }

.btn-confirm {
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 30px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: background 0.2s;
    margin-top: 4px;
}
.btn-confirm:hover { background: var(--color-primary-hover); }
</style>
