<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  hasError:   { type: Boolean, default: false },
  qrDataUrl:  { type: String,  default: null  }
})
const emit = defineEmits(['scanned'])

const { t } = useI18n()

const seconds   = ref(20)
const isExpired = ref(false)
let intervalId  = null

watch(() => props.qrDataUrl, (newQr) => {
  if (newQr) {
    isExpired.value = false
    seconds.value   = 20
  }
})

onMounted(() => {
  intervalId = setInterval(() => {
    if (seconds.value <= 1) {
      isExpired.value = true
      seconds.value   = 0
    } else {
      seconds.value--
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div>
    <div v-if="isExpired || hasError" class="qr-error-box">
      <p class="qr-error-title">{{ t('chatbot.qr.expiredTitle') }}</p>
      <p class="qr-error-detail">{{ t('chatbot.qr.expiredDetail') }}</p>
    </div>

    <div class="qr-center">
      <h2 class="qr-heading">
        {{ isExpired || hasError ? t('chatbot.qr.newCode') : t('chatbot.qr.linkTitle') }}
      </h2>
      <p class="qr-sub">{{ t('chatbot.qr.scanInstruction') }}</p>

      <div class="qr-frame">
        <div v-if="!qrDataUrl" class="qr-loading" aria-label="Generando QR">
          <span class="qr-loading__dot" style="animation-delay:0ms"></span>
          <span class="qr-loading__dot" style="animation-delay:200ms"></span>
          <span class="qr-loading__dot" style="animation-delay:400ms"></span>
        </div>
        <img
          v-else
          class="qr-img"
          :src="qrDataUrl"
          width="192"
          height="192"
          :alt="t('chatbot.qr.alt')"
        />
      </div>

      <p :class="['qr-timer', seconds <= 5 && !isExpired && qrDataUrl ? 'qr-timer--urgent' : '']">
        <template v-if="!qrDataUrl">{{ t('chatbot.qr.generating') }}</template>
        <template v-else-if="isExpired">{{ t('chatbot.qr.generating') }}</template>
        <template v-else-if="seconds === 1">{{ t('chatbot.qr.expiresInOne') }}</template>
        <template v-else>{{ t('chatbot.qr.expiresIn', { seconds }) }}</template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.qr-error-box {
  margin: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  padding: 1rem;
}
.qr-error-title {
  font-weight: 600;
  color: #dc2626;
}
.qr-error-detail {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}
.qr-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 5rem 0;
}
.qr-heading {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}
.qr-sub {
  font-size: 0.875rem;
  color: #6b7280;
}
.qr-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.5rem;
  width: 208px;
  height: 208px;
}
.qr-loading {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.qr-loading__dot {
  display: block;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  background: #d1d5db;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1);   }
}
.qr-img {
  display: block;
  width: 192px;
  height: 192px;
}
.qr-timer {
  font-size: 0.875rem;
  color: #9ca3af;
}
.qr-timer--urgent {
  font-weight: 500;
  color: #f87171;
}
.qr-btn {
  margin-top: 0.5rem;
  border-radius: 9999px;
  background: #22c55e;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.qr-btn:hover {
  background: #16a34a;
}
</style>
