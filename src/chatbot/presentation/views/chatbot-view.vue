<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import useChatbotStore from '../../application/chatbot.store.js'
import useProfileStore from '@/profile/application/profile.store.js'
import { ChatbotApi } from '../../infrastructure/chatbot-api.js'
import QrConnectionCard    from '../components/qr-connection-card.vue'
import WhatsappStatusCard  from '../components/whatsapp-status-card.vue'

const { t } = useI18n()
const store = useChatbotStore()
const profileStore = useProfileStore()
const api = new ChatbotApi()

const justConnected = ref(false)
const qrDataUrl     = ref(null)
let qrPollId = null

const chatbotAllowed = computed(() => profileStore.profile.plan !== 'Free')

function startQrPolling(sellerId) {
  stopQrPolling()
  console.log('[QR] iniciando polling para sellerId', sellerId)
  function poll() {
    api.getWhatsappQr(sellerId).then(res => {
      const qr = res.data?.qr ?? null
      console.log('[QR] recibido:', qr ? 'data URL (' + qr.length + ' chars)' : 'null')
      qrDataUrl.value = qr
    }).catch(err => {
      console.error('[QR] error en polling:', err?.response?.status, err?.message)
    })
  }
  poll()
  qrPollId = setInterval(poll, 5000)
}

function stopQrPolling() {
  if (qrPollId) { clearInterval(qrPollId); qrPollId = null }
  qrDataUrl.value = null
}

watch(() => store.session, (session) => {
  console.log('[QR] watch session:', session?.status, 'sellerId:', session?.sellerId)
  if (session && session.status !== 'connected' && session.sellerId) {
    startQrPolling(session.sellerId)
  } else {
    stopQrPolling()
  }
}, { immediate: true, deep: true })

onMounted(() => {
  if (chatbotAllowed.value) {
    store.loadSession()
  }
})

onUnmounted(() => {
  stopQrPolling()
})

function onScanned() {
  store.simulateScan()
  justConnected.value = true
}

function onReconnect() {
  store.simulateDisconnect()
  justConnected.value = false
}
</script>

<template>
  <div class="chatbot-page">
    <header class="chatbot-page__header">
      <h1 class="chatbot-page__title">{{ t('chatbot.page.title') }}</h1>
      <p class="chatbot-page__subtitle">{{ t('chatbot.page.subtitle') }}</p>
    </header>

    <section v-if="!chatbotAllowed" class="upgrade-card" aria-labelledby="chatbot-upgrade-title">
      <div class="upgrade-card__icon" aria-hidden="true">QR</div>
      <div class="upgrade-card__content">
        <p class="upgrade-card__eyebrow">{{ t('chatbot.upgrade.eyebrow') }}</p>
        <h2 id="chatbot-upgrade-title">{{ t('chatbot.upgrade.title') }}</h2>
        <p>{{ t('chatbot.upgrade.description') }}</p>
        <ul>
          <li>{{ t('chatbot.upgrade.features.automation') }}</li>
          <li>{{ t('chatbot.upgrade.features.orders') }}</li>
          <li>{{ t('chatbot.upgrade.features.receipts') }}</li>
        </ul>
        <RouterLink class="upgrade-card__action" to="/subscription">
          {{ t('chatbot.upgrade.action') }}
        </RouterLink>
      </div>
    </section>

    <p v-else-if="!store.isSessionLoaded" class="chatbot-page__loading">
      {{ t('chatbot.page.loading') }}
    </p>

    <template v-else-if="!store.session || store.session?.status === 'disconnected'">
      <div class="chatbot-page__card">
        <QrConnectionCard :has-error="false" :qr-data-url="qrDataUrl" @scanned="onScanned" />
      </div>
    </template>

    <template v-else>
      <p class="chatbot-page__sub">{{ t('chatbot.page.connectionStatus') }}</p>
      <WhatsappStatusCard
        :session="store.session"
        :just-connected="justConnected"
        @reconnect="onReconnect"
      />
    </template>
  </div>
</template>

<style scoped>
.chatbot-page {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
}
.chatbot-page__header {
  margin-bottom: 1.5rem;
}
.chatbot-page__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
}
.chatbot-page__subtitle {
  margin: 0;
  max-width: 42rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #6b7280;
}
.chatbot-page__loading {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #9ca3af;
}
.chatbot-page__sub {
  margin: 0.25rem 0 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}
.chatbot-page__card {
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
}
.upgrade-card {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  max-width: 54rem;
  padding: 1.5rem;
  border: 1px solid #fde3bf;
  border-radius: 1rem;
  background: #fffcf5;
  box-shadow: 0 18px 40px rgb(17 24 39 / 0.08);
}
.upgrade-card__icon {
  display: grid;
  place-items: center;
  flex: 0 0 3.5rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: #ff7a00;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.upgrade-card__content {
  display: grid;
  gap: 0.75rem;
}
.upgrade-card__eyebrow {
  width: fit-content;
  margin: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #f2ebe8;
  color: #511e00;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.upgrade-card h2 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
}
.upgrade-card p {
  margin: 0;
  color: #5f6368;
  line-height: 1.6;
}
.upgrade-card ul {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.upgrade-card li {
  color: #511e00;
  font-size: 0.9375rem;
}
.upgrade-card li::before {
  content: "✓";
  margin-right: 0.5rem;
  color: #ff7a00;
  font-weight: 800;
}
.upgrade-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 2.75rem;
  padding: 0 1.25rem;
  border-radius: 999px;
  background: #ff7a00;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 12px 24px rgb(255 122 0 / 0.24);
}
@media (max-width: 720px) {
  .chatbot-page {
    padding: 1rem;
  }
  .upgrade-card {
    flex-direction: column;
  }
}
</style>
