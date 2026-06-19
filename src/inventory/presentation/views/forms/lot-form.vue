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

const submitted         = ref(false);
const selectedProductKey = ref('');

onMounted(() => {
  document.body.style.overflow = 'hidden';
  if (!store.unit_productsLoaded)   store.fetchUnitProducts();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();

  form.value.codeQR    = `LOT-${Date.now()}`;
  form.value.entryDate = new Date().toISOString().slice(0, 10);

  const pid  = route.query.productId ? Number(route.query.productId) : null;
  const ptype = route.query.lotType ?? null;
  if (pid && ptype) selectedProductKey.value = `${pid}-${ptype}`;
});

const allProducts = computed(() => [
  ...store.unit_products.map(p => ({ id: p.id, name: p.name, brand: p.brand ?? '', type: 'unit'   })),
  ...store.weight_products.map(p => ({ id: p.id, name: p.name, brand: p.brand ?? '', type: 'weight' })),
]);

const selectedProduct = computed(() => {
  if (!selectedProductKey.value) return null;
  const [id, type] = selectedProductKey.value.split('-');
  return allProducts.value.find(p => p.id === Number(id) && p.type === type) ?? null;
});

const isUnit = computed(() => selectedProduct.value?.type === 'unit');

const form = ref({
  quantity:   null,
  quantityKg: null,
  codeQR:     '',
  entryDate:  '',
  expiryDate: '',
});

watch(selectedProductKey, () => {
  form.value.codeQR = `LOT-${Date.now()}`;
  form.value.quantity   = null;
  form.value.quantityKg = null;
  form.value.expiryDate = '';
});

const isValid = computed(() => {
  if (!selectedProduct.value) return false;
  if (isUnit.value) return form.value.quantity != null && !!form.value.entryDate;
  return form.value.quantityKg != null && !!form.value.entryDate;
});

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(form.value.codeQR || ' ', 90); }
  catch { return ''; }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

