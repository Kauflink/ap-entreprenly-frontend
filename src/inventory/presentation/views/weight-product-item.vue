<script setup>
import { computed } from 'vue';
import { buildQrCodeDataUrl } from '@/inventory/infrastructure/qr_code_generator.js';

const props = defineProps({
  product: { type: Object, required: true },
});
const emit = defineEmits(['edit', 'delete']);

const qrImageUrl = computed(() => {
  try { return buildQrCodeDataUrl(props.product.codeQR || ' ', 54); }
  catch { return ''; }
});
</script>

<template>
  <div class="row">
    <div class="name">{{ product.name }}</div>
    <div class="desc">{{ product.description }}</div>
    <div class="center">${{ Number(product.pricePerKg ?? 0).toFixed(2) }}/kg</div>
    <div class="col-qr">
      <div class="qr-box">
        <img v-if="qrImageUrl" :src="qrImageUrl" :alt="product.codeQR" />
      </div>
    </div>
    <div class="actions">
      <button class="btn-edit" @click="emit('edit', product)" title="Edit">✏</button>
      <button class="btn-delete" @click="emit('delete', product)" title="Delete">✕</button>
    </div>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 1fr 1fr 130px 80px 90px; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--color-card-border); transition: background 0.15s; }
.row:hover { background: var(--color-inner-bg); }
.name  { font-size: 14px; font-weight: 500; color: var(--color-text-strong); }
.desc  { font-size: 13px; color: var(--color-text-muted); }
.center { text-align: center; font-size: 14px; color: var(--color-text-strong); }
.col-qr { display: flex; justify-content: center; }
.qr-box { width: 54px; height: 54px; background: var(--color-inner-bg); border: 1px solid var(--color-card-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.qr-box img { width: 46px; height: 46px; object-fit: contain; image-rendering: crisp-edges; }
.actions { display: flex; gap: 6px; justify-content: center; }
.btn-edit, .btn-delete { width: 32px; height: 32px; border-radius: 7px; border: 1.5px solid var(--color-card-border); background: var(--color-card-bg); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); transition: all 0.18s; font-size: 13px; }
.btn-edit:hover   { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-theme-btn-active-bg); }
.btn-delete:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-light); }
</style>
