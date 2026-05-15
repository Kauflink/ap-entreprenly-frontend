<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useChatbotStore from '../../application/chatbot.store.js'
import QrConnectionCard    from '../components/qr-connection-card.vue'
import WhatsappStatusCard  from '../components/whatsapp-status-card.vue'

const { t } = useI18n()
const store = useChatbotStore()

const justConnected = ref(false)

onMounted(() => {
  store.loadSession()
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
    <h1 class="chatbot-page__title">{{ t('chatbot.page.title') }}</h1>

    <p v-if="!store.isSessionLoaded" class="chatbot-page__loading">
      {{ t('chatbot.page.loading') }}
    </p>

    <template v-else-if="!store.session || store.session?.status === 'disconnected'">
      <p class="chatbot-page__sub">{{ t('chatbot.page.connectPrompt') }}</p>
      <div class="chatbot-page__card">
        <QrConnectionCard :has-error="false" @scanned="onScanned" />
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
.chatbot-page__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
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
</style>
