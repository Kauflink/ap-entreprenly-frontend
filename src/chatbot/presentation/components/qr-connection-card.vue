<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  hasError: { type: Boolean, default: false }
})
const emit = defineEmits(['scanned'])

const { t } = useI18n()

const seconds      = ref(120)
const isExpired    = ref(false)
const sessionToken = ref(_generateToken())

const qrSrc = computed(() =>
  `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(sessionToken.value)}`
)

function _generateToken() {
  const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  const ts = Math.floor(Date.now() / 1000)
  return `WA-SESSION-${random}-${ts}`
}

let resetting = false
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    if (resetting) return

    if (seconds.value <= 1) {
      isExpired.value = true
      resetting = true

      setTimeout(() => {
        sessionToken.value = _generateToken()
        isExpired.value    = false
        seconds.value      = 120
        resetting          = false
      }, 3000)

      seconds.value = 0
      return
    }

    seconds.value--
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
        <img
          class="qr-img"
          :src="qrSrc"
          width="192"
          height="192"
          :alt="t('chatbot.qr.alt')"
        />
      </div>

      <p :class="['qr-timer', seconds <= 10 && !isExpired ? 'qr-timer--urgent' : '']">
        <template v-if="isExpired">{{ t('chatbot.qr.generating') }}</template>
        <template v-else-if="seconds === 1">{{ t('chatbot.qr.expiresInOne') }}</template>
        <template v-else>{{ t('chatbot.qr.expiresIn', { seconds }) }}</template>
      </p>

      <button class="qr-btn" type="button" @click="emit('scanned')">
        {{ t('chatbot.qr.simulateScan') }}
      </button>
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
  overflow: hidden;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.5rem;
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