function onQrScanned(value) { form.value.codeQR = value; }
function closeModal()       { router.push({ name: 'inventory-lots' }); }

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  const prod = selectedProduct.value;
  if (isUnit.value) {
    store.addUnitLot({
      _productId:  prod.id,
      _quantity:   form.value.quantity,
      _codeQR:     form.value.codeQR,
      _entryDate:  form.value.entryDate  || null,
      _expiryDate: form.value.expiryDate || null,
    });
  } else {
    store.addWeightLot({
      _productId:  prod.id,
      _quantityKg: form.value.quantityKg,
      _codeQR:     form.value.codeQR,
      _entryDate:  form.value.entryDate || null,
    });
  }
  closeModal();
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">

      <button type="button" class="btn-close-circle" @click="closeModal">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
        </svg>
      </button>

      <h2 class="modal-title-main">{{ t('lots.form.addTitle') }}</h2>
      <p class="modal-subtitle">{{ t('lots.form.addSubtitle') }}</p>

      <form @submit.prevent="submit" class="custom-form">

        <!-- Product selector -->
        <div class="form-field-wrapper">
          <label class="label-bold">{{ t('lots.form.product') }}</label>
          <div class="select-wrap" :class="{ 'select-wrap--error': !selectedProduct && submitted }">
            <select class="styled-select" v-model="selectedProductKey">
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
                  {{ p.name }}{{ p.brand ? ' · ' + p.brand : '' }}
                </option>
              </optgroup>
            </select>
            <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <span v-if="!selectedProduct && submitted" class="v-text">{{ t('form.required') }}</span>
        </div>

        <!-- Selected product display -->
        <div v-if="selectedProduct" class="product-selected-row">
          <div class="product-selected-info">
            <span class="product-selected-name">{{ selectedProduct.name }}</span>
            <span v-if="selectedProduct.brand" class="product-selected-brand">{{ selectedProduct.brand }}</span>
          </div>
          <span v-if="isUnit" class="badge badge--unit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"/><path d="M3 8l9 4 9-4"/><path d="M12 12v8"/></svg>
            {{ t('products.col.byUnit') }}
          </span>
          <span v-else class="badge badge--weight">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
            {{ t('products.col.byWeight') }}
          </span>
        </div>

        <!-- Quantity -->
        <div class="form-field-wrapper">
          <label class="label-bold">
            {{ t('lots.form.quantity') }}
            ({{ isUnit ? t('products.col.byUnit') : 'kg' }})
          </label>
          <div class="field-row-valid">
            <input
              v-if="isUnit"
              type="number" min="0" step="1"
              v-model.number="form.quantity"
              placeholder="0"
              class="grey-input"
              :class="{ 'input-error': form.quantity == null && submitted }">
            <input
              v-else
              type="number" min="0" step="0.01"
              v-model.number="form.quantityKg"
              placeholder="0.00"
              class="grey-input"
              :class="{ 'input-error': form.quantityKg == null && submitted }">
            <template v-if="(isUnit ? form.quantity : form.quantityKg) == null && submitted">
              <span class="v-x">&times;</span>
              <span class="v-text">{{ t('form.required') }}</span>
            </template>
          </div>
        </div>

        <!-- Entry date -->
        <div class="form-field-wrapper">
          <label class="label-bold">{{ t('lots.form.entryDate') }}</label>
          <div class="field-row-valid">
            <input
              type="date"
              v-model="form.entryDate"
              class="grey-input"
              :class="{ 'input-error': !form.entryDate && submitted }">
            <template v-if="!form.entryDate && submitted">
              <span class="v-x">&times;</span>
              <span class="v-text">{{ t('form.required') }}</span>
            </template>
          </div>
        </div>

        <!-- Expiry date (unit only) -->
        <div v-if="isUnit" class="form-field-wrapper">
          <label class="label-bold">{{ t('lots.form.expiryDate') }}</label>
          <input type="date" v-model="form.expiryDate" class="grey-input">
        </div>

        <!-- QR Code -->
        <div class="qr-layout-container">
          <div class="qr-preview-box">
            <img :src="qrImageUrl" :alt="form.codeQR || 'QR'">
          </div>
          <div class="qr-details">
            <label class="label-bold">{{ t('lots.form.qrCode') }}</label>
            <input type="text" v-model="form.codeQR" class="grey-input qr-input">
            <div class="qr-scanner-row">
              <QrScanner @scanned="onQrScanned" />
              <span class="qr-hint">{{ t('lots.form.qrHint') }}</span>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="button-container">
          <button
            type="submit"
            class="btn-save-orange"
            :class="{ 'btn-save-orange--invalid': !isValid && submitted }">
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
  background: rgba(12, 15, 18, 0.50);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: var(--color-card-bg);
  border-radius: 28px;
  width: 90%;
  max-width: 520px;
  padding: 40px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: fadeInScale 0.2s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.btn-close-circle {
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
.btn-close-circle:hover { background: #C9C9C9; }

.modal-title-main { font-size: 22px; font-family: 'Reddit Sans', sans-serif; font-weight: 700; margin: 0 0 4px; color: var(--color-text-strong); }
.modal-subtitle   { font-size: 13px; color: var(--color-text-muted); margin: 0 0 24px; }

.custom-form { display: flex; flex-direction: column; gap: 16px; }
.form-field-wrapper { display: flex; flex-direction: column; gap: 6px; }
.label-bold { font-weight: 600; font-size: 14px; color: var(--color-text-strong); }

/* Styled select */
.select-wrap {
  position: relative;
  border: 1.5px solid var(--color-card-border);
  border-radius: 12px;
  background: var(--color-bg-page);
  overflow: hidden;
  transition: border-color 0.2s;
}
.select-wrap:focus-within { border-color: var(--color-primary); }
.select-wrap--error { border-color: var(--color-danger) !important; }

.styled-select {
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

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-muted);
}

/* Product display row */
.product-selected-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-page);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: -8px;
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

/* Inputs */
.grey-input {
  background: var(--color-bg-page);
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  font-family: inherit;
  color: var(--color-text-primary);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.grey-input:focus { outline: none; border-color: var(--color-primary); }
.input-error { border-color: var(--color-danger) !important; }

/* QR section */
.qr-layout-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: var(--color-bg-page);
  border-radius: 16px;
  padding: 16px;
}
.qr-preview-box img { width: 90px; height: 90px; object-fit: contain; flex-shrink: 0; }
.qr-details { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.qr-input { margin-top: 2px; }

.qr-scanner-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.qr-hint { font-size: 11px; color: var(--color-text-muted); line-height: 1.4; }

/* Submit */
.button-container { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 8px; }

.btn-save-orange {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 16px 80px;
  font-size: 17px;
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
</style>
