import { BaseApi } from "@/shared/infrastructure/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/base-endpoint.js";

const unitLotEndpointPath = import.meta.env.VITE_UNIT_LOT_ENDPOINT_PATH;
const weightLotEndPointPath = import.meta.env.VITE_WEIGHT_LOT_ENDPOINT_PATH;
const weightProductEndPointPath = import.meta.env.VITE_WEIGHT_PRODUCT_ENDPOINT_PATH;
const unitProductEndPointPath = import.meta.env.VITE_UNIT_PRODUCT_ENDPOINT_PATH;
const stockAlertEndPointPath = import.meta.env.VITE_STOCK_ALERT_ENDPOINT_PATH;

export class InventoryApi extends BaseApi {

    #unitLotEndpoint;
    #weightLotEndpoint;
    #weightProductEndpoint;
    #unitProductEndpoint;
    #stockAlertEndpoint;

    constructor() {
        super();

        this.#unitLotEndpoint = new BaseEndpoint(this, unitLotEndpointPath);
        this.#weightLotEndpoint = new BaseEndpoint(this, weightLotEndPointPath);
        this.#weightProductEndpoint = new BaseEndpoint(this, weightProductEndPointPath);
        this.#unitProductEndpoint = new BaseEndpoint(this, unitProductEndPointPath);
        this.#stockAlertEndpoint = new BaseEndpoint(this, stockAlertEndPointPath);
    }

    // UNIT LOTS

    getUnitLots() {
        return this.#unitLotEndpoint.getAll();
    }

    getUnitLotById(id) {
        return this.#unitLotEndpoint.getById(id);
    }

    createUnitLot(resource) {
        return this.#unitLotEndpoint.create(resource);
    }

    updateUnitLot(resource) {
        return this.#unitLotEndpoint.update(resource.id, resource);
    }

    deleteUnitLot(id) {
        return this.#unitLotEndpoint.delete(id);
    }

    // WEIGHT LOTS

    getWeightLots() {
        return this.#weightLotEndpoint.getAll();
    }

    getWeightLotById(id) {
        return this.#weightLotEndpoint.getById(id);
    }

    createWeightLot(resource) {
        return this.#weightLotEndpoint.create(resource);
    }

    updateWeightLot(resource) {
        return this.#weightLotEndpoint.update(resource.id, resource);
    }

    deleteWeightLot(id) {
        return this.#weightLotEndpoint.delete(id);
    }

    // UNIT PRODUCTS

    getUnitProducts() {
        return this.#unitProductEndpoint.getAll();
    }

    getUnitProductById(id) {
        return this.#unitProductEndpoint.getById(id);
    }

    createUnitProduct(resource) {
        return this.#unitProductEndpoint.create(resource);
    }

    updateUnitProduct(resource) {
        return this.#unitProductEndpoint.update(resource.id, resource);
    }

    deleteUnitProduct(id) {
        return this.#unitProductEndpoint.delete(id);
    }

    // WEIGHT PRODUCTS

    getWeightProducts() {
        return this.#weightProductEndpoint.getAll();
    }

    getWeightProductById(id) {
        return this.#weightProductEndpoint.getById(id);
    }

    createWeightProduct(resource) {
        return this.#weightProductEndpoint.create(resource);
    }

    updateWeightProduct(resource) {
        return this.#weightProductEndpoint.update(resource.id, resource);
    }

    deleteWeightProduct(id) {
        return this.#weightProductEndpoint.delete(id);
    }

    // STOCK ALERTS

    getStockAlerts() {
        return this.#stockAlertEndpoint.getAll();
    }

    getStockAlertById(id) {
        return this.#stockAlertEndpoint.getById(id);
    }

    createStockAlert(resource) {
        return this.#stockAlertEndpoint.create(resource);
    }

    updateStockAlert(resource) {
        return this.#stockAlertEndpoint.update(resource.id, resource);
    }

    deleteStockAlert(id) {
        return this.#stockAlertEndpoint.delete(id);
    }
}