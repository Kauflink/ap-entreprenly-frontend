<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import QrScanner from '@/inventory/presentation/components/qr-scanner.vue';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();
const route  = useRoute();

const isEdit    = computed(() => !!route.params.id);
const editId    = computed(() => isEdit.value ? Number(route.params.id) : null);
const submitted = ref(false);
const touched   = ref({ name: false, pricePerKg: false });

const form = ref({ name: '', description: '', codeQR: '', pricePerKg: null });

const isValid = computed(() =>
  !!form.value.name && !!form.value.codeQR && form.value.pricePerKg != null
);

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(form.value.codeQR || ' ', 88); }
  catch { return ''; }
});

function populate(p) {
  form.value = {
    name:        p.name        ?? '',
    description: p.description ?? '',
    codeQR:      p.codeQR      ?? '',
    pricePerKg:  p.pricePerKg  ?? null,
  };
}

onMounted(() => {
  if (!store.weight_productsLoaded) store.fetchWeightProducts();
  if (isEdit.value) {
    const p = store.getWeightProductById(editId.value);
    if (p) populate(p);
  } else {
    form.value.codeQR = `WPROD-${Date.now()}`;
  }
});

watch(() => store.weight_productsLoaded, (loaded) => {
  if (loaded && isEdit.value && !form.value.name) {
    const p = store.getWeightProductById(editId.value);
    if (p) populate(p);
  }
});

function close() { router.push({ name: 'inventory-products' }); }
function onQrScanned(value) { form.value.codeQR = value; }

function save() {
  submitted.value = true;
  if (!isValid.value) return;
  const payload = {
    name:        form.value.name,
    description: form.value.description,
    codeQR:      form.value.codeQR,
    pricePerKg:  form.value.pricePerKg,
  };
  if (isEdit.value) store.updateWeightProduct({ ...payload, id: editId.value });
  else              store.addWeightProduct(payload);
  close();
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
        <button class="btn-close" type="button" @click="close">✕</button>
      </div>

      <form @submit.prevent="save" novalidate>

        <!-- Type (locked) -->
        <div class="field-group">
          <label class="field-label">{{ t('products.form.type') }}</label>
          <input class="field-input field-input--locked" :value="t('products.form.byWeight')" readonly />
        </div>

        <!-- Name -->
        <div class="field-group">
          <label class="field-label">{{ t('products.form.name') }}</label>
          <div class="field-row-valid">
            <input class="field-input"
                   v-model="form.name" type="text"
                   :class="{ 'field-input--error': !form.name && (touched.name || submitted) }"
                   :placeholder="t('products.form.namePlaceholder')"
                   @blur="touched.name = true" />
            <template v-if="!form.name && (touched.name || submitted)">
              <span class="v-x">✕</span>
              <span class="v-text">{{ t('form.required') }}</span>
            </template>
          </div>
        </div>

        <!-- Description -->
        <div class="field-group">
          <label class="field-label">{{ t('products.form.description') }}</label>
          <input class="field-input" v-model="form.description" type="text"
                 :placeholder="t('products.form.descriptionPlaceholder')" />
        </div>

        <!-- QR Code -->
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

        <!-- Price per kg -->
        <div class="field-group">
          <label class="field-label">{{ t('products.form.pricePerKg') }}</label>
          <div class="field-row-valid">
            <div class="input-prefix" :class="{ 'input-prefix--error': form.pricePerKg == null && (touched.pricePerKg || submitted) }">
              <span class="prefix-sym">$</span>
              <input class="field-input prefix-inp"
                     v-model.number="form.pricePerKg" type="number" step="0.01" min="0"
                     @blur="touched.pricePerKg = true" />
            </div>
            <span v-if="form.pricePerKg == null && (touched.pricePerKg || submitted)" class="v-x">✕</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-save" type="submit" :class="{ 'btn-save--invalid': !isValid && submitted }">
            {{ t('products.form.save') }}
          </button>
          <span v-if="!isValid && submitted" class="form-incomplete">{{ t('form.incomplete') }}</span>
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.modal-title    { font-family: 'Reddit Sans', sans-serif; font-size: 22px; font-weight: 700; color: #0C0F12; margin: 0 0 4px; }
.modal-subtitle { font-size: 13px; color: #888; margin: 0; }

.btn-close {
  background: none;
  border: 1px solid #D0D0D0;
  border-radius: 50%;
  width: 32px; height: 32px;
  font-size: 13px; cursor: pointer; color: #0C0F12;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; flex-shrink: 0;
}
.btn-close:hover { background: #F1F1F1; }

.field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field-label  { font-size: 14px; font-weight: 600; color: #1a1a1a; }

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
.field-input:focus { border-color: #F38313; box-shadow: 0 0 0 3px rgba(243,131,19,0.12); }
.field-input--error  { border-color: #FD4444 !important; }
.field-input--locked { color: #888; cursor: default; }

/* QR inline */
.qr-inline {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #F4F4F4;
  border: 1.5px solid #E0E0E0;
  border-radius: 14px;
  padding: 14px;
}
.qr-preview-box { flex-shrink: 0; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; }
.qr-preview-box img { width: 88px; height: 88px; object-fit: contain; image-rendering: crisp-edges; }
.qr-controls { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.qr-input { font-family: monospace; font-size: 13px; background: #fff; border-color: #D0D0D0; }
.qr-scanner-row { display: flex; align-items: center; gap: 8px; }
.qr-hint { font-size: 11px; color: #888; line-height: 1.4; }

/* Price prefix */
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
.input-prefix:focus-within { border-color: #F38313; box-shadow: 0 0 0 3px rgba(243,131,19,0.12); }
.input-prefix--error { border-color: #FD4444 !important; }
.prefix-sym {
  padding: 0 12px; font-size: 14px; color: #888;
  border-right: 1.5px solid #E0E0E0; background: #EBEBEB;
  display: flex; align-items: center; flex-shrink: 0;
}
.prefix-inp {
  border: none !important; background: transparent !important;
  border-radius: 0 !important; box-shadow: none !important;
  flex: 1; min-width: 0; padding: 11px 12px;
}
.prefix-inp:focus { border: none !important; box-shadow: none !important; outline: none; }

/* Footer */
.modal-footer { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 4px; }
.btn-save {
  background: #F38313; color: #fff; border: none;
  border-radius: 50px; padding: 14px 80px;
  font-family: 'Reddit Sans', sans-serif; font-size: 17px; font-weight: 700;
  cursor: pointer; transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(243,131,19,0.32);
}
.btn-save:hover { background: #D97210; transform: translateY(-1px); }
.btn-save:active { transform: scale(0.98); }
.btn-save--invalid { background: #FD4444 !important; box-shadow: none !important; cursor: not-allowed; }
.form-incomplete { font-size: 12px; color: #FD4444; font-weight: 500; }

.field-row-valid { display: flex; align-items: center; gap: 6px; }
.field-row-valid .field-input { flex: 1; }
.v-x    { color: #FD4444; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.v-text { color: #FD4444; font-size: 12px; white-space: nowrap; flex-shrink: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .overlay { display: none; }
  .modal {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    max-height: none;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 0;
    padding: 28px 20px 36px;
    transform: none;
    box-shadow: none;
  }
  .field-input { padding: 14px 16px; font-size: 15px; }
  .prefix-inp  { padding: 14px 12px; }
  .btn-save    { width: 100%; padding: 16px 0; font-size: 16px; }
}

@media (max-width: 480px) {
  .modal-title { font-size: 20px; }
}
</style>
