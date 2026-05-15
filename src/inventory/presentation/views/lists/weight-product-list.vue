<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import WeightProductItem from '@/inventory/presentation/views/weight-product-item.vue';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();

onMounted(() => { if (!store.weight_productsLoaded) store.fetchWeightProducts(); });

function onEdit(product)   { router.push({ name: 'inventory-weight-products-edit', params: { id: product.id } }); }
function onDelete(product) { if (confirm(`Delete "${product.name}"?`)) store.deleteWeightProduct(product); }
</script>

<template>
  <div class="inventory-page">
    <div class="header">
      <h1>{{ t('products.weightTitle') }}</h1>
      <button class="btn-add" @click="router.push({ name: 'inventory-weight-products-new' })">
        + {{ t('products.add') }}
      </button>
    </div>

    <div class="table-container">
      <div v-if="!store.weight_productsLoaded" class="loading">{{ t('chatbot.page.loading') }}</div>
      <template v-else>
        <WeightProductItem
          v-for="p in store.weight_products"
          :key="p.id"
          :product="p"
          @edit="onEdit"
          @delete="onDelete"
        />
        <div v-if="store.weight_products.length === 0" class="empty-state">
          {{ t('products.empty') }}
        </div>
      </template>
    </div>
  </div>

</template>

<style scoped>
.mat-table {
  width: 100%;
  margin-bottom: 16px;
}

.inventory-page { width: 100%; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0;
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
}

.table-container {
  background: var(--color-card-bg);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
