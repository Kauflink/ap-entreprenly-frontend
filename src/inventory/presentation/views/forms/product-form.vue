<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import QrScanner from '@/inventory/presentation/components/qr-scanner.vue';
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js';

const { t } = useI18n();
const store  = useInventoryStore();
const { symbol } = useCurrencyFormatter();
const router = useRouter();
const route  = useRoute();

const editId    = computed(() => route.params.id ? Number(route.params.id) : null);
const isEdit    = computed(() => !!editId.value);
const submitted = ref(false);
const saving    = ref(false);
const saveError = ref(null);

const touched = ref({ name: false, price: false, pricePerKg: false });

const productType = ref('unit');
const isUnit      = computed(() => productType.value === 'unit');

const form = ref({
  name: '', description: '',
  codeQR: '',
  price: null, weightGrams: null, brand: '',
  pricePerKg: null,
});

const formValid = computed(() => {
  if (!form.value.name) return false;
  if (!form.value.codeQR) return false;
  if (isUnit.value && form.value.price == null) return false;
  if (!isUnit.value && form.value.pricePerKg == null) return false;
  return true;
});

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(form.value.codeQR || ' ', 130); }
  catch { return ''; }
});

function setType(type) { productType.value = type; }

function close() {
  router.push({ name: 'inventory-products' });
}

function onQrScanned(value) { form.value.codeQR = value; }

onMounted(() => {
  if (!store.unit_productsLoaded)   store.fetchUnitProducts();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();

  if (isEdit.value) {
    const up = store.getUnitProductById(editId.value);
    if (up) {
      productType.value = 'unit';
      form.value = { name: up.name ?? '', description: up.description ?? '', codeQR: up.codeQR ?? '', price: up.price ?? null, weightGrams: up.weightGrams ?? null, brand: up.brand ?? '', pricePerKg: null };
      return;
    }
    const wp = store.getWeightProductById(editId.value);
    if (wp) {
      productType.value = 'weight';
      form.value = { name: wp.name ?? '', description: wp.description ?? '', codeQR: wp.codeQR ?? '', price: null, weightGrams: null, brand: '', pricePerKg: wp.pricePerKg ?? null };
    }
  } else {
    form.value.codeQR = `PROD-${Date.now()}`;
  }
});

watch([() => store.unit_productsLoaded, () => store.weight_productsLoaded], () => {
  if (!isEdit.value || form.value.name) return;
  const up = store.getUnitProductById(editId.value);
  if (up) { productType.value = 'unit'; form.value = { name: up.name ?? '', description: up.description ?? '', codeQR: up.codeQR ?? '', price: up.price ?? null, weightGrams: up.weightGrams ?? null, brand: up.brand ?? '', pricePerKg: null }; return; }
  const wp = store.getWeightProductById(editId.value);
  if (wp) { productType.value = 'weight'; form.value = { name: wp.name ?? '', description: wp.description ?? '', codeQR: wp.codeQR ?? '', price: null, weightGrams: null, brand: '', pricePerKg: wp.pricePerKg ?? null }; }
});

