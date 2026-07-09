import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js'

const salesProductsPath = '/sales-products'
const salesPath         = '/sales'

export class SalesApi extends BaseApi {
    #salesProductsEndpoint
    #salesEndpoint

    constructor() {
        super()
        this.#salesProductsEndpoint = new BaseEndpoint(this, salesProductsPath)
        this.#salesEndpoint         = new BaseEndpoint(this, salesPath)
    }

    // Sellable catalog with each product's stock already computed by the backend (Inventory
    // context), so the client no longer composes products and lots itself.
    getSalesProducts() { return this.#salesProductsEndpoint.getAll() }

    createSale(sale)   { return this.#salesEndpoint.create(sale) }
    getAllSales()      { return this.#salesEndpoint.getAll() }

    getSalesByDate(date) {
        return this.http.get(`${salesPath}?date=${date}`)
    }

    getScaleStatus() { return this.http.get('/iot-scale') }
}
