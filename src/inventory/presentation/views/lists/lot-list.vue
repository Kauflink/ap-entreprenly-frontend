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
const alertIndex          = ref(0);
const cardsGrid           = ref(null);
const showProductSelector = ref(false);

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

const alertSummaries = computed(() => StockAlert.summarize(rawAlerts.value));

const expiredAlertsCount = computed(() =>
  rawAlerts.value.filter(a => a.alertType === 'expired').length
);

const outOfStockAlertsCount = computed(() =>
  rawAlerts.value.filter(a => a.alertType === 'out_of_stock').length
);

const activeAlertSummary = computed(() => alertSummaries.value[alertIndex.value] ?? null);

function previousAlert() { if (alertIndex.value > 0) alertIndex.value--; }
function nextAlert()     { if (alertIndex.value < alertSummaries.value.length - 1) alertIndex.value++; }

function navigateToDetails(productId, lotType) {
  const name = lotType === 'unit' ? 'inventory-unit-lots' : 'inventory-weight-lots';
  router.push({ name, query: { productId } });
}

function scrollLeft() {
  const card   = cardsGrid.value?.querySelector('.lot-card');
  const amount = card ? (card.offsetWidth + 24) * 3 : 300;
  cardsGrid.value?.scrollBy({ left: -amount, behavior: 'smooth' });
}

function scrollRight() {
  const card   = cardsGrid.value?.querySelector('.lot-card');
  const amount = card ? (card.offsetWidth + 24) * 3 : 300;
  cardsGrid.value?.scrollBy({ left: amount, behavior: 'smooth' });
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

    <template v-if="activeAlertSummary">
      <div class="lot-alert-slider">
        <button
            type="button"
            class="alert-slide-btn"
            :disabled="alertSummaries.length <= 1"
            @click="previousAlert">
          ❮
        </button>

        <div
            class="lot-alert"
            :class="{
              'lot-alert--danger':  activeAlertSummary.tone === 'danger',
              'lot-alert--warning': activeAlertSummary.tone === 'warning',
              'lot-alert--low':     activeAlertSummary.tone === 'low'
            }">
          <svg v-if="activeAlertSummary.tone === 'warning'" class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <svg v-else-if="activeAlertSummary.tone === 'low'" class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
          </svg>
          <svg v-else class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <div class="lot-alert-copy">
            <strong>{{ t(activeAlertSummary.titleKey, activeAlertSummary.titleParams) }}</strong>
            <span>{{ t(activeAlertSummary.detailKey, activeAlertSummary.detailParams) }}</span>
          </div>
        </div>

        <button
            type="button"
            class="alert-slide-btn"
            :disabled="alertSummaries.length <= 1"
            @click="nextAlert">
          ❯
        </button>
      </div>
    </template>

    <div class="cards-wrapper">
      <button
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft">
        ❮
      </button>
      <div class="cards-grid" ref="cardsGrid">
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
      <button
          class="scroll-btn scroll-btn-right"
          @click="scrollRight">
        ❯
      </button>
    </div>
  </div>

  <router-view />

  <teleport to="body">
    <div v-if="showProductSelector" class="ps-overlay" @click.self="closeSelector">
      <div class="ps-card">

        <button type="button" class="ps-close" @click="closeSelector">✕</button>

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
                  {{ p.name }}{{ p.brand ? ' · ' + p.brand : '' }}
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

.lot-alert-slider {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.lot-alert {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 62px;
  padding: 12px 24px;
  border: 2px solid;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
}

.alert-slide-btn {
  width: 32px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--color-text-muted);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-slide-btn:disabled {
  opacity: 0;
}

.lot-alert-icon {
  font-size: 34px;
  flex: 0 0 auto;
}

.lot-alert-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
}

.lot-alert-copy strong {
  font-weight: 700;
}

.lot-alert--danger {
  background: #fff1f1;
  border-color: #ff5a5f;
  color: #7f1111;
}

.lot-alert--danger .lot-alert-copy strong,
.lot-alert--danger .lot-alert-copy span {
  color: #7f1111;
}

.lot-alert--warning {
  background: var(--color-theme-btn-active-bg);
  border-color: #d9a900;
  color: #c58b00;
}

.lot-alert--low {
  background: #cbd4ff;
  border-color: #7687ff;
  color: #6872db;
}

.cards-wrapper {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
  overflow: hidden;
}

.cards-grid {
  display: flex;
  gap: 16px;

  flex: 1;
  min-width: 0;

  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 10px 0;
}

.cards-grid::-webkit-scrollbar {
  display: none;
}

.lot-card {
  min-width: calc((100% - 16px * 2) / 3);
  width: calc((100% - 16px * 2) / 3);
  min-height: 220px;

  background: var(--color-card-bg);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
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

.scroll-btn {
  width: 48px;
  height: 90px;

  border: none;
  border-radius: 14px;

  background: var(--color-text-muted);
  color: #fff;

  font-size: 28px;
  cursor: pointer;

  flex-shrink: 0;
}

/* ── Product Selector Modal ──────────────────────────────────── */
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
  font-size: 14px;
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

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 14px;
  }
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .btn-create {
    width: 100%;
    text-align: center;
  }
  .stats-row {
    gap: 10px;
  }
  .stat-card {
    padding: 14px 12px 12px;
  }
  .stat-number { font-size: 24px; }
  .stat-label  { font-size: 12px; }
  .lot-alert-slider {
    grid-template-columns: 32px minmax(0, 1fr) 32px;
    gap: 6px;
  }
  .lot-alert { padding: 10px 14px; gap: 12px; }
  .scroll-btn { display: none; }
  .cards-wrapper { gap: 0; }
  .lot-card {
    min-width: 80vw;
    width: 80vw;
  }
}

@media (max-width: 480px) {
  .page-title { font-size: 22px; }
  .stats-row { flex-wrap: wrap; }
  .stat-card { flex: 1 1 calc(50% - 8px); min-width: 120px; }
  .lot-card { min-width: 88vw; width: 88vw; }
}
</style>
