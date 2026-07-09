<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import { StockAlert } from '@/inventory/domain/model/stock-alert-entity.js';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();

const searchTerm          = ref('');
const showProductSelector = ref(false);
const alertsMenuOpen = ref(false);

onMounted(() => {
  if (!store.unit_productsLoaded)  store.fetchUnitProducts();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();
  if (!store.unit_lotsLoaded)      store.fetchUnitLots();
  if (!store.weight_lotsLoaded)    store.fetchWeightLots();
});

const allProducts = computed(() => [
  ...store.unit_products.map(p => ({
    id: p.id, name: p.name, description: p.description,
    brand: p.brand, productType: p.productType, type: 'unit',
  })),
  ...store.weight_products.map(p => ({
    id: p.id, name: p.name, description: p.description,
    productType: p.productType, type: 'weight',
  })),
]);

const filteredProducts = computed(() => {
  const q = searchTerm.value.toLowerCase();
  return allProducts.value.filter(p => !q || p.name?.toLowerCase().includes(q));
});

function lotsFor(product) {
  if (product.type === 'unit') return store.unit_lots.filter(l => l.productId === product.id);
  return store.weight_lots.filter(l => l.productId === product.id);
}

function stockFor(product) {
  if (product.type === 'unit')
    return store.unit_lots.filter(l => l.productId === product.id).reduce((s, l) => s + (l.quantity || 0), 0);
  return store.weight_lots.filter(l => l.productId === product.id).reduce((s, l) => s + (l.quantityKg || 0), 0);
}

const cards = computed(() =>
  filteredProducts.value.map(p => ({
    lotType:    p.type,
    product:    p,
    lots:       lotsFor(p),
    totalStock: stockFor(p),
  }))
);

const totalLotsCount = computed(() => store.unit_lots.length + store.weight_lots.length);

const rawAlerts = computed(() =>
  StockAlert.buildFromLots(
    store.unit_products,
    store.weight_products,
    store.unit_lots,
    store.weight_lots,
  )
);

const totalAlertCount = computed(() => rawAlerts.value.length);

const expiredAlertsCount = computed(() =>
  rawAlerts.value.filter(a => a.alertType === 'expired').length
);

const outOfStockAlertsCount = computed(() =>
  rawAlerts.value.filter(a => a.alertType === 'out_of_stock').length
);


function navigateToDetails(productId, lotType, lotId = null) {
  const name = lotType === 'unit' ? 'inventory-unit-lots' : 'inventory-weight-lots';
  const query = { productId };
  if (lotId !== null && lotId !== undefined) query.lotId = lotId;
  router.push({ name, query });
}

function toggleAlertsMenu() {
  alertsMenuOpen.value = !alertsMenuOpen.value;
}

function alertIcon(alert) {
  switch (alert.alertType) {
    case 'expired':       return 'error_outline';
    case 'out_of_stock':  return 'priority_high';
    case 'expiring_soon': return 'warning_amber';
    case 'low_stock':     return 'trending_down';
    default:              return 'notifications';
  }
}

function alertTitleKey(alert) {
  switch (alert.alertType) {
    case 'low_stock':     return 'lots.alerts.title.lowStock';
    case 'out_of_stock':  return 'lots.alerts.title.outOfStock';
    case 'expiring_soon': return 'lots.alerts.title.expiringSoon';
    case 'expired':       return 'lots.alerts.title.expired';
    default:              return 'lots.alerts.title.lowStock';
  }
}

function alertTitleParams(alert) {
  const count = rawAlerts.value.filter(item =>
    item.alertType === alert.alertType &&
    item.productId === alert.productId &&
    item.productType === alert.productType
  ).length;

  return { count };
}

function navigateToAlert(alert) {
  if (!alert.productType) return;
  alertsMenuOpen.value = false;
  navigateToDetails(alert.productId, alert.productType, alert.lotId);
}


function navigateToCreate() {
  showProductSelector.value = true;
  document.body.style.overflow = 'hidden';
}

function closeSelector() {
  showProductSelector.value = false;
  document.body.style.overflow = '';
}

function handleProductSelect(value) {
  if (!value) return;
  const [id, type] = value.split('-');
  const routeName  = type === 'unit' ? 'inventory-unit-lot-create' : 'inventory-weight-lot-create';
  closeSelector();
  router.push({ name: routeName, query: { productId: Number(id) } });
}

