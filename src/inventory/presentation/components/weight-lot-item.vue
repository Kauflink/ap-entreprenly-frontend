<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({ lot: { type: Object, required: true } });
const emit  = defineEmits(['edit', 'delete']);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
</script>

<template>
  <div class="lot-row-card">
    <button class="action-btn edit-square" @click="emit('edit', lot)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>

    <div class="lot-data-grid">
      <div class="data-group">
        <span class="label">#ID</span>
        <span class="value">lot-{{ lot.id }}</span>
      </div>

      <div class="data-group">
        <span class="label">⚖️ {{ t('products.form.weight') }}</span>
        <span class="value">{{ lot.quantityKg }} Kg</span>
      </div>

      <div class="data-group">
        <span class="label">📅 {{ t('lots.form.entryDate') }}</span>
        <span class="value">{{ fmtDate(lot.entryDate) }}</span>
      </div>

      <div class="data-group">
        <span class="label">{{ t('products.col.type') }}</span>
        <span class="value">{{ t('lots.form.byWeight') }}</span>
      </div>

      <div class="data-group qr-group">
        <span class="label">🏁 {{ t('lots.form.qrCode') }}</span>
        <span class="value qr-code">{{ lot.codeQR }}</span>
        <span class="sub-label">({{ t('products.form.qrHint') }})</span>
      </div>
    </div>

    <button class="action-btn delete-circle" @click="emit('delete', lot)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
      </svg>
    </button>
  </div>

</template>

<style scoped>
.lot-row-card {
  display: flex;
  align-items: center;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 20px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  gap: 1.5rem;
  transition: all 0.2s ease;
}

.lot-row-card.expired {
  border-left: 5px solid var(--color-danger);
}

.lot-data-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.2fr 1.2fr 1.5fr;
  align-items: center;
  gap: 1rem;
}

.data-group {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-strong);
}

.qr-code {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.sub-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: transform 0.1s;
}

.edit-square {
  background: var(--color-inner-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-card-border);
  border-radius: 10px;
  width: 42px;
  height: 42px;
}

.delete-circle {
  background: var(--color-danger);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);
}

.action-btn:active {
  transform: scale(0.92);
}

.text-danger {
  color: var(--color-danger);
}

</style>