async function save() {
  submitted.value = true;
  saveError.value = null;
  if (!formValid.value) return;
  saving.value = true;
  try {
    if (isUnit.value) {
      const payload = { name: form.value.name, description: form.value.description, codeQR: form.value.codeQR, price: form.value.price, weightGrams: form.value.weightGrams ?? 0, brand: form.value.brand };
      if (isEdit.value) await store.updateUnitProduct({ ...payload, id: editId.value });
      else              await store.addUnitProduct(payload);
    } else {
      const payload = { name: form.value.name, description: form.value.description, codeQR: form.value.codeQR, pricePerKg: form.value.pricePerKg };
      if (isEdit.value) await store.updateWeightProduct({ ...payload, id: editId.value });
      else              await store.addWeightProduct(payload);
    }
    close();
  } catch {
    saveError.value = t('form.saveError');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <teleport to="body">
  <div class="overlay" @click="close"></div>

  <div class="modal">

    <div class="modal-header">
      <div>
        <h2 class="modal-title">{{ isEdit ? t('products.form.editTitle') : t('products.form.addTitle') }}</h2>
        <p class="modal-subtitle">{{ isEdit ? t('products.form.editSubtitle') : t('products.form.addSubtitle') }}</p>
      </div>
      <button class="btn-close" type="button" @click="close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
      </button>
    </div>

    <form @submit.prevent="save" novalidate>

      <!-- Product Type -->
      <div class="field-group">
        <label class="field-label">{{ t('products.form.type') }}</label>
        <template v-if="isEdit">
          <input class="field-input field-input--locked"
                 :value="isUnit ? t('products.form.byUnit') : t('products.form.byWeight')"
                 readonly />
        </template>
        <template v-else>
          <div class="type-toggle">
            <button type="button" class="toggle-btn" :class="{ active: isUnit }" @click="setType('unit')">
              {{ t('products.form.byUnit') }}
            </button>
            <button type="button" class="toggle-btn" :class="{ 'active-weight': !isUnit }" @click="setType('weight')">
              {{ t('products.form.byWeight') }}
            </button>
          </div>
        </template>
      </div>

      <!-- Name -->
      <div class="field-group">
        <label class="field-label">{{ t('products.form.name') }}</label>
        <div class="field-row-valid">
          <input class="field-input"
                 v-model="form.name"
                 type="text"
                 :class="{ 'field-input--error': !form.name && (touched.name || submitted) }"
                 :placeholder="t('products.form.namePlaceholder')"
                 @blur="touched.name = true" />
          <template v-if="!form.name && (touched.name || submitted)">
            <span class="v-x">&times;</span>
            <span class="v-text">{{ t('form.required') }}</span>
          </template>
        </div>
      </div>

      <!-- Description -->
      <div class="field-group">
        <label class="field-label">{{ t('products.form.description') }}</label>
        <input class="field-input"
               v-model="form.description"
               type="text"
               :placeholder="t('products.form.descriptionPlaceholder')" />
      </div>

      <!-- QR Code (compact horizontal layout — always responsive) -->
      <div class="field-group">
        <label class="field-label">{{ t('products.form.qrCode') }}</label>
        <div class="qr-inline">
          <div class="qr-preview-box">
            <img :src="qrImageUrl" :alt="form.codeQR" />
          </div>
          <div class="qr-controls">
            <input class="field-input qr-input" v-model="form.codeQR" type="text" placeholder="QR Code" />
            <div class="qr-scanner-row">
              <QrScanner @scanned="onQrScanned" />
              <span class="qr-hint">{{ t('products.form.qrHint') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Price (unit) -->
      <template v-if="isUnit">
        <div class="field-group">
          <label class="field-label">{{ t('products.form.price') }}</label>
          <div class="field-row-valid">
            <div class="input-prefix" :class="{ 'input-prefix--error': form.price == null && (touched.price || submitted) }">
              <span class="prefix-sym">{{ symbol }}</span>
              <input class="field-input prefix-inp"
                     v-model.number="form.price"
                     type="number" step="0.01" min="0"
                     @blur="touched.price = true" />
            </div>
            <span v-if="form.price == null && (touched.price || submitted)" class="v-x">&times;</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">{{ t('products.form.weight') }}</label>
          <input class="field-input"
                 v-model.number="form.weightGrams"
                 type="number" step="1" min="0"
                 placeholder="0" />
        </div>

        <div class="field-group">
          <label class="field-label">{{ t('products.form.brand') }}</label>
          <input class="field-input"
                 v-model="form.brand"
                 type="text"
                 :placeholder="t('products.form.brandPlaceholder')" />
        </div>
      </template>

      <!-- Price per kg (weight) -->
      <template v-else>
        <div class="field-group">
          <label class="field-label">{{ t('products.form.pricePerKg') }}</label>
          <div class="field-row-valid">
            <div class="input-prefix" :class="{ 'input-prefix--error': form.pricePerKg == null && (touched.pricePerKg || submitted) }">
              <span class="prefix-sym">{{ symbol }}</span>
              <input class="field-input prefix-inp"
                     v-model.number="form.pricePerKg"
                     type="number" step="0.01" min="0"
                     @blur="touched.pricePerKg = true" />
            </div>
            <span v-if="form.pricePerKg == null && (touched.pricePerKg || submitted)" class="v-x">&times;</span>
          </div>
        </div>
      </template>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-save" type="submit" :disabled="saving" :class="{ 'btn-save--invalid': !formValid && submitted }">
          {{ saving ? t('form.saving') : t('products.form.save') }}
        </button>
        <span v-if="!formValid && submitted" class="form-incomplete">{{ t('form.incomplete') }}</span>
        <span v-if="saveError" class="form-incomplete">{{ saveError }}</span>
      </div>

    </form>
  </div>
  </teleport>
</template>

<style scoped>

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 15, 18, 0.45);
  backdrop-filter: blur(3px);
  z-index: 2000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2001;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 36px 28px;
  width: min(700px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(12, 15, 18, 0.18);
  scrollbar-width: none;
}
.modal::-webkit-scrollbar { display: none; }

/* ── Header ── */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.modal-title {
  font-family: 'Reddit Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0C0F12;
  margin: 0 0 4px;
}

.modal-subtitle {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.btn-close {
  background: none;
  border: 1px solid #D0D0D0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 13px;
  cursor: pointer;
  color: #0C0F12;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.btn-close:hover { background: #F1F1F1; }

/* ── Field groups ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.field-input {
  border: 1.5px solid #E0E0E0;
  border-radius: 10px;
  padding: 11px 16px;
  font-size: 14px;
  color: #1a1a1a;
  background: #F4F4F4;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input:focus {
  border-color: #F38313;
  box-shadow: 0 0 0 3px rgba(243, 131, 19, 0.12);
}
.field-input--error  { border-color: #FD4444 !important; }
.field-input--locked { color: #888; cursor: default; }

/* ── Type toggle ── */
.type-toggle {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  padding: 9px 28px;
  border: 1.5px solid #D0D0D0;
  border-radius: 999px;
  font-family: 'Reddit Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #F4F4F4;
  color: #666;
  transition: all 0.18s;
}
.toggle-btn:hover { border-color: #F38313; color: #F38313; background: #FFF4EA; }
.toggle-btn.active {
  background: #F38313;
  border-color: #F38313;
  color: #fff;
  box-shadow: 0 2px 10px rgba(243, 131, 19, 0.30);
}
.toggle-btn.active-weight {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}

/* ── QR inline (image left, input right) ── */
.qr-inline {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #F4F4F4;
  border: 1.5px solid #E0E0E0;
  border-radius: 14px;
  padding: 14px;
}

.qr-preview-box {
  flex-shrink: 0;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-preview-box img {
  width: 88px;
  height: 88px;
  object-fit: contain;
  image-rendering: crisp-edges;
}

.qr-controls {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qr-input {
  font-family: monospace;
  font-size: 13px;
  background: #fff;
  border-color: #D0D0D0;
}

.qr-scanner-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-hint {
  font-size: 11px;
  color: #888;
  line-height: 1.4;
}


/* ── Price prefix ── */
.input-prefix {
  display: flex;
  align-items: stretch;
  border: 1.5px solid #E0E0E0;
  border-radius: 10px;
  background: #F4F4F4;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  flex: 1;
}
.input-prefix:focus-within {
  border-color: #F38313;
  box-shadow: 0 0 0 3px rgba(243, 131, 19, 0.12);
}
.input-prefix--error { border-color: #FD4444 !important; }

.prefix-sym {
  padding: 0 12px;
  font-size: 14px;
  color: #888;
  border-right: 1.5px solid #E0E0E0;
  background: #EBEBEB;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.prefix-inp {
  border: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  flex: 1;
  min-width: 0;
  padding: 11px 12px;
}
.prefix-inp:focus {
  border: none !important;
  box-shadow: none !important;
  outline: none;
}

/* ── Footer ── */
.modal-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.btn-save {
  background: #F38313;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 14px 80px;
  font-family: 'Reddit Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(243, 131, 19, 0.32);
}
.btn-save:hover { background: #D97210; transform: translateY(-1px); }
.btn-save:active { transform: scale(0.98); }
.btn-save--invalid {
  background: #FD4444 !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

.form-incomplete {
  font-size: 12px;
  color: #FD4444;
  font-weight: 500;
}

/* ── Validation ── */
.field-row-valid {
  display: flex;
  align-items: center;
  gap: 6px;
}
.field-row-valid .field-input { flex: 1; }

.v-x    { color: #FD4444; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.v-text { color: #FD4444; font-size: 12px; white-space: nowrap; flex-shrink: 0; }

/* ── Responsive ──────────────────────────────────────────────── */

/* Full-screen sheet on phones & small tablets */
@media (max-width: 768px) {
  /* Hide the separate overlay — modal covers everything */
  .overlay { display: none; }

  .modal {
    position: fixed;
    inset: 0;               /* covers full viewport */
    width: 100%;
    height: 100dvh;         /* defined height → overflow-y:auto works */
    max-height: none;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 0;
    padding: 28px 20px 36px;
    transform: none;
    box-shadow: none;
  }

  /* Bigger touch targets for inputs */
  .field-input {
    padding: 14px 16px;
    font-size: 15px;
  }
  .prefix-inp { padding: 14px 12px; }

  .btn-save { width: 100%; padding: 16px 0; font-size: 16px; }
}

@media (max-width: 480px) {
  .modal-title { font-size: 20px; }
  .type-toggle { flex-wrap: wrap; }
  .toggle-btn  { flex: 1; text-align: center; }
}
</style>
