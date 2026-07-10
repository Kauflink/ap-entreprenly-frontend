import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { InventoryApi } from "@/inventory/infrastructure/inventory-api.js";
import { UnitProductAssembler } from "@/inventory/infrastructure/unit-product-assembler.js";
import { WeightProductAssembler } from "@/inventory/infrastructure/weight-product-assembler.js";
import { UnitLotAssembler } from "@/inventory/infrastructure/unit-lot-assembler.js";
import { WeightLotAssembler } from "@/inventory/infrastructure/weight-lot-assembler.js";
import { StockAlertAssembler } from "@/inventory/infrastructure/stock-alert-assembler.js";

const inventoryApi = new InventoryApi();

const useInventoryStore = defineStore('inventory', () => {
    const unit_products = ref([]);
    const weight_products = ref([]);
    const unit_lots = ref([]);
    const weight_lots = ref([]);
    const stock_alerts = ref([]);

    const unit_productsLoaded = ref(false);
    const weight_productsLoaded = ref(false);
    const unit_lotsLoaded = ref(false);
    const weight_lotsLoaded = ref(false);
    const stock_alertsLoaded = ref(false);

    const errors = ref([]);

    const unit_products_count = computed(() => unit_productsLoaded.value ? unit_products.value.length : 0);
    const weight_products_count = computed(() => weight_productsLoaded.value ? weight_products.value.length : 0);
    const unit_lots_count = computed(() => unit_lotsLoaded.value ? unit_lots.value.length : 0);
    const weight_lots_count = computed(() => weight_lotsLoaded.value ? weight_lots.value.length : 0);
    const stock_alerts_count = computed(() => stock_alertsLoaded.value ? stock_alerts.value.length : 0);

    // UNIT PRODUCTS

    function fetchUnitProducts() {
        inventoryApi.getUnitProducts().then(response => {
            unit_products.value = UnitProductAssembler.toEntitiesFromResponse(response);
            unit_productsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getUnitProductById(id) {
        return unit_products.value.find(p => p.id === parseInt(id));
    }

    function addUnitProduct(product) {
        return inventoryApi.createUnitProduct(product).then(response => {
            unit_products.value.push(UnitProductAssembler.toEntityFromResource(response.data));
        }).catch(error => { errors.value.push(error); throw error; });
    }

    function updateUnitProduct(product) {
        inventoryApi.updateUnitProduct(product).then(response => {
            const updated = UnitProductAssembler.toEntityFromResource(response.data);
            const index = unit_products.value.findIndex(p => p.id === updated.id);
            if (index !== -1) unit_products.value[index] = updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteUnitProduct(product) {
        inventoryApi.deleteUnitProduct(product.id).then(() => {
            const index = unit_products.value.findIndex(p => p.id === product.id);
            if (index !== -1) unit_products.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

    // WEIGHT PRODUCTS

    function fetchWeightProducts() {
        inventoryApi.getWeightProducts().then(response => {
            weight_products.value = WeightProductAssembler.toEntitiesFromResponse(response);
            weight_productsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getWeightProductById(id) {
        return weight_products.value.find(p => p.id === parseInt(id));
    }

    function addWeightProduct(product) {
        return inventoryApi.createWeightProduct(product).then(response => {
            weight_products.value.push(WeightProductAssembler.toEntityFromResource(response.data));
        }).catch(error => { errors.value.push(error); throw error; });
    }

    function updateWeightProduct(product) {
        inventoryApi.updateWeightProduct(product).then(response => {
            const updated = WeightProductAssembler.toEntityFromResource(response.data);
            const index = weight_products.value.findIndex(p => p.id === updated.id);
            if (index !== -1) weight_products.value[index] = updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteWeightProduct(product) {
        inventoryApi.deleteWeightProduct(product.id).then(() => {
            const index = weight_products.value.findIndex(p => p.id === product.id);
            if (index !== -1) weight_products.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

    // UNIT LOTS

    function fetchUnitLots() {
        inventoryApi.getUnitLots().then(response => {
            unit_lots.value = UnitLotAssembler.toEntitiesFromResponse(response);
            unit_lotsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getUnitLotById(id) {
        return unit_lots.value.find(l => l.id === parseInt(id));
    }

    function addUnitLot(lot) {
        return inventoryApi.createUnitLot(lot).then(response => {
            unit_lots.value.push(UnitLotAssembler.toEntityFromResource(response.data));
        }).catch(error => { errors.value.push(error); console.error('[addUnitLot]', error); });
    }

    function updateUnitLot(lot) {
        return inventoryApi.updateUnitLot(lot).then(response => {
            const updated = UnitLotAssembler.toEntityFromResource(response.data);
            const index = unit_lots.value.findIndex(l => l.id === updated.id);
            if (index !== -1) unit_lots.value[index] = updated;
        }).catch(error => { errors.value.push(error); console.error('[updateUnitLot]', error); });
    }

    function deleteUnitLot(lot) {
        inventoryApi.deleteUnitLot(lot.id).then(() => {
            const index = unit_lots.value.findIndex(l => l.id === lot.id);
            if (index !== -1) unit_lots.value.splice(index, 1);
        }).catch(error => { errors.value.push(error); console.error('[deleteUnitLot]', error); });
    }

    // WEIGHT LOTS

    function fetchWeightLots() {
        inventoryApi.getWeightLots().then(response => {
            weight_lots.value = WeightLotAssembler.toEntitiesFromResponse(response);
            weight_lotsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getWeightLotById(id) {
        return weight_lots.value.find(l => l.id === parseInt(id));
    }

    function addWeightLot(lot) {
        return inventoryApi.createWeightLot(lot).then(response => {
            weight_lots.value.push(WeightLotAssembler.toEntityFromResource(response.data));
        }).catch(error => { errors.value.push(error); console.error('[addWeightLot]', error); });
    }

    function updateWeightLot(lot) {
        return inventoryApi.updateWeightLot(lot).then(response => {
            const updated = WeightLotAssembler.toEntityFromResource(response.data);
            const index = weight_lots.value.findIndex(l => l.id === updated.id);
            if (index !== -1) weight_lots.value[index] = updated;
        }).catch(error => { errors.value.push(error); console.error('[updateWeightLot]', error); });
    }

    function deleteWeightLot(lot) {
        inventoryApi.deleteWeightLot(lot.id).then(() => {
            const index = weight_lots.value.findIndex(l => l.id === lot.id);
            if (index !== -1) weight_lots.value.splice(index, 1);
        }).catch(error => { errors.value.push(error); console.error('[deleteWeightLot]', error); });
    }

    // STOCK ALERTS

    function fetchStockAlerts() {
        inventoryApi.getStockAlerts().then(response => {
            stock_alerts.value = StockAlertAssembler.toEntitiesFromResponse(response);
            stock_alertsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getStockAlertById(id) {
        return stock_alerts.value.find(a => a.id === parseInt(id));
    }

    function addStockAlert(alert) {
        inventoryApi.createStockAlert(alert).then(response => {
            stock_alerts.value.push(StockAlertAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
    }

    function updateStockAlert(alert) {
        inventoryApi.updateStockAlert(alert).then(response => {
            const updated = StockAlertAssembler.toEntityFromResource(response.data);
            const index = stock_alerts.value.findIndex(a => a.id === updated.id);
            if (index !== -1) stock_alerts.value[index] = updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteStockAlert(alert) {
        inventoryApi.deleteStockAlert(alert.id).then(() => {
            const index = stock_alerts.value.findIndex(a => a.id === alert.id);
            if (index !== -1) stock_alerts.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

    return {
        unit_products, weight_products,
        unit_lots, weight_lots,
        stock_alerts, errors,
        unit_productsLoaded, weight_productsLoaded,
        unit_lotsLoaded, weight_lotsLoaded, stock_alertsLoaded,
        unit_products_count, weight_products_count,
        unit_lots_count, weight_lots_count, stock_alerts_count,
        fetchUnitProducts, getUnitProductById, addUnitProduct, updateUnitProduct, deleteUnitProduct,
        fetchWeightProducts, getWeightProductById, addWeightProduct, updateWeightProduct, deleteWeightProduct,
        fetchUnitLots, getUnitLotById, addUnitLot, updateUnitLot, deleteUnitLot,
        fetchWeightLots, getWeightLotById, addWeightLot, updateWeightLot, deleteWeightLot,
        fetchStockAlerts, getStockAlertById, addStockAlert, updateStockAlert, deleteStockAlert,
    };
});

export default useInventoryStore;
