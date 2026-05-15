<script setup>
import { computed, onMounted } from 'vue';
import useInventoryStore from '@/inventory/application/inventory.store.js';
import StockAlertItem from '@/inventory/presentation/components/stock-alert-item.vue';

const props = defineProps({ productId: { type: Number, default: null } });

const store = useInventoryStore();

onMounted(() => { if (!store.stock_alertsLoaded) store.fetchStockAlerts(); });

const filteredAlerts = computed(() => {
  const all = store.stock_alerts;
  if (props.productId === null) return all;
  return all.filter(a => Number(a.productId) === Number(props.productId));
});
</script>

<template>
  <div v-if="filteredAlerts.length > 0" class="alerts-wrapper">
    <StockAlertItem
        v-for="alert in filteredAlerts"
        :key="alert.id"
        :alert="alert"
    />
  </div>

</template>

<style scoped>
.alerts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

</style>
