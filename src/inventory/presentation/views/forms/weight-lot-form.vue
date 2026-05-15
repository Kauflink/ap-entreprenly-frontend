<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import QrScanner from '@/inventory/presentation/components/qr-scanner.vue';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();
const route  = useRoute();

const isEdit             = computed(() => !!route.params.id);
const editId             = computed(() => isEdit.value ? Number(route.params.id) : null);
const weightLotId        = computed(() => editId.value);
const productIdFromQuery = computed(() => route.query.productId ? Number(route.query.productId) : null);

const submitted = ref(false);

const touched = ref({
  quantityKg: false,
  entryDate:  false,
});

const form = ref({
  productId:  null,
  quantityKg: null,
  codeQR:     '',
  entryDate:  '',
});

const isValid = computed(() =>
  !!form.value.productId && form.value.quantityKg != null && !!form.value.entryDate
);

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(form.value.codeQR || ' ', 80); }
  catch { return ''; }
});

const selectedProduct = computed(() =>
  form.value.productId ? store.getWeightProductById(form.value.productId) : null
);

function populate(lot) {
  form.value = {
    productId:  lot.productId  ?? null,
    quantityKg: lot.quantityKg ?? null,
    codeQR:     lot.codeQR     ?? '',
    entryDate:  lot.entryDate ? new Date(lot.entryDate).toISOString().slice(0, 10) : '',
  };
}

onMounted(() => {
  if (!store.weight_lotsLoaded)     store.fetchWeightLots();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();
  if (isEdit.value) {
    const lot = store.getWeightLotById(editId.value);
    if (lot) populate(lot);
  } else {
    form.value.codeQR    = `WLOT-${Date.now()}`;
    form.value.entryDate = new Date().toISOString().slice(0, 10);
    if (productIdFromQuery.value) form.value.productId = productIdFromQuery.value;
  }
});

watch(() => store.weight_lotsLoaded, (loaded) => {
  if (loaded && isEdit.value && !form.value.productId) {
    const lot = store.getWeightLotById(editId.value);
    if (lot) populate(lot);
  }
});

function onQrScanned(value) { form.value.codeQR = value; }

function closeModal() {
  const pId = form.value.productId ?? route.query.productId;
  // Opened from weight-lot-list → go back to it; opened directly from lot-list → go to lot-list
  if (route.matched.some(r => r.name === 'inventory-weight-lots')) {
    router.push({ name: 'inventory-weight-lots', query: { productId: pId } });
  } else {
    router.push({ name: 'inventory-lots' });
  }
}

