import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { InventoryApi } from "@/inventory/infrastructure/inventory-api.js";
import { ProductAssembler } from "@/inventory/infrastructure/product-assembler.js";
import { UnitProductAssembler } from "@/inventory/infrastructure/unit-product-assembler.js";
import { WeightProductAssembler } from "@/inventory/infrastructure/weight-product-assembler.js";
import { LotAssembler } from "@/inventory/infrastructure/lot-assembler.js";
import { UnitLotAssembler } from "@/inventory/infrastructure/unit-lot-assembler.js";
import { WeightLotAssembler } from "@/inventory/infrastructure/weight-lot-assembler.js";
import { StockAlertAssembler } from "@/inventory/infrastructure/stock-alert-assembler.js";

const inventoryApi = new InventoryApi();

const useInventoryStore = defineStore('inventory', () => {
    const products = ref([]);
    const unit_products = ref([]);
    const weight_products = ref([]);
    const lots = ref([]);
    const unit_lots = ref([]);
    const weight_lots = ref([]);
    const stock_alerts = ref([]);

    const productsLoaded = ref(false);
    const unit_productsLoaded = ref(false);
    const weight_productsLoaded = ref(false);
    const lotsLoaded = ref(false);
    const unit_lotsLoaded = ref(false);
    const weight_lotsLoaded = ref(false);
    const stock_alertsLoaded = ref(false);

    const errors = ref([]);

    const productsCount = computed(() => productsLoaded.value ? products.value.length : 0);
    const unit_products_count = computed(() => unit_productsLoaded.value ? unit_products.value.length : 0);
    const weight_products_count = computed(() => weight_productsLoaded.value ? weight_products.value.length : 0);
    const lots_count = computed(() => lotsLoaded.value ? lots.value.length : 0);
    const unit_lots_count = computed(() => unit_lotsLoaded.value ? unit_lots.value.length : 0);
    const weight_lots_count = computed(() => weight_lotsLoaded.value ? weight_lots.value.length : 0);
    const stock_alerts_count = computed(() => stock_alertsLoaded.value ? stock_alerts.value.length : 0);

    // PRODUCTS

    function fetchProducts() {
        inventoryApi.getProducts().then(response => {
            products.value = ProductAssembler.toEntitiesFromResponse(response);
            productsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getProductById(id) {
        return products.value.find(p => p.id === parseInt(id));
    }

    function addProduct(product) {
        inventoryApi.createProduct(product).then(response => {
            products.value.push(ProductAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
    }

    function updateProduct(product) {
        inventoryApi.updateProduct(product).then(response => {
            const updated = ProductAssembler.toEntityFromResource(response.data);
            const index = products.value.findIndex(p => p.id === updated.id);
            if (index !== -1) products.value[index] = updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteProduct(product) {
        inventoryApi.deleteProduct(product.id).then(() => {
            const index = products.value.findIndex(p => p.id === product.id);
            if (index !== -1) products.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

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
        inventoryApi.createUnitProduct(product).then(response => {
            unit_products.value.push(UnitProductAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
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
        inventoryApi.createWeightProduct(product).then(response => {
            weight_products.value.push(WeightProductAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
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

    // LOTS

    function fetchLots() {
        inventoryApi.getLots().then(response => {
            lots.value = LotAssembler.toEntitiesFromResponse(response);
            lotsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getLotById(id) {
        return lots.value.find(l => l.id === parseInt(id));
    }

    function addLot(lot) {
        inventoryApi.createLot(lot).then(response => {
            lots.value.push(LotAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
    }

    function updateLot(lot) {
        inventoryApi.updateLot(lot).then(response => {
            const updated = LotAssembler.toEntityFromResource(response.data);
            const index = lots.value.findIndex(l => l.id === updated.id);
            if (index !== -1) lots.value[index] = updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteLot(lot) {
        inventoryApi.deleteLot(lot.id).then(() => {
            const index = lots.value.findIndex(l => l.id === lot.id);
            if (index !== -1) lots.value.splice(index, 1);
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
        products, unit_products, weight_products,
        lots, unit_lots, weight_lots,
        stock_alerts, errors,
        productsLoaded, unit_productsLoaded, weight_productsLoaded,
        lotsLoaded, unit_lotsLoaded, weight_lotsLoaded, stock_alertsLoaded,
        productsCount, unit_products_count, weight_products_count,
        lots_count, unit_lots_count, weight_lots_count, stock_alerts_count,
        fetchProducts, getProductById, addProduct, updateProduct, deleteProduct,
        fetchUnitProducts, getUnitProductById, addUnitProduct, updateUnitProduct, deleteUnitProduct,
        fetchWeightProducts, getWeightProductById, addWeightProduct, updateWeightProduct, deleteWeightProduct,
        fetchLots, getLotById, addLot, updateLot, deleteLot,
        fetchUnitLots, getUnitLotById, addUnitLot, updateUnitLot, deleteUnitLot,
        fetchWeightLots, getWeightLotById, addWeightLot, updateWeightLot, deleteWeightLot,
        fetchStockAlerts, getStockAlertById, addStockAlert, updateStockAlert, deleteStockAlert,
    };
});

export default useInventoryStore;
