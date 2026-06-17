<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useChatbotStore from '@/chatbot/application/chatbot.store.js'
import useProfileStore from '@/profile/application/profile.store.js'

const { t, locale } = useI18n()
const store = useChatbotStore()
const router = useRouter()
const profileStore = useProfileStore()

// ── Computed ───────────────────────────────────────────────────────────────────
const allOrders = computed(() =>
  [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

const chatbotAllowed = computed(() => profileStore.profile.plan !== 'Free')

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!chatbotAllowed.value) {
    router.replace('/chatbot')
    return
  }

  store.loadSession()
  store.loadOrders()
  store.loadConversations()
  store.loadInventoryProducts()
})

// ── Helpers ────────────────────────────────────────────────────────────────────
function clientName(order) {
  return store.conversations.find(c => c.id === order.conversationId)?.clientName ?? 'Cliente'
}

function formatDate(dateStr) {
  const loc = locale.value === 'en' ? 'en-US' : 'es-PE'
  return new Date(dateStr).toLocaleString(loc, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function borderClass(status) {
  if (status === 'CONFIRMED') return 'order-card--green'
  if (status === 'BLOCKED')   return 'order-card--red'
  if (status === 'CANCELLED') return 'order-card--gray'
  return 'order-card--orange'
}

function badgeClass(status, hasReceipt) {
  if (status === 'CONFIRMED')                           return 'badge badge--green'
  if (status === 'BLOCKED')                             return 'badge badge--red'
  if (status === 'CANCELLED')                           return 'badge badge--gray'
  if (status === 'WAITING_PAYMENT' && hasReceipt)       return 'badge badge--orange'
  return 'badge badge--gray'
}

function badgeLabel(status, hasReceipt) {
  if (status === 'CONFIRMED')                       return t('chatbot.orders.status.approved')
  if (status === 'BLOCKED')                         return t('chatbot.orders.status.blocked')
  if (status === 'CANCELLED')                       return t('chatbot.orders.status.cancelled')
  if (status === 'WAITING_PAYMENT' && hasReceipt)  return t('chatbot.orders.status.receiptReceived')
  if (status === 'WAITING_PAYMENT' && !hasReceipt) return t('chatbot.orders.status.awaitingReceipt')
  return status
}

function approve(id) { store.approveOrder(id) }
function reject(id)  { store.rejectOrder(id) }
</script>

<template>
  <div class="orders-page">

    <div class="orders-header">
      <h1 class="orders-title">{{ t('chatbot.orders.title') }}</h1>
      <p class="orders-sub">{{ t('chatbot.orders.subtitle') }}</p>
    </div>

    <!-- Desconectado -->
    <div v-if="!store.isConnected" class="empty-card">
      <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
      <p class="empty-text">{{ t('chatbot.orders.connectPrompt') }}</p>
      <RouterLink to="/chatbot" class="empty-link">{{ t('chatbot.orders.goToConfig') }}</RouterLink>
    </div>

    <!-- Sin pedidos -->
    <div v-else-if="allOrders.length === 0" class="empty-card">
      <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="empty-text">{{ t('chatbot.orders.empty') }}</p>
      <RouterLink to="/chatbot/conversations" class="empty-link">{{ t('chatbot.orders.goToConversations') }}</RouterLink>
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="orders-list">
      <div
        v-for="order in allOrders"
        :key="order.id"
        :class="['order-card', borderClass(order.status)]"
      >
        <!-- Cabecera del pedido -->
        <div class="order-card__head">
          <div>
            <h2 class="order-card__title">{{ order.orderNumber }} — {{ clientName(order) }}</h2>
            <p class="order-card__meta">
              {{ order.paymentMethod }} · S/{{ order.total.toFixed(2) }} · {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <span :class="badgeClass(order.status, order.hasReceipt)">
            {{ badgeLabel(order.status, order.hasReceipt) }}
          </span>
        </div>

        <!-- Cuerpo: comprobante + detalles -->
        <div class="order-card__body">

          <!-- Comprobante real -->
          <img
            v-if="order.hasReceipt && order.receiptImageUrl"
            :src="order.receiptImageUrl"
            class="receipt-img"
            alt="Comprobante"
          />

          <!-- Info derecha -->
          <div class="order-info">

            <!-- Ítems -->
            <div class="order-items">
              <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                <span class="order-item__desc">{{ item.quantity }}x {{ item.productName }}</span>
                <span class="order-item__price">S/{{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
              </div>
              <p class="order-delivery">{{ t('chatbot.orders.delivery') }} {{ order.deliveryAddress }}</p>
              <div class="order-total-row">
                <span class="order-total-label">{{ t('chatbot.orders.total') }}</span>
                <span class="order-total-value">S/{{ order.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Trazabilidad -->
            <div class="trace-box">
              <p class="trace-box__title">{{ t('chatbot.orders.traceability') }}</p>
              <ol class="trace-list">
                <li class="trace-item">
                  <span class="trace-dot trace-dot--green"></span>
                  {{ t('chatbot.orders.trace.registered', { date: formatDate(order.createdAt) }) }}
                </li>
                <li class="trace-item">
                  <span class="trace-dot trace-dot--blue"></span>
                  {{ t('chatbot.orders.trace.paymentSent') }}
                </li>
                <li v-if="order.hasReceipt || order.rejectionCount > 0" class="trace-item">
                  <span class="trace-dot trace-dot--orange"></span>
                  {{ t('chatbot.orders.trace.receiptReceived') }}
                </li>
                <li v-if="order.rejectionCount > 0" class="trace-item trace-item--red">
                  <span class="trace-dot trace-dot--red"></span>
                  {{ t('chatbot.orders.trace.receiptRejected', { count: order.rejectionCount }) }}
                </li>
                <li v-if="order.status === 'CONFIRMED'" class="trace-item trace-item--green">
                  <span class="trace-dot trace-dot--green-solid"></span>
                  {{ t('chatbot.orders.trace.paymentApproved') }}
                </li>
                <li v-else-if="order.status === 'BLOCKED'" class="trace-item trace-item--red">
                  <span class="trace-dot trace-dot--red-solid"></span>
                  {{ t('chatbot.orders.trace.blocked') }}
                </li>
                <li v-else-if="order.status === 'CANCELLED'" class="trace-item trace-item--muted">
                  <span class="trace-dot trace-dot--gray"></span>
                  {{ t('chatbot.orders.trace.cancelled') }}
                </li>
                <li v-else-if="order.status === 'WAITING_PAYMENT' && order.hasReceipt" class="trace-item trace-item--orange">
                  <span class="trace-dot trace-dot--orange animate-pulse"></span>
                  {{ t('chatbot.orders.trace.pendingValidation') }}
                </li>
                <li v-else-if="order.status === 'WAITING_PAYMENT' && !order.hasReceipt" class="trace-item trace-item--muted">
                  <span class="trace-dot trace-dot--gray animate-pulse"></span>
                  {{ t('chatbot.orders.trace.awaitingReceipt') }}
                </li>
              </ol>
            </div>

            <!-- Botones approve/reject -->
            <div v-if="order.status === 'WAITING_PAYMENT' && order.hasReceipt" class="order-actions">
              <button type="button" class="btn-approve" @click="approve(order.id)">
                {{ t('chatbot.orders.approvePayment') }}
              </button>
              <button type="button" class="btn-reject" @click="reject(order.id)">
                {{ t('chatbot.orders.rejectPayment') }}
                <span v-if="order.rejectionCount > 0" class="btn-reject__warn">
                  {{ t('chatbot.orders.willBlock') }}
                </span>
              </button>
            </div>

            <!-- Mensaje bloqueado -->
            <div v-if="order.status === 'BLOCKED'" class="blocked-msg">
              {{ t('chatbot.orders.blockedMessage') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page   { height: 100%; overflow-y: auto; background: #f9fafb; padding: 2rem; }
.orders-header { margin-bottom: 1.5rem; }
.orders-title  { font-size: 1.5rem; font-weight: 700; color: #111827; }
.orders-sub    { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }

/* ── Empty state ─────────────────────────────────────────────────────── */
.empty-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 1rem; background: #fff; padding: 5rem 2rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
}
.empty-icon { width: 3rem; height: 3rem; color: #d1d5db; }
.empty-text { margin-top: 0.75rem; font-size: 0.875rem; color: #9ca3af; }
.empty-link { margin-top: 1rem; font-size: 0.875rem; color: #f97316; text-decoration: none; }
.empty-link:hover { text-decoration: underline; }

/* ── Orders list ─────────────────────────────────────────────────────── */
.orders-list { display: flex; flex-direction: column; gap: 1rem; }

.order-card {
  border-radius: 1rem; background: #fff; border: 2px solid;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07); overflow: hidden;
}
.order-card--green  { border-color: #bbf7d0; }
.order-card--red    { border-color: #fca5a5; }
.order-card--gray   { border-color: #d1d5db; }
.order-card--orange { border-color: #fed7aa; }

/* ── Card head ───────────────────────────────────────────────────────── */
.order-card__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; padding: 1.5rem 1.5rem 1rem;
}
.order-card__title { font-size: 1rem; font-weight: 700; color: #111827; }
.order-card__meta  { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }

/* ── Badge ───────────────────────────────────────────────────────────── */
.badge { border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.badge--green  { background: #dcfce7; color: #15803d; }
.badge--red    { background: #fee2e2; color: #dc2626; }
.badge--gray   { background: #f3f4f6; color: #6b7280; }
.badge--orange { background: #fff7ed; color: #ea580c; }

/* ── Card body ───────────────────────────────────────────────────────── */
.order-card__body { display: flex; gap: 1.5rem; padding: 0 1.5rem 1.5rem; }


/* ── Receipt image ───────────────────────────────────────────────────── */
.receipt-img { width: 14rem; border-radius: 0.75rem; object-fit: contain; flex-shrink: 0; }

/* ── Order info ──────────────────────────────────────────────────────── */
.order-info { display: flex; flex-direction: column; flex: 1; gap: 1rem; min-width: 0; }

/* ── Items ───────────────────────────────────────────────────────────── */
.order-items { display: flex; flex-direction: column; gap: 0.375rem; }
.order-item  { display: flex; justify-content: space-between; font-size: 0.875rem; }
.order-item__desc  { color: #374151; }
.order-item__price { color: #111827; }
.order-delivery    { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
.order-total-row   { display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 0.5rem; margin-top: 0.25rem; font-size: 0.875rem; font-weight: 600; }
.order-total-label { color: #f97316; }
.order-total-value { color: #f97316; }

/* ── Traceability ────────────────────────────────────────────────────── */
.trace-box { border-radius: 0.75rem; background: #f9fafb; padding: 0.75rem 1rem; }
.trace-box__title { font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 0.5rem; }
.trace-list { display: flex; flex-direction: column; gap: 0.375rem; list-style: none; padding: 0; margin: 0; }
.trace-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #4b5563; }
.trace-item--red    { color: #ef4444; }
.trace-item--green  { color: #15803d; font-weight: 500; }
.trace-item--orange { color: #f97316; }
.trace-item--muted  { color: #9ca3af; }

.trace-dot { width: 0.375rem; height: 0.375rem; border-radius: 9999px; flex-shrink: 0; }
.trace-dot--green       { background: #4ade80; }
.trace-dot--green-solid { background: #22c55e; }
.trace-dot--blue        { background: #60a5fa; }
.trace-dot--orange      { background: #fb923c; }
.trace-dot--red         { background: #f87171; }
.trace-dot--red-solid   { background: #ef4444; }
.trace-dot--gray        { background: #9ca3af; }

/* ── Actions ─────────────────────────────────────────────────────────── */
.order-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-approve {
  border-radius: 9999px; border: 2px solid #22c55e;
  padding: 0.375rem 1.5rem; font-size: 0.875rem; font-weight: 500;
  color: #16a34a; background: transparent; cursor: pointer; transition: background 0.2s;
}
.btn-approve:hover { background: #f0fdf4; }
.btn-reject {
  border-radius: 9999px; border: 2px solid #f87171;
  padding: 0.375rem 1.5rem; font-size: 0.875rem; font-weight: 500;
  color: #ef4444; background: transparent; cursor: pointer; transition: background 0.2s;
}
.btn-reject:hover { background: #fef2f2; }
.btn-reject__warn { font-size: 0.75rem; opacity: 0.7; margin-left: 0.25rem; }

/* ── Blocked ─────────────────────────────────────────────────────────── */
.blocked-msg { border-radius: 0.5rem; background: #fef2f2; padding: 0.625rem 1rem; font-size: 0.75rem; color: #dc2626; }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .order-card__body { gap: 1rem; }
}

@media (max-width: 768px) {
  .orders-page { padding: 1.25rem; }
  /* Recibo encima, info debajo */
  .order-card__body { flex-direction: column; padding: 0 1rem 1rem; }
  /* Recibo centrado */
  .order-card__body > :first-child { align-self: center; }
}

@media (max-width: 640px) {
  .orders-page { padding: 1rem; }
  .orders-title { font-size: 1.25rem; }
  .order-card__head { padding: 1rem 1rem 0.75rem; gap: 0.5rem; }
  .order-card__title { font-size: 0.875rem; }
  .order-card__meta  { font-size: 0.75rem; }
  .order-actions { flex-direction: column; }
  .btn-approve, .btn-reject { width: 100%; text-align: center; }
  .empty-card { padding: 3rem 1.5rem; }
}
</style>
