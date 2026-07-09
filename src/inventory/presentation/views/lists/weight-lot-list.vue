<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import { StockAlert } from '@/inventory/domain/model/stock-alert-entity.js';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();
const route  = useRoute();

const productId = computed(() => Number(route.query.productId) || null);

onMounted(() => {
  store.fetchWeightLots();
  store.fetchUnitLots();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();
  if (!store.unit_productsLoaded)   store.fetchUnitProducts();
});

const selectedProduct = computed(() =>
  productId.value ? store.getWeightProductById(productId.value) : null
);

const filteredLots = computed(() =>
  productId.value
    ? store.weight_lots.filter(l => l.productId === productId.value)
    : store.weight_lots
);

const alertSummaries = ref([]);

function _recomputeAlerts() {
  const pid = productId.value;
  if (!pid) { alertSummaries.value = []; return; }
  const raw = StockAlert.buildFromLots(
    store.unit_products,
    store.weight_products,
    store.unit_lots,
    store.weight_lots,
  ).filter(a => a.productType === 'weight' && a.productId === pid);
  alertSummaries.value = StockAlert.summarize(raw);
}

watch(
  [() => store.unit_lots, () => store.weight_lots, () => store.unit_products, () => store.weight_products, productId],
  _recomputeAlerts,
  { deep: true, immediate: true },
);

function fmtDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return '-';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function goBack() { router.push({ name: 'inventory-lots' }); }

function editWeightLot(id) {
  router.push({ name: 'inventory-weight-lots-list-edit', params: { id }, query: { productId: productId.value } });
}

function deleteWeightLot(id) {
  const lot = store.weight_lots.find(l => l.id === id);
  if (lot) store.deleteWeightLot(lot);
}

function navigateToCreate() {
  router.push({ name: 'inventory-weight-lots-list-new', query: { productId: productId.value } });
}
</script>

