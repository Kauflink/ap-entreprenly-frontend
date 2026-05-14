<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    product: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel'])

const display = ref('')

function pressDigit(digit) {
    display.value += String(digit)
}

function pressBackspace() {
    display.value = display.value.slice(0, -1)
}

function onConfirm() {
    const qty = parseInt(display.value || '0')
    if (qty > 0) emit('confirm', qty)
}

function onCancel() {
    emit('cancel')
}
</script>

<template>
    <div class="modal-backdrop" @click.self="onCancel">
        <div class="modal-card">
            <button class="close-btn" @click="onCancel">✕</button>

            <h2 class="modal-title">{{ t('sales.modal.quantity.title') }}</h2>
            <p class="modal-subtitle">{{ t('sales.modal.quantity.subtitle') }}</p>

            <div class="display-field">
                <span class="display-value">{{ display || '00' }}</span>
            </div>

            <div class="numpad">
                <button
                    v-for="n in [1,2,3,4,5,6,7,8,9]"
                    :key="n"
                    class="numpad-btn"
                    @click="pressDigit(n)"
                >{{ n }}</button>

                <button class="numpad-btn numpad-back" @click="pressBackspace">
                    <span class="material-icons" style="font-size:18px">backspace</span>
                </button>
                <button class="numpad-btn" @click="pressDigit(0)">0</button>
            </div>

            <button class="btn-confirm" @click="onConfirm">
                {{ t('sales.modal.quantity.confirm') }}
            </button>
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
    letter-spacing: 2px;
}

.numpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
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
