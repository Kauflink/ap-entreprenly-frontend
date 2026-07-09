<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js';

const { t } = useI18n();
const { format } = useCurrencyFormatter();
const props = defineProps({
  product: { type: Object, required: true },
  stock:   { type: Number, default: 0 },
});
const emit = defineEmits(['edit', 'remove']);

const isUnit = computed(() => props.product.productType === 'unit');

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(props.product.codeQR || ' ', 54); }
  catch { return ''; }
});

const displayPrice = computed(() => {
  if (isUnit.value) return props.product.price != null ? format(props.product.price) : '-';
  return props.product.pricePerKg != null ? `${format(props.product.pricePerKg)}/kg` : '-';
});
</script>

<template>
  <!-- ── Desktop / tablet row ─────────────────────────────────── -->
  <div class="row">

    <div class="col-type">
      <span v-if="isUnit" class="badge badge--unit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"/><path d="M3 8l9 4 9-4"/><path d="M12 12v8"/></svg>
        {{ t('products.col.byUnit') }}
      </span>
      <span v-else class="badge badge--weight">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
        {{ t('products.col.byWeight') }}
      </span>
    </div>

    <div class="col-name">
      <span class="name">{{ product.name }}</span>
    </div>

    <div class="col-description">
      <span class="description">{{ product.description }}</span>
    </div>

    <div class="col-qr">
      <div class="qr-box">
        <img :src="qrImageUrl" :alt="product.codeQR" :title="product.codeQR" loading="lazy">
      </div>
    </div>

    <div class="col-stock">
      <span class="stock">{{ stock }}</span>
    </div>

    <div class="col-price">
      <span class="price">{{ displayPrice }}</span>
    </div>

    <div class="col-actions">
      <button class="btn-edit" :title="t('products.col.edit')" @click="emit('edit', product)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn-delete" :title="t('products.col.delete')" @click="emit('remove', product)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    </div>

  </div>

  <!-- ── Mobile card ───────────────────────────────────────────── -->
  <div class="card-mobile">
    <div class="card-top">
      <div class="card-name-area">
        <span class="name">{{ product.name }}</span>
        <span v-if="isUnit" class="badge badge--unit">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"/><path d="M3 8l9 4 9-4"/><path d="M12 12v8"/></svg>
          {{ t('products.col.byUnit') }}
        </span>
        <span v-else class="badge badge--weight">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M3 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M17 11l2-4 2 4a2 2 0 0 1-4 0z"/><path d="M4 21h16"/></svg>
          {{ t('products.col.byWeight') }}
        </span>
      </div>
      <div class="card-actions">
        <button class="btn-edit" :title="t('products.col.edit')" @click="emit('edit', product)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-delete" :title="t('products.col.delete')" @click="emit('remove', product)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>

    <p v-if="product.description" class="card-description">{{ product.description }}</p>

    <div class="card-bottom">
      <div class="qr-box">
        <img :src="qrImageUrl" :alt="product.codeQR" :title="product.codeQR" loading="lazy">
      </div>
      <div class="card-stats">
        <div class="stat-item">
          <span class="stat-label">{{ t('products.col.stock') }}</span>
          <span class="stock">{{ stock }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('products.col.price') }}</span>
          <span class="price">{{ displayPrice }}</span>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
:host { display: block; }

.row {
  display: grid;
  grid-template-columns: 110px 1fr 1fr 90px 100px 90px 96px;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-card-border);
  transition: background 0.15s;
}

.row:hover { background: var(--color-inner-bg); }
:host:last-child .row { border-bottom: none; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge--unit   { background: var(--color-primary); color: #fff; font-family: 'Reddit Sans', sans-serif; font-weight: 700; }
.badge--weight { background: var(--color-avatar-bg); color: var(--color-avatar-fg); font-family: 'Reddit Sans', sans-serif; font-weight: 700; }

.col-qr    { display: flex; justify-content: center; }
.col-stock { text-align: center; }
.col-price { text-align: center; }
.col-actions { display: flex; justify-content: center; align-items: center; gap: 8px; }

.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.description {
  font-size: 13px;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.qr-box {
  width: 60px;
  height: 60px;
  background: var(--color-inner-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-box img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  image-rendering: crisp-edges;
}

.stock { font-size: 15px; font-weight: 500; color: var(--color-text-strong); }
.price { font-size: 14px; font-weight: 600; color: var(--color-text-strong); }

.btn-edit {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid var(--color-card-border);
  background: var(--color-card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 0.18s;
}

.btn-edit:hover  { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-theme-btn-active-bg); }
.btn-edit:active { transform: scale(0.94); }

.btn-delete {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid var(--color-card-border);
  background: var(--color-card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 0.18s;
}
.btn-delete:hover  { border-color: var(--color-danger); color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); }
.btn-delete:active { transform: scale(0.94); }

/* ── Hide mobile card on desktop ────────────────────────────── */
.card-mobile { display: none; }
.card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .row {
    grid-template-columns: 100px 1fr 1fr 80px 80px 80px 90px;
    min-width: 620px;
    padding: 12px 14px;
  }
}

@media (max-width: 600px) {
  /* Switch from table row to card */
  .row         { display: none; }
  .card-mobile { display: block; padding: 14px 16px; border-bottom: 1px solid var(--color-card-border); }
  .card-mobile:hover { background: var(--color-inner-bg); }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
  .card-name-area {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
  }
  .card-description {
    font-size: 13px;
    color: var(--color-text-muted);
    margin: 0 0 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-bottom {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .card-stats {
    display: flex;
    gap: 20px;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--color-text-muted);
  }
  .qr-box {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
  .qr-box img {
    width: 40px;
    height: 40px;
  }
}
</style>
