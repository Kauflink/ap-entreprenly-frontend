<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps({
  session:       { type: Object,  default: null  },
  justConnected: { type: Boolean, default: false }
})
const emit = defineEmits(['reconnect'])

const { t }  = useI18n()
const router = useRouter()
</script>

<template>
  <div>
    <div v-if="justConnected" class="alert alert--green">
      <p class="alert__title">{{ t('chatbot.statusCard.connectedTitle') }}</p>
      <p class="alert__detail">{{ t('chatbot.statusCard.connectedDetail') }}</p>
    </div>

    <div v-if="session?.status === 'expired'" class="alert alert--red">
      <p class="alert__title">{{ t('chatbot.statusCard.expiredTitle') }}</p>
      <p class="alert__detail">{{ t('chatbot.statusCard.expiredDetail') }}</p>
    </div>

    <div v-if="session" class="status-card">
      <div class="status-card__body">
        <div class="status-card__info">
          <p class="status-card__name">{{ t('chatbot.statusCard.cardTitle') }}</p>
          <p class="status-card__sub">
            {{ session.phone }}
            <template v-if="session.status === 'connected' && session.connectedAt">
              — {{ t('chatbot.statusCard.activeSince') }} {{ session.connectedAt }}
            </template>
            <template v-if="session.status === 'expired' && session.connectedAt">
              — {{ t('chatbot.statusCard.lastConnection') }} {{ session.connectedAt }}
            </template>
            <template v-if="session.businessName">
              · {{ session.businessName }}
            </template>
          </p>

          <template v-if="session.status === 'connected'">
            <p class="status-card__sub">{{ t('chatbot.statusCard.operative') }}</p>
            <div class="status-card__actions">
              <RouterLink to="/chatbot/conversations" class="btn btn--orange">
                {{ t('chatbot.statusCard.viewConversations') }}
              </RouterLink>
              <button type="button" class="btn btn--outline" @click="emit('reconnect')">
                {{ t('chatbot.statusCard.disconnect') }}
              </button>
            </div>
          </template>

          <template v-if="session.status === 'expired' || session.status === 'disconnected'">
            <button type="button" class="btn btn--outline-orange" @click="emit('reconnect')">
              {{ t('chatbot.statusCard.reconnect') }}
            </button>
          </template>
        </div>

        <span :class="['status-badge', session.status === 'connected' ? 'status-badge--green' : 'status-badge--red']">
          {{ session.status === 'connected' ? t('chatbot.statusCard.connected') : t('chatbot.statusCard.disconnected') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert {
  margin-bottom: 1rem;
  border-radius: 1rem;
  padding: 1rem;
}
.alert--green {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}
.alert--green .alert__title { font-weight: 600; color: #15803d; }
.alert--green .alert__detail { margin-top: 0.25rem; font-size: 0.875rem; color: #16a34a; }
.alert--red {
  border: 1px solid #fecaca;
  background: #fef2f2;
}
.alert--red .alert__title { font-weight: 600; color: #dc2626; }
.alert--red .alert__detail { margin-top: 0.25rem; font-size: 0.875rem; color: #ef4444; }

.status-card {
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 1.25rem;
}
.status-card__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.status-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.status-card__name {
  font-weight: 700;
  color: #111827;
}
.status-card__sub {
  font-size: 0.875rem;
  color: #6b7280;
}
.status-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.status-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-badge--green { background: #dcfce7; color: #16a34a; }
.status-badge--red   { background: #fee2e2; color: #ef4444; }

.btn {
  display: inline-block;
  border-radius: 9999px;
  padding: 0.375rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s, opacity 0.2s;
}
.btn--orange {
  background: #f97316;
  color: #fff;
}
.btn--orange:hover { background: #ea6c0a; }
.btn--outline {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.btn--outline:hover { background: #f9fafb; }
.btn--outline-orange {
  background: #fff;
  color: #f97316;
  border: 1px solid #f97316;
  margin-top: 0.75rem;
}
.btn--outline-orange:hover { background: #fff7ed; }
</style>
