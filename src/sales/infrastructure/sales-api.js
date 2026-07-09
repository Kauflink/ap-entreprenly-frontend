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

    /**
     * Fetches the sellable catalog in a single request. The backend returns each product with its
     * stock already computed by the Inventory context, so the client no longer composes products
     * and lots itself.
     */
    getSalesProducts() { return this.#salesProductsEndpoint.getAll() }

    /** Registers a sale; the backend recomputes totals and deducts inventory stock. */
    createSale(sale)   { return this.#salesEndpoint.create(sale) }

    getAllSales()      { return this.#salesEndpoint.getAll() }

    /** Retrieves the sales registered on the given business day (YYYY-MM-DD). */
    getSalesByDate(date) {
        return this.http.get(`${salesPath}?date=${date}`)
    }

    /** Reads the IoT scale connection status used by the weight-entry modal. */
    getScaleStatus() { return this.http.get('/iot-scale') }
}