onUnmounted(() => {
  document.body.style.overflow = '';
});

const loading = computed(() => !store.unit_productsLoaded || !store.weight_productsLoaded);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          {{ t('lots.title') }}
        </h1>
        <p class="page-subtitle">
          {{ t('lots.subtitle') }}
        </p>
      </div>
      <div class="header-actions">
        <div class="alert-menu">
          <button
              type="button"
              class="alert-icon-btn"
              :aria-label="t('lots.alerts.buttonLabel')"
              :aria-expanded="alertsMenuOpen"
              @click="toggleAlertsMenu">
            <span class="material-icons" aria-hidden="true">notifications</span>
            <span v-if="totalAlertCount > 0" class="alert-badge">{{ totalAlertCount }}</span>
          </button>

          <section v-if="alertsMenuOpen" class="alert-dropdown" aria-live="polite">
            <div class="alert-dropdown-header">
              <strong>{{ t('lots.alerts.dropdownTitle') }}</strong>
              <span>{{ totalAlertCount }} {{ t('lots.alerts.totalLabel') }}</span>
            </div>

            <div v-if="rawAlerts.length > 0" class="alert-dropdown-list">
              <button
                  v-for="(alert, idx) in rawAlerts"
                  :key="`${alert.productType}-${alert.productId}-${alert.lotId}-${alert.alertType}-${idx}`"
                  type="button"
                  class="lot-alert"
                  :class="{
                    'lot-alert--danger':  alert.tone === 'danger',
                    'lot-alert--warning': alert.tone === 'warning',
                    'lot-alert--low':     alert.tone === 'low'
                  }"
                  @click="navigateToAlert(alert)">
                <span class="lot-alert-icon" aria-hidden="true">
                  <span class="material-icons">{{ alertIcon(alert) }}</span>
                </span>
                <span class="lot-alert-copy">
                  <strong>{{ t(alertTitleKey(alert), alertTitleParams(alert)) }}</strong>
                  <span>{{ t(alert.detailKey, alert.detailParams) }}</span>
                </span>
              </button>
            </div>
            <p v-else class="alert-empty">{{ t('lots.alerts.empty') }}</p>
          </section>
        </div>

        <input
            class="search-input"
            type="text"
            :placeholder="t('lots.search')"
            v-model="searchTerm"
        />
        <button
            class="btn-create"
            @click="navigateToCreate">
          + {{ t('lots.create') }}
        </button>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C07428" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/>
            <path d="M7 16.5l-4.74-2.85"/><path d="M7 16.5l5-3"/><path d="M7 16.5V21"/>
            <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/>
            <path d="M17 16.5l-5-3"/><path d="M17 16.5l4.74-2.85"/><path d="M17 16.5V21"/>
            <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/>
            <path d="M12 8 7.26 5.15"/><path d="M12 8l4.74-2.85"/><path d="M12 8v4.5"/>
          </svg>
        </div>
        <p class="stat-number">
          {{ totalLotsCount }}
        </p>
        <p class="stat-label">
          {{ t('lots.totalLots') }}
        </p>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--red">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FD4444" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="7" x2="12" y2="13"/>
            <circle cx="12" cy="16.5" r="1" fill="#FD4444" stroke="none"/>
          </svg>
        </div>
        <p class="stat-number">
          {{ expiredAlertsCount }}
        </p>
        <p class="stat-label">
          {{ t('lots.expiredLots') }}
        </p>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F38313" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
          </svg>
        </div>
        <p class="stat-number">
          {{ outOfStockAlertsCount }}
        </p>
        <p class="stat-label">
          {{ t('lots.outOfStock') }}
        </p>
      </div>
    </div>
    <div class="cards-grid">
        <p v-if="cards.length === 0" class="empty">
          {{ t('lots.empty') }}
        </p>
        <div v-for="card in cards" :key="card.lotType + '-' + card.product.id" class="lot-card">
          <div class="lot-card-top">
            <div class="lot-card-names">
              <span class="product-name">
                {{ card.product.name }}
              </span>
              <span v-if="card.product.brand" class="product-brand">
                {{ card.product.brand }}
              </span>
            </div>
            <span v-if="card.lotType === 'unit'" class="badge badge--unit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"/><path d="M3 8l9 4 9-4"/><path d="M12 12v8"/></svg>
              {{ t('products.col.byUnit') }}
            </span>
            <span v-else class="badge badge--weight">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
              {{ t('products.col.byWeight') }}
            </span>
          </div>
          <div class="lot-card-body">
            <div class="stock-row">
              <span class="stock-number">
                {{ card.totalStock }}
              </span>
              <span class="stock-label">
                {{ card.lotType === 'unit' ? t('lots.totalUnits') : t('products.form.weight') }}
              </span>
            </div>
            <div class="count-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F38313" stroke-width="1.8">
                <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"/>
                <path d="M3 8l9 4 9-4"/>
                <path d="M12 12v8"/>
              </svg>
              <span class="count-label">
                {{ card.lots.length }}
                {{ t('lots.totalLotCount') }}
              </span>
            </div>
          </div>
          <div class="lot-card-footer">
            <button
                class="btn-details"
                @click="navigateToDetails(card.product.id, card.lotType)">
              {{ t('lots.viewDetails') }}
            </button>
          </div>
        </div>
    </div>
  </div>

  <router-view />

  <teleport to="body">
    <div v-if="showProductSelector" class="ps-overlay" @click.self="closeSelector">
      <div class="ps-card">

        <button type="button" class="ps-close" @click="closeSelector">&times;</button>

        <h2 class="ps-title">{{ t('lots.form.addTitle') }}</h2>
        <p class="ps-subtitle">{{ t('lots.form.addSubtitle') }}</p>

        <div class="ps-field">
          <label class="ps-label">{{ t('lots.form.product') }}</label>
          <div class="ps-select-wrap">
            <select class="ps-select" @change="handleProductSelect($event.target.value)">
              <option value="">{{ t('lots.form.select') }}</option>
              <optgroup :label="t('products.col.byUnit')">
                <option
                  v-for="p in allProducts.filter(x => x.type === 'unit')"
                  :key="'unit-' + p.id"
                  :value="p.id + '-unit'">
                  {{ p.name }}{{ p.brand ? ' ' + p.brand : '' }}
                </option>
              </optgroup>
              <optgroup :label="t('products.col.byWeight')">
                <option
                  v-for="p in allProducts.filter(x => x.type === 'weight')"
                  :key="'weight-' + p.id"
                  :value="p.id + '-weight'">
                  {{ p.name }}
                </option>
              </optgroup>
            </select>
            <svg class="ps-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>