async function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  const payload = {
    productId:  form.value.productId,
    quantityKg: form.value.quantityKg,
    codeQR:     form.value.codeQR,
    entryDate:  form.value.entryDate || null,
  };
  if (isEdit.value) await store.updateWeightLot({ ...payload, id: editId.value });
  else              await store.addWeightLot(payload);
  // Force re-fetch so reactive arrays get a ref-level assignment,
  // which guarantees alert computeds re-evaluate in the list view.
  await store.fetchWeightLots();
  closeModal();
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">

      <button type="button" class="btn-close-circle" aria-label="Close modal" @click="closeModal">✕</button>

      <h2 class="modal-title-main">
        {{ isEdit ? t('lots.form.editTitle') : t('lots.form.addTitle') }}
      </h2>
      <p class="modal-subtitle">
        {{ isEdit ? t('lots.form.editSubtitle') : t('lots.form.addSubtitle') }}
      </p>

      <form @submit.prevent="submit" class="custom-form" novalidate>

        <!-- Product (readonly) -->
        <div class="form-field-wrapper">
          <label class="label-bold">{{ t('lots.form.product') }}</label>
          <div class="product-selected-row">
            <div class="product-selected-info">
              <span class="product-selected-name">{{ selectedProduct?.name }}</span>
            </div>
            <span class="badge badge--weight">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
              {{ t('products.col.byWeight') }}
            </span>
          </div>
        </div>

        <!-- ID (edit only) -->
        <template v-if="isEdit">
          <div class="form-field-wrapper">
            <label class="label-bold">ID</label>
            <div class="readonly-container">
              <input type="text" :value="'lot-' + weightLotId" readonly class="grey-input">
              <span class="icon-lock">🔒</span>
            </div>
          </div>
        </template>

        <!-- Quantity + Entry Date side by side -->
        <div class="two-col-row">
          <div class="form-field-wrapper">
            <label class="label-bold">{{ t('lots.form.quantity') }} (Kg)</label>
            <div class="field-row-valid">
              <input
                  type="number" min="0" step="0.01"
                  v-model.number="form.quantityKg"
                  placeholder="0.00"
                  class="grey-input"
                  :class="{ 'input-error': form.quantityKg == null && (touched.quantityKg || submitted) }"
                  @blur="touched.quantityKg = true">
              <template v-if="form.quantityKg == null && (touched.quantityKg || submitted)">
                <span class="v-x">✕</span>
                <span class="v-text">{{ t('form.required') }}</span>
              </template>
            </div>
          </div>
          <div class="form-field-wrapper">
            <label class="label-bold">{{ t('lots.form.entryDate') }}</label>
            <div class="field-row-valid">
              <input
                  type="date"
                  v-model="form.entryDate"
                  class="grey-input"
                  :class="{ 'input-error': !form.entryDate && (touched.entryDate || submitted) }"
                  @blur="touched.entryDate = true">
              <template v-if="!form.entryDate && (touched.entryDate || submitted)">
                <span class="v-x">✕</span>
                <span class="v-text">{{ t('form.required') }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- QR Code -->
        <div class="qr-layout-container">
          <div class="qr-preview-box">
            <img :src="qrImageUrl" :alt="form.codeQR || 'QR'">
          </div>
          <div class="qr-details">
            <label class="label-bold">{{ t('lots.form.qrCode') }}</label>
            <input type="text" v-model="form.codeQR" placeholder="7501055363483" class="grey-input qr-input">
          </div>
        </div>
        <div class="qr-scanner-row">
          <QrScanner @scanned="onQrScanned" />
          <span class="qr-hint">{{ t('lots.form.qrHint') }}</span>
        </div>

        <!-- Submit -->
        <div class="button-container">
          <button type="submit" class="btn-save-orange" :class="{ 'btn-save-orange--invalid': !isValid && submitted }">
            {{ t('lots.form.save') }}
          </button>
          <span v-if="!isValid && submitted" class="form-incomplete">{{ t('form.incomplete') }}</span>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.40);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: var(--color-card-bg);
  border-radius: 28px;
  width: 92%;
  max-width: 620px;
  padding: 28px 36px 28px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
  animation: fadeInScale 0.18s ease-out;
  scrollbar-width: none;
}
.modal-card::-webkit-scrollbar { display: none; }

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.btn-close-circle {
  position: absolute;
  top: 18px; right: 18px;
  background: var(--color-card-border);
  border: none;
  border-radius: 50%;
  width: 34px; height: 34px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-strong);
  transition: background 0.2s;
}
.btn-close-circle:hover { background: #C9C9C9; }

.modal-title-main { font-size: 21px; font-family: 'Reddit Sans', sans-serif; font-weight: 700; margin: 0 0 3px; color: var(--color-text-strong); }
.modal-subtitle   { font-size: 13px; color: var(--color-text-muted); margin: 0 0 18px; }

.custom-form { display: flex; flex-direction: column; gap: 12px; }
.form-field-wrapper { display: flex; flex-direction: column; gap: 5px; }
.label-bold { font-weight: 600; font-size: 14px; color: var(--color-text-strong); }

/* Two-column row */
.two-col-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grey-input {
  background: #e9e9e9;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.grey-input:focus { outline: none; border-color: var(--color-primary); }
.input-error { border-color: var(--color-danger) !important; }

/* Calendar picker icon — black */
.grey-input[type="date"] {
  color-scheme: light;
}
.grey-input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  filter: brightness(0);
}
.grey-input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.readonly-container { display: flex; align-items: center; gap: 8px; }

.product-selected-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e9e9e9;
  border-radius: 12px;
  padding: 11px 14px;
}
.product-selected-info { display: flex; flex-direction: column; gap: 2px; }
.product-selected-name  { font-size: 15px; font-weight: 600; color: var(--color-text-strong); }
.product-selected-brand { font-size: 12px; color: var(--color-text-muted); }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  font-family: 'Reddit Sans', sans-serif;
}
.badge--unit   { background: var(--color-primary);   color: #fff; }
.badge--weight { background: var(--color-avatar-bg); color: var(--color-avatar-fg); }

/* QR section */
.qr-layout-container {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #e9e9e9;
  border-radius: 16px;
  padding: 14px;
}
.qr-preview-box img { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; }
.qr-details { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.qr-input   { margin-top: 0; }

.qr-scanner-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  padding-left: 2px;
}
.qr-hint { font-size: 11px; color: var(--color-text-muted); line-height: 1.4; }

/* Submit */
.button-container { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 4px; }

.btn-save-orange {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 15px 80px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Reddit Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(243, 131, 19, 0.35);
}
.btn-save-orange:hover { background: #D97210; transform: translateY(-1px); }
.btn-save-orange--invalid { background: var(--color-danger) !important; box-shadow: none; cursor: not-allowed; }

.form-incomplete { font-size: 12px; color: var(--color-danger); font-weight: 500; }

.field-row-valid { display: flex; align-items: center; gap: 8px; }
.field-row-valid .grey-input { flex: 1; }
.v-x    { color: var(--color-danger); font-size: 15px; font-weight: 700; flex-shrink: 0; }
.v-text { color: var(--color-danger); font-size: 12px; white-space: nowrap; flex-shrink: 0; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 640px) {
  /* Overlay becomes the scroll container */
  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .modal-card {
    width: 100%;
    max-width: 100%;
    min-height: 100dvh;
    border-radius: 0;
    padding: 20px 18px 32px;
    /* no overflow-y here — overlay scrolls */
  }
  .two-col-row {
    grid-template-columns: 1fr;
  }
  .qr-layout-container {
    flex-direction: column;
    align-items: center;
  }
  .qr-layout-container .grey-input {
    background: #fff;
    border-color: rgba(0,0,0,0.12);
  }
  .qr-details { width: 100%; align-items: stretch; }
  .btn-save-orange {
    width: 100%;
    padding: 15px 0;
  }
}
</style>
