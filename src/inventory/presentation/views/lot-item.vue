<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';

const { t } = useI18n();
const props = defineProps({
  lot: { type: Object, required: true },
});
const emit = defineEmits(['edit', 'delete']);

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(props.lot.codeQR || ' ', 48); }
  catch { return ''; }
});

const isUnit   = computed(() => props.lot.lotType === 'unit');
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString() : '-';

const isExpired = computed(() => {
  if (!props.lot.expiryDate) return false;
  return new Date(props.lot.expiryDate) < new Date();
});

const quantity = computed(() =>
  isUnit.value ? `${props.lot.quantity ?? 0} uds.` : `${props.lot.quantityKg ?? 0} kg`
);
</script>

<template>
  <div class="lot-row-card" :class="{ 'is-expired': isExpired }">

    <div class="edit-action-container">
      <span v-if="isExpired" class="status-badge expired">
        {{ t('stock-alerts.expired') }}
      </span>
      <button class="btn-edit-card" @click="emit('edit', lot)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>

    <div class="lot-data-table">
      <div class="column">
        <span class="col-label">#ID</span>
        <span class="col-value">{{ t('lots.prefix') }}-{{ lot.id }}</span>
      </div>

      <div class="column">
        <div class="label-with-icon">
          <span class="col-label">
            <span v-if="isUnit">{{ t('lots.form.quantity') }}</span>
            <span v-else>{{ t('products.form.weight') }}</span>
          </span>
        </div>
        <span class="col-value">{{ quantity }}</span>
      </div>

      <div class="column">
        <span class="col-label">{{ t('lots.form.entryDate') }}</span>
        <span class="col-value">{{ fmtDate(lot.entryDate) }}</span>
      </div>

      <div v-if="isUnit" class="column">
        <span class="col-label">{{ t('lots.form.expiryDate') }}</span>
        <span class="col-value" :class="{ 'text-danger': isExpired }">{{ fmtDate(lot.expiryDate) }}</span>
      </div>

      <div class="column qr-column">
        <span class="col-label">{{ t('lots.form.qrCode') }}</span>
        <span class="col-value">{{ lot.codeQR }}</span>
        <span class="col-subtext">( {{ t('products.form.qrHint') }} )</span>
      </div>
    </div>

    <button class="btn-delete-card" @click="emit('delete', lot)">
      <span class="material-icons">delete</span>
    </button>
  </div>
</template>

<style scoped>
.lot-row-card {
  display: flex;
  align-items: center;
  background: var(--color-card-bg);
  border: 1.5px solid var(--color-card-border);
  border-radius: 40px;
  padding: 20px 35px;
  margin-bottom: 20px;
  gap: 30px;
  position: relative;
  transition: transform 0.2s ease;
}

.lot-row-card.is-expired {
  border-color: var(--color-danger);
}

.edit-action-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-badge.expired {
  position: absolute;
  top: -12px;
  background-color: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 10px;
  text-transform: capitalize;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(255, 82, 82, 0.3);
}

.btn-edit-card {
  width: 50px;
  height: 50px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.lot-data-table {
  flex: 1;
  display: grid;
  grid-template-columns: 0.6fr 1fr 1fr 1fr 1.5fr;
  align-items: flex-start;
  gap: 15px;
}

.column { display: flex; flex-direction: column; gap: 8px; }

.label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.col-label { font-size: 14px; font-weight: 500; color: var(--color-text-muted); }
.col-value { font-size: 13px; font-weight: 700; color: var(--color-text-strong); padding-left: 2px; }
.col-subtext { font-size: 11px; color: var(--color-text-muted); font-weight: 500; }

.btn-delete-card {
  width: 42px;
  height: 42px;
  background: var(--color-danger);
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 82, 82, 0.4);
}

.btn-delete-card:hover { transform: scale(1.1); }

.text-danger { color: var(--color-danger) !important; }
</style>