<style scoped>
.page {
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-strong);
}

.page-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.alert-menu {
  position: relative;
  flex: 0 0 auto;
}

.alert-icon-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-card-border);
  border-radius: 14px;
  background: var(--color-card-bg);
  color: var(--color-text-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.alert-icon-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.alert-icon-btn:focus-visible {
  outline: 3px solid rgba(243, 131, 19, 0.35);
  outline-offset: 2px;
}

.alert-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border: 2px solid var(--color-card-bg);
  border-radius: 999px;
  background: #c51616;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 15px;
  text-align: center;
  box-sizing: border-box;
}
.alert-dropdown {
  position: absolute;
  top: 54px;
  right: 0;
  z-index: 30;
  width: min(420px, 86vw);
  max-height: 430px;
  overflow: auto;
  padding: 14px;
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  background: var(--color-card-bg);
  box-shadow: 0 16px 36px rgba(0,0,0,0.18);
}

.alert-dropdown-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  color: var(--color-text-strong);
}

.alert-dropdown-header strong {
  font-size: 15px;
}

.alert-dropdown-header span {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.alert-dropdown-list {
  display: grid;
  gap: 10px;
}

.alert-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.search-input {
  width: 200px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: var(--color-avatar-bg);
  color: var(--color-avatar-fg);
  padding: 0 18px;
  outline: none;
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.btn-create {
  height: 44px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-family: 'Reddit Sans', sans-serif;
  font-weight: 700;
  cursor: pointer;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  flex: 1;
  position: relative;
  background: var(--color-card-bg);
  border-radius: 18px;
  padding: 20px 20px 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
}

.stat-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  line-height: 0;
}

.stat-number {
  font-size: 32px;
  font-family: 'Reddit Sans', sans-serif;
  font-weight: 700;
  margin: 8px 0 4px;
  color: var(--color-text-strong);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.lot-alert {
  width: 100%;
  appearance: none;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 72px;
  padding: 14px;
  border: 1px solid;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.lot-alert:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.10);
}

.lot-alert:focus-visible {
  outline: 3px solid rgba(243, 131, 19, 0.35);
  outline-offset: 2px;
}

.lot-alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255,255,255,0.72);
}

