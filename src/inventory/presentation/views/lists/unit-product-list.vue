<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import UnitProductItem from '@/inventory/presentation/views/unit-product-item.vue';

const { t } = useI18n();
const store   = useInventoryStore();
const router  = useRouter();
const confirm = useConfirm();

onMounted(() => { if (!store.unit_productsLoaded) store.fetchUnitProducts(); });

function onEdit(product)   { router.push({ name: 'inventory-unit-products-edit', params: { id: product.id } }); }
function onDelete(product) {
  confirm.require({
    message:     t('common.deleteMessage', { name: product.name }),
    header:      t('common.deleteHeader'),
    icon:        'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept:      () => store.deleteUnitProduct(product),
  });
}
</script>

<template>
  <div class="inventory-page">
    <header class="page-header">
      <div>
        <h1>{{ t('pages.unitProducts') }}</h1>
        <p class="subtitle">{{ t('products.subtitle') }}</p>
      </div>
      <button class="btn-add" @click="router.push({ name: 'inventory-unit-products-new' })">
        + {{ t('products.add') }}
      </button>
    </header>

    <div v-if="!store.unit_productsLoaded" class="loading">{{ t('chatbot.page.loading') }}</div>

    <template v-else>
      <div class="table-card">
        <div class="table-head">
          <span>ID</span>
          <span>{{ t('products.col.name') }}</span>
          <span>{{ t('products.col.description') }}</span>
          <span>{{ t('products.col.qrCode') }}</span>
          <span>{{ t('products.col.price') }}</span>
          <span>{{ t('products.form.weight') }}</span>
          <span>{{ t('products.form.brand') }}</span>
          <span>{{ t('products.col.edit') }}</span>
        </div>

        <UnitProductItem
          v-for="p in store.unit_products"
          :key="p.id"
          :product="p"
          @edit="onEdit"
          @delete="onDelete"
        />

        <div v-if="store.unit_products.length === 0" class="empty-state">
          {{ t('products.empty') }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.inventory-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.page-header .subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.btn-add {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-add:hover { background: var(--color-primary-hover); }

.table-card {
  background: var(--color-card-bg);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
}

.table-head {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 100px 90px 80px 100px 80px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-card-border);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
