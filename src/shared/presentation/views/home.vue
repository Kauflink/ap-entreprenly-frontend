<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useChatbotStore from '@/chatbot/application/chatbot.store.js'
import useSubscriptionStore from '@/subscription/application/subscription.store.js'
import { ChatOrder } from '@/chatbot/domain/model/chat-order-entity.js'
import { SalesApi } from '@/sales/infrastructure/sales-api.js'
import { InventoryApi } from '@/inventory/infrastructure/inventory-api.js'

const { t, locale } = useI18n()
const store = useChatbotStore()
const subscriptionStore = useSubscriptionStore()
const salesApi = new SalesApi()
const inventoryApi = new InventoryApi()

// ── Sales data (cash-registers) ───────────────────────────────────────────
const totalDay     = ref(0)
const totalCash    = ref(0)
const totalDigital = ref(0)
const saleCount    = ref(0)

// ── Inventory data ────────────────────────────────────────────────────────
const stockAlerts     = ref([])
const unitProducts    = ref([])
const unitLots        = ref([])
const weightProducts  = ref([])
const weightLots      = ref([])
const alertsLoading   = ref(true)

// ── Chatbot computeds ─────────────────────────────────────────────────────
const isChatbotConnected = computed(() => store.isConnected)
const chatbotPhone       = computed(() => store.session?.phone ?? '')
const chatbotChatsCount  = computed(() => store.conversations.length)
const chatbotOrdersCount = computed(() => store.orders.length)
const chatbotAllowed = computed(() => {
  const status = subscriptionStore.dashboard.currentPlan.status
  return status === 'active' || status === 'scheduled-cancellation'
})

