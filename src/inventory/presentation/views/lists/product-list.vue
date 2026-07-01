<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import ProductItem from '@/inventory/presentation/components/product-item.vue';

const { t } = useI18n();
const store  = useInventoryStore();
const router = useRouter();

const searchTerm = ref('');

onMounted(() => {
  store.fetchUnitLots();
  store.fetchWeightLots();
  if (!store.unit_productsLoaded)   store.fetchUnitProducts();
  if (!store.weight_productsLoaded) store.fetchWeightProducts();
});

const allProducts = computed(() => [
  ...store.unit_products,
  ...store.weight_products,
]);

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return allProducts.value;
  return allProducts.value.filter(p =>
    (p.name || '').toLowerCase().includes(term) ||
    (p.description || '').toLowerCase().includes(term)
  );
});

const stockMap = computed(() => {
  const map = {};
  store.unit_lots.forEach(l   => { map[l.productId] = (map[l.productId] || 0) + (l.quantity   || 0); });
  store.weight_lots.forEach(l => { map[l.productId] = (map[l.productId] || 0) + (l.quantityKg || 0); });
  return map;
});

const loading = computed(() => !store.unit_productsLoaded || !store.weight_productsLoaded);

function onEdit(product) {
  const name = product.productType === 'unit'
    ? 'inventory-unit-products-edit'
    : 'inventory-weight-products-edit';
  router.push({ name, params: { id: product.id } });
}

function onDelete(product) {
  if (!window.confirm(t('products.deleteConfirm', { name: product.name }))) return;
  if (product.productType === 'unit') store.deleteUnitProduct(product);
  else store.deleteWeightProduct(product);
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('products.title') }}</h1>
        <p class="page-subtitle">{{ t('products.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <input
          v-model="searchTerm"
          type="text"
          class="search-input"
          :placeholder="t('products.search')"
        />
        <button class="btn-add" @click="$router.push({ name: 'inventory-products-new' })">
          <span class="plus">+</span> {{ t('products.add') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">{{ t('chatbot.page.loading') }}</div>

    <div v-else class="table-card">
      <div class="table-head">
        <span class="col-type">{{ t('products.col.type') }}</span>
        <span>{{ t('products.col.name') }}</span>
        <span>{{ t('products.col.description') }}</span>
        <span class="center">{{ t('products.col.qrCode') }}</span>
        <span class="center">{{ t('products.col.stock') }}</span>
        <span class="center">{{ t('products.col.price') }}</span>
        <span class="center">{{ t('products.col.actions') }}</span>
      </div>

      <div class="table-body">
        <template v-if="allProducts.length === 0">
          <div class="empty-state">{{ t('products.empty') }}</div>
        </template>
        <template v-else-if="filteredProducts.length === 0">
          <div class="empty-state">{{ t('products.noResults') }}</div>
        </template>
        <ProductItem
          v-for="p in filteredProducts"
          :key="p.productType + '-' + p.id"
          :product="p"
          :stock="stockMap[p.id] || 0"
          @edit="onEdit"
          @remove="onDelete"
        />
      </div>
    </div>
  </div>

  <router-view />
</template>

<style scoped>
.page {
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px;
  height: 44px;
  border: 1px solid var(--color-card-border);
  border-radius: 999px;
  background: var(--color-card-bg);
  color: var(--color-text-strong);
  padding: 0 18px;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.search-input::placeholder { color: var(--color-text-muted); }
.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
  white-space: nowrap;
  font-family: inherit;
}
.btn-add:hover  { background: var(--color-primary-hover); }
.btn-add:active { transform: scale(0.97); }
.plus { font-size: 18px; line-height: 1; }

.table-card {
  background: var(--color-card-bg);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}

.table-head {
  display: grid;
  grid-template-columns: 110px 1fr 1fr 90px 100px 90px 96px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-card-border);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.center { text-align: center; }

.empty-state {
  text-align: center;
  padding: 56px 24px;
  color: var(--color-text-muted);
  font-size: 14px;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .search-input { flex: 1; width: auto; min-width: 0; }
  .btn-add { flex-shrink: 0; }

  /* Horizontal scroll for product table */
  .table-card { overflow-x: auto; }
  .table-head {
    grid-template-columns: 100px 1fr 1fr 80px 80px 80px 90px;
    min-width: 620px;
    font-size: 11px;
    padding: 12px 14px;
  }
}

@media (max-width: 600px) {
  .page-title  { font-size: 22px; }
  .header-actions { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .btn-add { width: 100%; justify-content: center; }
  /* Hide table header — items render as cards */
  .table-head  { display: none; }
  .table-card  { overflow-x: visible; border-radius: 14px; }
}
</style>