.lot-alert-icon .material-icons {
  font-size: 22px;
  width: 22px;
  height: 22px;
}

.lot-alert-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
}

.lot-alert-copy strong {
  line-height: 1.25;
  font-weight: 700;
}

.lot-alert-copy span {
  line-height: 1.35;
}

.lot-alert--danger {
  background: #fff1f1;
  border-color: #f1b8b8;
  color: #7f1111;
}

.lot-alert--danger .lot-alert-copy strong,
.lot-alert--danger .lot-alert-copy span {
  color: #7f1111;
}

.lot-alert--warning {
  background: #fff8e6;
  border-color: #f2d28a;
  color: #6f4700;
}

.lot-alert--warning .lot-alert-copy strong,
.lot-alert--warning .lot-alert-copy span {
  color: #6f4700;
}

.lot-alert--low {
  background: #edf3ff;
  border-color: #b8c9ff;
  color: #263f91;
}

.lot-alert--low .lot-alert-copy strong,
.lot-alert--low .lot-alert-copy span {
  color: #263f91;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  width: 100%;
  padding: 10px 0 0;
}

.lot-card {
  min-height: 220px;
  background: var(--color-card-bg);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lot-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.lot-card-names {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.product-brand {
  font-size: 13px;
  color: var(--color-text-muted);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Reddit Sans', sans-serif;
}

.badge--unit   { background: var(--color-primary);    color: #fff;                    font-weight: 700; }
.badge--weight { background: var(--color-avatar-bg);  color: var(--color-avatar-fg);  font-weight: 700; }

.lot-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stock-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stock-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.stock-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.count-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title { font-family: 'Reddit Sans', sans-serif; font-weight: 700; }

.count-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.lot-card-footer {
  margin-top: 12px;
  border-top: 1px solid var(--color-card-border);
  padding-top: 10px;
}

.btn-details {
  width: 100%;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: 'Reddit Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.2s, color 0.2s;
}
.btn-details:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.btn-add { display: none; }


/* ---- Product Selector Modal ---- */
.ps-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 15, 18, 0.50);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.ps-card {
  background: var(--color-card-bg);
  border-radius: 28px;
  width: 90%;
  max-width: 480px;
  padding: 40px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: fadeInScale 0.18s ease-out;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.ps-close {
  position: absolute;
  top: 20px; right: 20px;
  background: var(--color-card-border);
  border: none;
  border-radius: 50%;
  width: 36px; height: 36px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-strong);
  transition: background 0.2s;
}
.ps-close:hover { background: #C9C9C9; }

.ps-title    { font-size: 22px; font-family: 'Reddit Sans', sans-serif; font-weight: 700; margin: 0 0 4px; color: var(--color-text-strong); }
.ps-subtitle { font-size: 13px; color: var(--color-text-muted); margin: 0 0 24px; }

.ps-field { display: flex; flex-direction: column; gap: 6px; }
.ps-label { font-weight: 600; font-size: 14px; color: var(--color-text-strong); }

.ps-select-wrap {
  position: relative;
  border: 1.5px solid var(--color-card-border);
  border-radius: 12px;
  background: var(--color-bg-page);
  overflow: hidden;
  transition: border-color 0.2s;
}
.ps-select-wrap:focus-within { border-color: var(--color-primary); }

.ps-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 15px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.ps-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-muted);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 14px;
  }
  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 10px;
  }
  .alert-menu {
    grid-column: 1;
    grid-row: 1;
  }
  .search-input {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    box-sizing: border-box;
  }
  .btn-create {
    grid-column: 1 / -1;
    width: 100%;
    text-align: center;
  }
  .alert-dropdown {
    left: 0;
    right: auto;
    width: calc(100vw - 48px);
  }
  .stats-row {
    gap: 10px;
  }
  .stat-card {
    padding: 14px 12px 12px;
  }
  .stat-number { font-size: 24px; }
  .stat-label  { font-size: 12px; }
  .lot-alert { padding: 10px 14px; gap: 12px; }
}

@media (max-width: 480px) {
  .page-title { font-size: 22px; }
  .stats-row { flex-wrap: wrap; }
  .stat-card { flex: 1 1 calc(50% - 8px); min-width: 120px; }
}
</style>