<template>
  <div class="list-overlay">
    <div v-if="!store.weight_lotsLoaded" class="spinner-wrapper">
      <div class="spinner"></div>
    </div>
    <div v-else class="inner-panel">

      <button class="btn-back-floating" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        {{ t('lots.back') }}
      </button>

      <div v-if="alertSummaries.length > 0" class="alerts-container">
        <div
            v-for="alert in alertSummaries"
            :key="alert.alertType"
            class="lot-alert"
            :class="{
              'lot-alert--danger':  alert.tone === 'danger',
              'lot-alert--warning': alert.tone === 'warning',
              'lot-alert--low':     alert.tone === 'low'
            }">
          <svg v-if="alert.tone === 'warning'" class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <svg v-else-if="alert.tone === 'low'" class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
          </svg>
          <svg v-else class="lot-alert-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <div class="lot-alert-copy">
            <strong>{{ t(alert.titleKey, alert.titleParams) }}</strong>
            <span>{{ t(alert.detailKey, alert.detailParams) }}</span>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="product-info-header">
          <span class="badge-weight">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
            {{ t('products.col.byWeight') }}
          </span>
          <div class="product-detail-row">
            <div class="title-group">
              <h2>{{ selectedProduct?.name }}</h2>
            </div>
            <div class="stats-group">
              <div class="stat-item">
                <span class="icon">📦</span>
                <span class="value">{{ filteredLots.length }}</span>
                <span class="label">{{ t('lots.totalLotCount') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lots-table">
          <div class="table-header-labels">
            <span></span>
            <span>#ID</span>
            <span>{{ t('lots.form.quantity') }} (Kg)</span>
            <span>{{ t('lots.form.entryDate') }}</span>
            <span>{{ t('lots.form.qrCode') }}</span>
            <span></span>
          </div>

          <div v-for="lot in filteredLots" :key="lot.id" class="lot-row">

            <div class="row-action-cell">
              <button
                  type="button"
                  class="btn-edit-square"
                  @click.stop="editWeightLot(lot.id)">
                <span class="material-icons">edit</span>
              </button>
            </div>

            <span class="id-cell">{{ t('lots.prefix') }}-{{ lot.id }}</span>
            <span class="qty-cell">{{ lot.quantityKg }} kg</span>
            <span>{{ lot.entryDate ? fmtDate(lot.entryDate) : '-' }}</span>
            <div class="qr-cell">
              <span class="qr-code">{{ lot.codeQR }}</span>
              <span class="qr-sub">({{ t('lots.form.qrCode') }})</span>
            </div>

            <button
                type="button"
                class="btn-delete-circle"
                @click.stop="deleteWeightLot(lot.id)"
                aria-label="Delete lot">
              <span class="material-icons">delete</span>
            </button>

          </div>
        </div>
      </div>

      <div class="footer-actions">
        <button class="btn-add-main" @click="navigateToCreate">
          <span class="plus-icon">+</span>
          {{ t('lots.add') }}
        </button>
      </div>

    </div>
  </div>

  <router-view />
</template>

<style scoped>
/* ── Page layout ─────────────────────────────────────────────── */
.list-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 60px;
  min-height: 100%;
}

.inner-panel {
  width: 100%;
  max-width: 900px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
}

/* ── Back button ─────────────────────────────────────────────── */
.btn-back-floating {
  align-self: flex-end;
  margin-bottom: 20px;
  background: var(--color-avatar-bg);
  color: var(--color-avatar-fg);
  border: none;
  padding: 10px 22px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-back-floating:hover { transform: scale(1.05); }

/* ── Alerts ──────────────────────────────────────────────────── */
.alerts-container {
  width: 100%;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lot-alert {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 60px;
  padding: 12px 24px;
  border: 2px solid;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
}

.lot-alert-icon { width: 34px; height: 34px; flex: 0 0 auto; }

.lot-alert-copy { display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
.lot-alert-copy strong { color: var(--color-text-strong); font-size: 15px; font-weight: 700; }
.lot-alert-copy span   { font-size: 13px; }

.lot-alert--danger  { background: #fff1f1; border-color: #ff5a5f; color: #7f1111; }
.lot-alert--danger .lot-alert-copy strong,
.lot-alert--danger .lot-alert-copy span  { color: #7f1111; }
.lot-alert--warning { background: var(--color-theme-btn-active-bg); border-color: #d9a900; color: #c58b00; }
.lot-alert--low     { background: #cbd4ff; border-color: #7687ff; color: #6872db; }

/* ── Content card ────────────────────────────────────────────── */
.content-card {
  width: 100%;
  background: var(--color-card-bg);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.product-info-header { margin-bottom: 30px; }

.badge-weight {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-avatar-bg);
  color: var(--color-avatar-fg);
  padding: 5px 14px;
  border-radius: 999px;
  font-family: 'Reddit Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
}

.product-detail-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.title-group h2 { margin: 0; font-size: 24px; color: var(--color-text-strong); }

.stats-group .stat-item { display: flex; align-items: center; gap: 8px; }
.stat-item .value { font-size: 20px; font-weight: 800; color: var(--color-text-strong); }
.stat-item .label { color: var(--color-text-muted); font-size: 14px; }

/* ── Table ───────────────────────────────────────────────────── */
.table-header-labels {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 1fr 1.5fr 50px;
  padding: 0 20px 15px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.lot-row {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 1fr 1.5fr 50px;
  align-items: center;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 20px;
  padding: 18px 15px 12px;
  margin-bottom: 12px;
  transition: all 0.2s;
}
.lot-row:hover { border-color: var(--color-text-strong); background: var(--color-bg-page); }

.id-cell  { font-weight: 700; color: var(--color-text-strong) !important; }
.qty-cell { font-weight: 500; }

.qr-cell { display: flex; flex-direction: column; align-items: center; }
.qr-code { font-family: monospace; font-size: 12px; color: var(--color-text-strong); }
.qr-sub  { font-size: 10px; color: var(--color-text-muted); }

.row-action-cell { display: flex; align-items: center; justify-content: center; }

.btn-edit-square {
  background: var(--color-inner-bg);
  border: 1px solid var(--color-card-border);
  width: 40px; height: 40px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.btn-delete-circle {
  background: var(--color-danger);
  border: none;
  width: 35px; height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
}

/* ── Footer ──────────────────────────────────────────────────── */
.footer-actions {
  margin-top: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn-add-main {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 14px 35px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 8px 15px rgba(249, 115, 22, 0.2);
  transition: transform 0.2s;
}
.btn-add-main:hover { transform: translateY(-2px); background: var(--color-primary-hover); }
.plus-icon { font-size: 22px; line-height: 1; }

/* ── Spinner ─────────────────────────────────────────────────── */
.spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .list-overlay { padding: 16px 12px 48px; }

  .btn-back-floating {
    align-self: stretch;
    justify-content: center;
  }

  /* overflow:hidden traps child overflow so lots-table scroll works */
  .content-card { padding: 20px 14px; border-radius: 20px; overflow: hidden; }

  .product-detail-row { flex-direction: column; align-items: flex-start; gap: 12px; }

  /* Table horizontal scroll on mobile */
  .lots-table { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }

  .table-header-labels,
  .lot-row {
    grid-template-columns: 44px 80px 90px 100px 120px 44px;
    min-width: 480px;
  }

  .footer-actions { margin-top: 20px; }
  .btn-add-main   { width: 100%; justify-content: center; border-radius: 14px; }
}

@media (max-width: 480px) {
  .title-group h2 { font-size: 18px; }

  .alerts-container { gap: 8px; }
  .lot-alert { padding: 10px 14px; gap: 10px; min-height: 50px; }
  .lot-alert-icon { width: 26px; height: 26px; }

  /* Switch lot rows to card layout */
  .table-header-labels { display: none; }

  .lot-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 10px;
    row-gap: 6px;
    padding: 14px 12px 12px;
    border-radius: 16px;
    min-width: unset;
  }

  /* Row 1: edit | ID | delete */
  .row-action-cell   { order: 1; flex: 0 0 auto; }
  .id-cell           { order: 2; flex: 1; font-size: 13px; }
  .btn-delete-circle { order: 3; flex: 0 0 auto; }

  /* Row 2: quantity (full-width) */
  .qty-cell { order: 4; flex: 0 0 100%; font-size: 17px; font-weight: 700; }

  /* Row 3: entry date full-width */
  .lot-row > span:nth-child(4) { order: 5; flex: 0 0 100%; font-size: 13px; }

  /* Row 4: QR code full width */
  .qr-cell { order: 6; flex: 0 0 100%; }

  .content-card { padding: 14px 10px; }
}
</style>