const recentOrders = computed(() =>
  [...store.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)
const pendingOrderCount = computed(() =>
  store.orders.filter(o => o.status === ChatOrder.Status.WAITING_PAYMENT && o.hasReceipt).length
)
const confirmedOrderCount = computed(() =>
  store.orders.filter(o => o.status === ChatOrder.Status.CONFIRMED).length
)

// ── Inventory display ─────────────────────────────────────────────────────
const inventoryDisplay = computed(() => {
  const items = []
  const MAX = 20

  for (const p of unitProducts.value.slice(0, 4)) {
    const stock = unitLots.value
      .filter(l => l.productId === p.id)
      .reduce((s, l) => s + (l.quantity ?? 0), 0)
    const level = Math.min(100, Math.round((stock / MAX) * 100))
    items.push({ name: p.name, quantity: stock, unit: 'und', stockLevel: level,
      color: level === 0 ? 'red' : level < 30 ? 'yellow' : 'green' })
  }

  const remaining = 4 - unitProducts.value.length
  for (const p of weightProducts.value.slice(0, Math.max(0, remaining))) {
    const stock = weightLots.value
      .filter(l => l.productId === p.id)
      .reduce((s, l) => s + (l.quantityKg ?? 0), 0)
    const level = Math.min(100, Math.round((stock / MAX) * 100))
    items.push({ name: p.name, quantity: stock, unit: 'kg', stockLevel: level,
      color: level === 0 ? 'red' : level < 30 ? 'yellow' : 'green' })
  }

  return items
})

const hasAlerts = computed(() => stockAlerts.value.length > 0)

// ── Quick links ───────────────────────────────────────────────────────────
const quickLinks = computed(() => [
  { labelKey: 'dashboard-home.links.products', subtextKey: 'dashboard-home.links.productsSub', icon: 'products', route: '/sales'                          },
  { labelKey: 'dashboard-home.links.lots',     subtextKey: 'dashboard-home.links.lotsSub',     icon: 'lots',     route: '/sales', alertBadge: hasAlerts.value },
  { labelKey: 'dashboard-home.links.chatbot',  subtextKey: 'dashboard-home.links.chatbotSub',  icon: 'chat',     route: '/chatbot'                        },
  { labelKey: 'dashboard-home.links.orders',   subtextKey: 'dashboard-home.links.ordersSub',   icon: 'orders',   route: '/chatbot/orders'                 },
  { labelKey: 'dashboard-home.links.reports',  subtextKey: 'dashboard-home.links.reportsSub',  icon: 'reports',  route: '/sales'                          },
])

// ── Today label ───────────────────────────────────────────────────────────
const todayLabel = computed(() => {
  const loc = locale.value === 'en' ? 'en-US' : 'es-PE'
  return new Date().toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// ── Helpers ───────────────────────────────────────────────────────────────
function orderStatusLabel(status, hasReceipt) {
  const k = status === 'CONFIRMED'  ? 'confirmed'
          : status === 'BLOCKED'    ? 'blocked'
          : status === 'CANCELLED'  ? 'cancelled'
          : hasReceipt              ? 'receiptReceived'
                                    : 'awaitingReceipt'
  return t(`dashboard-home.orders.status.${k}`)
}

function orderStatusClass(status, hasReceipt) {
  if (status === 'CONFIRMED')                           return 'badge--green'
  if (status === 'BLOCKED')                             return 'badge--red'
  if (status === 'CANCELLED')                           return 'badge--gray'
  if (status === 'WAITING_PAYMENT' && hasReceipt)       return 'badge--orange'
  return 'badge--gray'
}

function stockBarColor(item) {
  return item.color === 'red' ? 'bar--red' : item.color === 'yellow' ? 'bar--yellow' : 'bar--green'
}
function stockDotColor(item) {
  return item.color === 'red' ? 'dot--red' : item.color === 'yellow' ? 'dot--yellow' : 'dot--green'
}
function alertCardClass(alert) {
  if (alert.alertType === 'expired' || alert.alertType === 'out_of_stock') return 'alert-card--red'
  if (alert.alertType === 'expiring_soon') return 'alert-card--yellow'
  return 'alert-card--orange'
}
function alertTextClass(alert) {
  if (alert.alertType === 'expired' || alert.alertType === 'out_of_stock') return 'text-red'
  if (alert.alertType === 'expiring_soon') return 'text-yellow'
  return 'text-orange'
}
function alertLabel(alert) {
  const type = alert.alertType
  if (type === 'low_stock') {
    const total = unitLots.value.filter(l => l.productId === alert.productId).reduce((s, l) => s + (l.quantity ?? 0), 0)
    return t('dashboard-home.alerts.types.low_stock', { count: total })
  }
  return t(`dashboard-home.alerts.types.${type}`)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await subscriptionStore.loadDashboard()

  if (chatbotAllowed.value) {
    store.loadSession()
    store.loadOrders()
    store.loadConversations()
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const cashRes = await salesApi.getCashRegisterByDate(today)
    const reg = (cashRes.data ?? []).find(r => r.date === today)
    if (reg) { totalCash.value = reg.totalCash; totalDigital.value = reg.totalDigital; saleCount.value = reg.saleCount }
    totalDay.value = totalCash.value + totalDigital.value
  } catch {}

  try {
    const [alertRes, upRes, ulRes, wpRes, wlRes] = await Promise.all([
      inventoryApi.getStockAlerts(),
      inventoryApi.getUnitProducts(),
      inventoryApi.getUnitLots(),
      inventoryApi.getWeightProducts(),
      inventoryApi.getWeightLots(),
    ])
    stockAlerts.value    = alertRes.data
    unitProducts.value   = upRes.data
    unitLots.value       = ulRes.data
    weightProducts.value = wpRes.data
    weightLots.value     = wlRes.data
  } catch {}

  alertsLoading.value = false
})
</script>

<template>
  <div class="home-page">
    <div class="home-inner">

      <!-- ══ WELCOME BANNER ══════════════════════════════════════════════ -->
      <header class="banner">
        <div class="banner__content">
          <div>
            <p class="banner__eyebrow">{{ t('dashboard-home.welcomeBack') }}</p>
            <h1 class="banner__title">{{ t('dashboard-home.welcome') }}</h1>
            <p class="banner__date">{{ todayLabel }}</p>
          </div>
          <div class="banner__stats">
            <div class="stat">
              <p class="stat__value">{{ saleCount }}</p>
              <p class="stat__label">{{ t('dashboard-home.stats.salesToday') }}</p>
            </div>
            <div class="stat-divider" aria-hidden="true"></div>
            <div class="stat">
              <p class="stat__value">S/{{ totalDay.toFixed(0) }}</p>
              <p class="stat__label">{{ t('dashboard-home.stats.revenueToday') }}</p>
            </div>
            <div class="stat-divider" aria-hidden="true"></div>
            <div class="stat">
              <p class="stat__value">{{ chatbotOrdersCount }}</p>
              <p class="stat__label">{{ t('dashboard-home.stats.botOrders') }}</p>
            </div>
            <div class="stat-divider" aria-hidden="true"></div>
            <div class="stat">
              <p class="stat__value" :class="hasAlerts ? 'stat__value--alert' : ''">
                {{ stockAlerts.length }}
              </p>
              <p class="stat__label">{{ t('dashboard-home.stats.alerts') }}</p>
            </div>
          </div>
        </div>
        <div class="banner__circle banner__circle--1" aria-hidden="true"></div>
        <div class="banner__circle banner__circle--2" aria-hidden="true"></div>
      </header>

      <!-- ══ ALERT BANNER ═══════════════════════════════════════════════ -->
      <div v-if="!alertsLoading && hasAlerts" class="alert-banner" role="alert" aria-live="polite">
        <svg class="alert-banner__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p class="alert-banner__title">{{ t('dashboard-home.alertBannerTitle') }}</p>
          <p class="alert-banner__sub">{{ t('dashboard-home.alertBanner', { count: stockAlerts.length }) }}</p>
        </div>
        <RouterLink to="/sales" class="alert-banner__link">{{ t('dashboard-home.alertBannerLink') }}</RouterLink>
      </div>

      <!-- ══ QUICK LINKS ════════════════════════════════════════════════ -->
      <nav :aria-label="t('dashboard-home.quickLinksLabel')">
        <p class="ql-hint">{{ t('dashboard-home.quickLinksHint') }}</p>
        <ul class="ql-grid" role="list">
          <li v-for="link in quickLinks" :key="link.route + link.labelKey">
            <RouterLink :to="link.route" class="ql-card" :aria-label="t('dashboard-home.links.goTo', { label: t(link.labelKey) })">
              <span v-if="link.alertBadge" class="ql-badge" aria-hidden="true"></span>
              <span class="ql-icon" aria-hidden="true">
                <!-- products -->
                <svg v-if="link.icon === 'products'" class="ql-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <!-- lots -->
                <svg v-if="link.icon === 'lots'" class="ql-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <!-- chat -->
                <svg v-if="link.icon === 'chat'" class="ql-svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4v13c0 1.1.9 2 2 2h3l3 3 3-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
                </svg>
                <!-- orders -->
                <svg v-if="link.icon === 'orders'" class="ql-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <!-- reports -->
                <svg v-if="link.icon === 'reports'" class="ql-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span class="ql-label">{{ t(link.labelKey) }}</span>
              <span class="ql-sub">{{ t(link.subtextKey) }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- ══ MAIN GRID ══════════════════════════════════════════════════ -->
      <div class="main-grid">

        <!-- ── LEFT COLUMN ─────────────────────────────────────────────── -->
        <div class="col-left">

          <!-- Ingresos hoy -->
          <section class="card" aria-labelledby="ingresos-heading">
            <div class="cash-row">
              <div>
                <p class="card__eyebrow">{{ t('dashboard-home.cash.title') }}</p>
                <p class="cash-total">S/{{ totalDay.toFixed(2) }}</p>
                <div class="cash-detail">
                  <span class="cash-dot" aria-hidden="true"></span>
                  <span class="cash-sub">
                    {{ t('dashboard-home.cash.cash') }}: S/{{ totalCash.toFixed(2) }}
                    &nbsp;·&nbsp;
                    {{ t('dashboard-home.cash.digital') }}: S/{{ totalDigital.toFixed(2) }}
                  </span>
                </div>
              </div>
              <div class="sale-badge">
                <p class="sale-badge__count">{{ saleCount }}</p>
                <p class="sale-badge__label">{{ t('dashboard-home.cash.ventas') }}</p>
              </div>
            </div>
            <RouterLink to="/sales" class="go-sales-btn">{{ t('dashboard-home.cash.goToSales') }}</RouterLink>
          </section>

          <!-- Estado chatbot -->
          <section class="card" aria-labelledby="chatbot-heading">
            <div class="chatbot-header">
              <h2 id="chatbot-heading" class="card__section-title">{{ t('dashboard-home.chatbot.title') }}</h2>
              <span v-if="isChatbotConnected" class="status-chip status-chip--green">
                <span class="status-chip__dot status-chip__dot--green" aria-hidden="true"></span>
                {{ t('dashboard-home.chatbot.connected') }}
              </span>
              <span v-else class="status-chip status-chip--red">
                <span class="status-chip__dot status-chip__dot--red" aria-hidden="true"></span>
                {{ t('dashboard-home.chatbot.disconnected') }}
              </span>
            </div>

            <template v-if="isChatbotConnected">
              <dl class="chatbot-dl">
                <div class="chatbot-dl__row">
                  <dt class="chatbot-dl__label">{{ t('dashboard-home.chatbot.chatsToday') }}</dt>
                  <dd class="chatbot-dl__value">{{ chatbotChatsCount }}</dd>
                </div>
                <div class="chatbot-dl__row">
                  <dt class="chatbot-dl__label">{{ t('dashboard-home.chatbot.botOrders') }}</dt>
                  <dd class="chatbot-dl__value chatbot-dl__value--orange">{{ chatbotOrdersCount }}</dd>
                </div>
                <div v-if="chatbotPhone" class="chatbot-dl__row">
                  <dt class="chatbot-dl__label">{{ t('dashboard-home.chatbot.number') }}</dt>
                  <dd class="chatbot-dl__value chatbot-dl__value--sm">{{ chatbotPhone }}</dd>
                </div>
              </dl>
              <div v-if="pendingOrderCount > 0" class="pending-alert" role="status" aria-live="polite">
                <span class="pending-alert__dot animate-pulse" aria-hidden="true"></span>
                <p class="pending-alert__text">
                  {{ t('dashboard-home.chatbot.pendingOrders_other', { count: pendingOrderCount }) }}
                </p>
              </div>
            </template>

            <template v-else>
              <p class="chatbot-offline-sub">{{ t('dashboard-home.chatbot.disconnectedSub') }}</p>
              <RouterLink to="/chatbot" class="connect-btn">{{ t('dashboard-home.chatbot.connectNow') }}</RouterLink>
            </template>
          </section>
        </div>

        <!-- ── CENTER COLUMN (pedidos) ────────────────────────────────── -->
        <section class="card" aria-labelledby="orders-heading">
          <div class="section-header">
            <h2 id="orders-heading" class="card__section-title">{{ t('dashboard-home.orders.title') }}</h2>
            <RouterLink to="/chatbot/orders" class="view-all-link">{{ t('dashboard-home.orders.viewAll') }}</RouterLink>
          </div>

          <div v-if="recentOrders.length === 0" class="empty-state" role="status">
            <svg class="empty-state__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="empty-state__title">{{ t('dashboard-home.orders.empty') }}</p>
            <p class="empty-state__sub">{{ t('dashboard-home.orders.emptySub') }}</p>
          </div>

          <template v-else>
            <table class="orders-table" aria-label="Pedidos recientes">
              <thead>
                <tr class="orders-table__head">
                  <th scope="col">#</th>
                  <th scope="col">{{ t('dashboard-home.orders.colClient') }}</th>
                  <th scope="col">{{ t('dashboard-home.orders.colStatus') }}</th>
                  <th scope="col" class="text-right">{{ t('dashboard-home.orders.colTotal') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id" class="orders-table__row">
                  <td class="orders-table__num">{{ order.orderNumber }}</td>
                  <td class="orders-table__client">
                    <p class="orders-table__address">{{ order.deliveryAddress || t('dashboard-home.orders.clientFallback') }}</p>
                    <p class="orders-table__source">Chatbot</p>
                  </td>
                  <td>
                    <span :class="['badge', orderStatusClass(order.status, order.hasReceipt)]">
                      {{ orderStatusLabel(order.status, order.hasReceipt) }}
                    </span>
                  </td>
                  <td class="orders-table__total">S/{{ order.total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="orders-mini">
              <div class="orders-mini__card orders-mini__card--green">
                <p class="orders-mini__count">{{ confirmedOrderCount }}</p>
                <p class="orders-mini__label">{{ t('dashboard-home.orders.approved') }}</p>
              </div>
              <div class="orders-mini__card orders-mini__card--orange">
                <p class="orders-mini__count">{{ pendingOrderCount }}</p>
                <p class="orders-mini__label">{{ t('dashboard-home.orders.pending') }}</p>
              </div>
            </div>
          </template>
        </section>

        <!-- ── RIGHT COLUMN (inventario) ──────────────────────────────── -->
        <section class="card inventory-col" aria-labelledby="inventory-heading">
          <div class="section-header">
            <h2 id="inventory-heading" class="card__section-title">{{ t('dashboard-home.inventory.title') }}</h2>
            <RouterLink to="/sales" class="view-all-link">{{ t('dashboard-home.inventory.viewAll') }}</RouterLink>
          </div>

          <div v-if="alertsLoading" class="inv-skeleton" aria-busy="true">
            <div v-for="i in 4" :key="i" class="inv-skeleton__row animate-pulse"></div>
          </div>

          <p v-else-if="inventoryDisplay.length === 0" class="inv-empty">{{ t('dashboard-home.inventory.empty') }}</p>

          <ul v-else class="inv-list" role="list">
            <li v-for="item in inventoryDisplay" :key="item.name" class="inv-item">
              <span :class="['dot', stockDotColor(item)]" aria-hidden="true"></span>
              <div class="inv-item__info">
                <div class="inv-item__row">
                  <span class="inv-item__name">{{ item.name }}</span>
                  <span class="inv-item__qty">{{ item.quantity }} {{ item.unit }}</span>
                </div>
                <div class="inv-bar" role="progressbar" :aria-valuenow="item.stockLevel" aria-valuemin="0" aria-valuemax="100">
                  <div :class="['inv-bar__fill', stockBarColor(item)]" :style="{ width: item.stockLevel + '%' }"></div>
                </div>
              </div>
            </li>
          </ul>

          <!-- Alerts footer -->
          <template v-if="!alertsLoading">
            <div v-if="!hasAlerts" class="inv-ok" role="status">
              <svg class="inv-ok__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="inv-ok__title">{{ t('dashboard-home.alerts.empty') }}</p>
                <p class="inv-ok__sub">{{ t('dashboard-home.alerts.emptySub') }}</p>
              </div>
            </div>

            <div v-else class="inv-alerts">
              <div
                v-for="(alert, idx) in stockAlerts.slice(0, 3)"
                :key="idx"
                :class="['inv-alert-card', alertCardClass(alert)]"
              >
                <span class="inv-alert-card__icon" aria-hidden="true">
                  <svg v-if="alert.alertType === 'expired' || alert.alertType === 'out_of_stock'" class="icon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else class="icon-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p class="inv-alert-card__name">{{ alert.message?.split(' ')[0] ?? 'Producto' }}</p>
                  <p :class="['inv-alert-card__sub', alertTextClass(alert)]">{{ alertLabel(alert) }}</p>
                </div>
              </div>
              <RouterLink v-if="stockAlerts.length > 3" to="/sales" class="view-all-link view-all-link--center">
                {{ t('dashboard-home.alerts.viewMore', { count: stockAlerts.length - 3 }) }}
              </RouterLink>
            </div>
          </template>
        </section>

      </div><!-- /main-grid -->
    </div><!-- /home-inner -->
  </div><!-- /home-page -->
</template>

<style scoped>
.home-page   { height: 100%; overflow-y: auto; background: #f9fafb; }
.home-inner  { width: 100%; display: flex; flex-direction: column; gap: 1.5rem; padding: clamp(1rem, 2.5vw, 2rem); }

/* ── Banner ─────────────────────────────────────────────────────── */
.banner {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: linear-gradient(to right, #f97316, #fb923c);
  padding: 1.5rem 2rem;
  color: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
}
.banner__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.banner__eyebrow { font-size: 0.75rem; font-weight: 500; opacity: 0.75; }
.banner__title   { margin-top: 0.125rem; font-size: 1.25rem; font-weight: 700; }
.banner__date    { margin-top: 0.125rem; font-size: 0.75rem; opacity: 0.75; }
.banner__stats   { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.stat { text-align: center; }
.stat__value     { font-size: 1.5rem; font-weight: 700; }
.stat__value--alert { color: #fef08a; }
.stat__label     { font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }
.stat-divider    { width: 1px; height: 2.5rem; background: rgb(255 255 255 / 0.3); }
.banner__circle  { position: absolute; border-radius: 9999px; background: rgb(255 255 255 / 0.1); }
.banner__circle--1 { width: 10rem; height: 10rem; top: -2rem; right: -2rem; }
.banner__circle--2 { width: 8rem;  height: 8rem;  bottom: -2.5rem; right: -1rem; }

/* ── Alert banner ────────────────────────────────────────────────── */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #fde68a;
  background: #fefce8;
  padding: 0.75rem 1.25rem;
}
.alert-banner__icon  { width: 1.25rem; height: 1.25rem; flex-shrink: 0; color: #eab308; }
.alert-banner__title { font-size: 0.875rem; font-weight: 600; color: #854d0e; }
.alert-banner__sub   { font-size: 0.75rem; color: #a16207; }
.alert-banner__link  { margin-left: auto; flex-shrink: 0; font-size: 0.75rem; font-weight: 600; color: #a16207; text-decoration: none; }
.alert-banner__link:hover { text-decoration: underline; }

/* ── Quick links ─────────────────────────────────────────────────── */
.ql-hint { margin-bottom: 0.75rem; font-size: 0.75rem; color: #9ca3af; }
.ql-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
  list-style: none;
  padding: 0; margin: 0;
}
.ql-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  background: #fff;
  padding: 1rem 0.75rem;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  transition: box-shadow 0.2s;
}
.ql-card:hover { box-shadow: 0 4px 6px rgb(0 0 0 / 0.07); }
.ql-badge { position: absolute; top: 0.5rem; right: 0.5rem; width: 0.625rem; height: 0.625rem; border-radius: 9999px; background: #ef4444; }
.ql-icon { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px; background: #fff7ed; }
.ql-svg  { width: 1.25rem; height: 1.25rem; color: #ea580c; }
.ql-label { font-size: 0.75rem; font-weight: 600; color: #1f2937; }
.ql-sub   { font-size: 0.625rem; color: #9ca3af; }

/* ── Main grid ────────────────────────────────────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
.col-left { display: flex; flex-direction: column; gap: 1rem; }

/* ── Card ─────────────────────────────────────────────────────────── */
.card { border-radius: 1rem; background: #fff; padding: 1.25rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.07); }
.card__eyebrow { font-size: 0.75rem; color: #9ca3af; }
.card__section-title { font-size: 0.875rem; font-weight: 600; color: #374151; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.view-all-link { font-size: 0.75rem; color: #f97316; text-decoration: none; }
.view-all-link:hover { text-decoration: underline; }
.view-all-link--center { display: block; text-align: center; }

/* ── Cash section ─────────────────────────────────────────────────── */
.cash-row   { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.cash-total { margin-top: 0.25rem; font-size: 1.875rem; font-weight: 700; color: #f97316; }
.cash-detail { margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
.cash-dot   { display: inline-block; width: 0.375rem; height: 0.375rem; border-radius: 9999px; background: #4ade80; }
.cash-sub   { font-size: 0.625rem; color: #9ca3af; }
.sale-badge { display: flex; flex-direction: column; align-items: center; border-radius: 0.75rem; background: #fff7ed; padding: 0.75rem 1rem; min-width: 4rem; }
.sale-badge__count { font-size: 1.5rem; font-weight: 700; color: #ea580c; }
.sale-badge__label { font-size: 0.625rem; font-weight: 500; color: #fb923c; text-align: center; margin-top: 0.125rem; line-height: 1.2; }
.go-sales-btn {
  display: block; margin-top: 1rem; width: 100%; border-radius: 9999px;
  border: 1px solid #fdba74; padding: 0.5rem; text-align: center;
  font-size: 0.75rem; font-weight: 600; color: #f97316; text-decoration: none;
  transition: background 0.2s;
}
.go-sales-btn:hover { background: #fff7ed; }

/* ── Chatbot section ──────────────────────────────────────────────── */
.chatbot-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.status-chip    { display: flex; align-items: center; gap: 0.25rem; border-radius: 9999px; padding: 0.125rem 0.625rem; font-size: 0.75rem; font-weight: 600; }
.status-chip--green { background: #dcfce7; color: #15803d; }
.status-chip--red   { background: #fee2e2; color: #dc2626; }
.status-chip__dot   { width: 0.375rem; height: 0.375rem; border-radius: 9999px; }
.status-chip__dot--green { background: #22c55e; }
.status-chip__dot--red   { background: #ef4444; }
.chatbot-dl { display: flex; flex-direction: column; gap: 0.5rem; }
.chatbot-dl__row   { display: flex; align-items: center; justify-content: space-between; }
.chatbot-dl__label { font-size: 0.75rem; color: #9ca3af; }
.chatbot-dl__value { font-size: 0.875rem; font-weight: 600; color: #1f2937; }
.chatbot-dl__value--orange { color: #f97316; }
.chatbot-dl__value--sm     { font-size: 0.75rem; }
.pending-alert { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid #fed7aa; background: #fff7ed; padding: 0.5rem 0.75rem; }
.pending-alert__dot  { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: #fb923c; flex-shrink: 0; }
.pending-alert__text { font-size: 0.75rem; color: #c2410c; }
.chatbot-offline-sub { margin-bottom: 0.75rem; font-size: 0.75rem; color: #9ca3af; }
.connect-btn {
  display: block; width: 100%; border-radius: 9999px; background: #f97316;
  padding: 0.5rem; text-align: center; font-size: 0.75rem; font-weight: 600;
  color: #fff; text-decoration: none; transition: background 0.2s;
}
.connect-btn:hover { background: #ea6c0a; }

/* ── Orders table ─────────────────────────────────────────────────── */
.orders-table { width: 100%; text-align: left; border-collapse: collapse; }
.orders-table__head th { padding-bottom: 0.5rem; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; border-bottom: 1px solid #f3f4f6; }
.orders-table__row { border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
.orders-table__row:hover { background: #f9fafb; }
.orders-table__num    { padding: 0.625rem 0.5rem 0.625rem 0; font-size: 0.75rem; font-weight: 600; color: #f97316; white-space: nowrap; }
.orders-table__client { padding: 0.625rem 0.5rem; }
.orders-table__address { max-width: 5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; font-weight: 500; color: #1f2937; }
.orders-table__source  { font-size: 0.625rem; color: #9ca3af; }
.orders-table__total   { padding: 0.625rem 0 0.625rem 0.5rem; text-align: right; font-size: 0.75rem; font-weight: 700; color: #f97316; white-space: nowrap; }
.badge { border-radius: 9999px; padding: 0.125rem 0.5rem; font-size: 0.625rem; font-weight: 600; }
.badge--green  { background: #dcfce7; color: #15803d; }
.badge--red    { background: #fee2e2; color: #dc2626; }
.badge--orange { background: #fff7ed; color: #ea580c; }
.badge--gray   { background: #f3f4f6; color: #6b7280; }
.orders-mini { margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
.orders-mini__card { border-radius: 0.5rem; padding: 0.5rem 0.75rem; text-align: center; }
.orders-mini__card--green  { background: #f0fdf4; }
.orders-mini__card--orange { background: #fff7ed; }
.orders-mini__count { font-size: 1rem; font-weight: 700; }
.orders-mini__card--green  .orders-mini__count { color: #16a34a; }
.orders-mini__card--orange .orders-mini__count { color: #ea580c; }
.orders-mini__label { font-size: 0.625rem; }
.orders-mini__card--green  .orders-mini__label { color: #22c55e; }
.orders-mini__card--orange .orders-mini__label { color: #fb923c; }

/* ── Inventory column ─────────────────────────────────────────────── */
.inventory-col { display: flex; flex-direction: column; gap: 1rem; }
.inv-skeleton     { display: flex; flex-direction: column; gap: 0.75rem; }
.inv-skeleton__row { height: 2rem; border-radius: 0.5rem; background: #f3f4f6; }
.inv-empty        { padding: 1.5rem 0; text-align: center; font-size: 0.75rem; color: #9ca3af; }
.inv-list         { display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0; margin: 0; }
.inv-item         { display: flex; align-items: center; gap: 0.75rem; }
.dot              { width: 0.5rem; height: 0.5rem; border-radius: 9999px; flex-shrink: 0; }
.dot--green  { background: #4ade80; }
.dot--yellow { background: #facc15; }
.dot--red    { background: #f87171; }
.inv-item__info   { flex: 1; min-width: 0; }
.inv-item__row    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
.inv-item__name   { font-size: 0.75rem; font-weight: 500; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inv-item__qty    { font-size: 0.75rem; color: #6b7280; margin-left: 0.5rem; flex-shrink: 0; }
.inv-bar          { height: 0.375rem; width: 100%; border-radius: 9999px; background: #f3f4f6; }
.inv-bar__fill    { height: 0.375rem; border-radius: 9999px; transition: width 0.3s; }
.bar--green  { background: #4ade80; }
.bar--yellow { background: #facc15; }
.bar--red    { background: #f87171; }
.inv-ok { display: flex; align-items: center; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid #bbf7d0; background: #f0fdf4; padding: 0.75rem 1rem; margin-top: auto; }
.inv-ok__icon  { width: 1.25rem; height: 1.25rem; flex-shrink: 0; color: #22c55e; }
.inv-ok__title { font-size: 0.75rem; font-weight: 600; color: #15803d; }
.inv-ok__sub   { font-size: 0.625rem; color: #16a34a; }
.inv-alerts    { display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto; }
.inv-alert-card { display: flex; align-items: flex-start; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid; padding: 0.5rem 0.75rem; }
.inv-alert-card--red    { border-color: #fecaca; background: #fef2f2; }
.inv-alert-card--yellow { border-color: #fde68a; background: #fefce8; }
.inv-alert-card--orange { border-color: #fed7aa; background: #fff7ed; }
.inv-alert-card__icon { margin-top: 0.125rem; flex-shrink: 0; }
.icon-red    { width: 0.875rem; height: 0.875rem; color: #ef4444; }
.icon-yellow { width: 0.875rem; height: 0.875rem; color: #eab308; }
.inv-alert-card__name { font-size: 0.75rem; font-weight: 600; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inv-alert-card__sub  { font-size: 0.625rem; }
.text-red    { color: #dc2626; }
.text-yellow { color: #ca8a04; }
.text-orange { color: #ea580c; }

/* ── Empty state ──────────────────────────────────────────────────── */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 0; text-align: center; }
.empty-state__icon  { width: 2.5rem; height: 2.5rem; color: #e5e7eb; }
.empty-state__title { margin-top: 0.75rem; font-size: 0.875rem; font-weight: 500; color: #9ca3af; }
.empty-state__sub   { margin-top: 0.25rem; font-size: 0.75rem; color: #9ca3af; }

/* ── Responsive ───────────────────────────────────────────────────── */
@media (min-width: 1440px) {
  .main-grid        { grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
  .banner__title    { font-size: clamp(1.25rem, 1.8vw, 1.75rem); }
  .cash-total       { font-size: clamp(1.875rem, 2.5vw, 2.5rem); }
  .stat__value      { font-size: clamp(1.5rem, 2vw, 2rem); }
  .ql-grid          { grid-template-columns: repeat(5, 1fr); gap: 1rem; }
  .ql-card          { padding: 1.25rem 1rem; }
  .ql-icon          { width: 3rem; height: 3rem; }
  .ql-label         { font-size: 0.875rem; }
}

@media (max-width: 1024px) {
  /* Grid: columna izquierda + pedidos en fila, inventario abajo full */
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }
  .inventory-col {
    grid-column: 1 / -1; /* inventario ocupa toda la fila */
  }
  .ql-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .home-inner { padding: 1rem; gap: 1rem; }
  .banner { padding: 1.25rem 1.5rem; }
  .banner__content { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .banner__stats { width: 100%; justify-content: space-between; }
  /* Alert banner apilado */
  .alert-banner { flex-wrap: wrap; gap: 0.5rem; }
  .alert-banner__link { margin-left: 0; }
}

@media (max-width: 640px) {
  .home-inner { padding: 0.75rem; }
  .main-grid { grid-template-columns: 1fr; }
  .inventory-col { grid-column: auto; }
  .ql-grid { grid-template-columns: repeat(2, 1fr); }
  .banner__stats { gap: 0.75rem; }
  .stat-divider  { display: none; }
  .stat__value   { font-size: 1.25rem; }
  /* Orders table → cards en mobile */
  .orders-table thead { display: none; }
  .orders-table, .orders-table tbody, .orders-table tr, .orders-table td {
    display: block; width: 100%;
  }
  .orders-table__row {
    border: 1px solid #f3f4f6; border-radius: 0.5rem;
    margin-bottom: 0.5rem; padding: 0.5rem 0.75rem;
  }
  .orders-table__num   { font-size: 0.625rem; padding: 0; }
  .orders-table__total { text-align: left; padding: 0; }
  .orders-table__client { padding: 0.25rem 0; }
  /* Banner compacto */
  .banner { padding: 1rem; }
  .banner__title { font-size: 1rem; }
}
</style>
